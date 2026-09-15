# TafaTube — Push Server (Dingana 8)

Ity Edge Function ity no mandefa **Web Push** rehefa misy `notifications` vaovao.

## 1. Secrets

Aza apetraka ao amin'ny frontend mihitsy ny VAPID private key.

Mametraha secrets ao amin'ny Supabase:

```bash
supabase secrets set \
  VAPID_PUBLIC_KEY="YOUR_PUBLIC_KEY" \
  VAPID_PRIVATE_KEY="YOUR_PRIVATE_KEY" \
  VAPID_SUBJECT="mailto:admin@example.com" \
  TAFATUBE_APP_URL="https://your-tafatube-domain.com"
```

`SUPABASE_URL` sy `SUPABASE_SERVICE_ROLE_KEY` dia omen'ny Supabase Edge Functions environment.

## 2. Deploy

```bash
supabase functions deploy send-push --no-verify-jwt
```

Ny function dia natao handray webhook avy amin'ny Supabase. Ny webhook ihany no tokony hahafantatra ny URL-ny.

## 3. Database Webhook

Ao amin'ny Supabase Dashboard:

Database → Webhooks → Create webhook

- Name: `tafatube-notification-push`
- Table: `public.notifications`
- Events: `INSERT`
- Type: `HTTP Request`
- Method: `POST`
- URL:

```text
https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-push
```

Avelao handefa ny JSON record/new row payload ny webhook.

Ny tanjona dia:

```text
Like / Comment / Subscribe
        ↓
notifications INSERT
        ↓
Supabase Database Webhook
        ↓
send-push Edge Function
        ↓
push_subscriptions
        ↓
Web Push
        ↓
Phone / Browser notification
```

## 4. Frontend

Ny frontend dia mampiasa `VITE_VAPID_PUBLIC_KEY` ihany.

Ny private key dia **tsy tokony** hiseho ao:
- `.env` frontend
- React/TypeScript source
- browser bundle
- GitHub repository

## 5. Stale subscriptions

Raha miverina `404` na `410` ny push provider, dia fafan'ilay function ho azy ilay subscription efa lany/invalid.

## 6. Fepetra

Background push dia mila:
- HTTPS
- notification permission = granted
- Service Worker miasa
- browser/OS manohana Web Push
- user efa nisoratra tamin'ny push
- VAPID keys voapetraka
- Edge Function + webhook miasa

Tsy mila misokatra foana ny TafaTube rehefa tena Web Push no ampiasaina.
