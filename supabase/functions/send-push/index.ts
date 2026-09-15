import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import webpush from "npm:web-push@3.6.7";

type NotificationRow = {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  type: string;
  video_id: string | null;
  comment_id: string | null;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT")!;

webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
);

const headers = {
  "content-type": "application/json",
  "access-control-allow-origin": "*",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers });
}

async function supabase(path: string, init: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

async function deleteSubscription(id: string) {
  await supabase(`push_subscriptions?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

async function sendToSubscription(
  row: { id: string; endpoint: string; p256dh: string | null; auth: string | null },
  payload: string,
) {
  if (!row.p256dh || !row.auth) {
    await deleteSubscription(row.id);
    return { ok: false, stale: true };
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth },
      },
      payload,
      { TTL: 60 * 60 },
    );
    return { ok: true, stale: false };
  } catch (error) {
    const status = Number((error as { statusCode?: number })?.statusCode ?? 0);
    // Browsers commonly return 404/410 when a push subscription is no longer valid.
    if (status === 404 || status === 410) {
      await deleteSubscription(row.id);
      return { ok: false, stale: true };
    }
    console.error("Web Push send failed:", error);
    return { ok: false, stale: false };
  }
}

serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST required" }, 405);

  try {
    const body = await req.json();
    const record = body?.record as NotificationRow | undefined;
    if (!record?.id || !record.recipient_id) {
      return json({ error: "Missing notification record" }, 400);
    }

    const subscriptionsResponse = await supabase(
      `push_subscriptions?user_id=eq.${encodeURIComponent(record.recipient_id)}&select=id,endpoint,p256dh,auth`,
    );

    if (!subscriptionsResponse.ok) {
      const text = await subscriptionsResponse.text();
      return json({ error: "Could not load subscriptions", details: text }, 502);
    }

    const subscriptions = await subscriptionsResponse.json();

    const appUrl = Deno.env.get("TAFATUBE_APP_URL") || SUPABASE_URL;
    const targetUrl = record.video_id
      ? `${appUrl.replace(/\/$/, "")}/?video=${encodeURIComponent(record.video_id)}`
      : appUrl;

    const payload = JSON.stringify({
      title: record.title || "TafaTube",
      body: record.body || "Nouvelle notification",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: `tafatube-${record.id}`,
      data: {
        notificationId: record.id,
        videoId: record.video_id,
        url: targetUrl,
      },
    });

    const results = await Promise.all(
      subscriptions.map((subscription: {
        id: string;
        endpoint: string;
        p256dh: string | null;
        auth: string | null;
      }) => sendToSubscription(subscription, payload)),
    );

    return json({
      success: true,
      notification_id: record.id,
      subscriptions: subscriptions.length,
      sent: results.filter((r: { ok: boolean }) => r.ok).length,
      stale_removed: results.filter((r: { stale: boolean }) => r.stale).length,
    });
  } catch (error) {
    console.error(error);
    return json({ error: "Unexpected server error" }, 500);
  }
});
