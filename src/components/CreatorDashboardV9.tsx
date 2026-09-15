import { useEffect, useMemo, useState } from "react";
import { BarChart3, Eye, Heart, MessageCircle, Share2, Users, HardDrive, ListVideo } from "lucide-react";
import { supabase } from "../lib/supabase";
import { getCreatorDashboard } from "../creatorDashboard";

type Stats = {
  videos:number; views:number; likes:number; comments:number;
  shares:number; subscribers:number; storage_bytes:number;
};

export default function CreatorDashboardV9({ userId }: { userId: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const data = await getCreatorDashboard(userId);
      if (active) {
        setStats(data);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [userId]);

  const cards = useMemo(() => {
    if (!stats) return [];
    return [
      { label:"Vidéos", value:stats.videos, icon:ListVideo },
      { label:"Vues", value:stats.views, icon:Eye },
      { label:"J’aime", value:stats.likes, icon:Heart },
      { label:"Commentaires", value:stats.comments, icon:MessageCircle },
      { label:"Partages", value:stats.shares, icon:Share2 },
      { label:"Abonnés", value:stats.subscribers, icon:Users },
    ];
  }, [stats]);

  if (loading) return <div className="p-6 text-sm opacity-70">Chargement du Studio…</div>;

  return (
    <section className="space-y-5">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3"><BarChart3 size={22}/></div>
          <div>
            <h2 className="text-xl font-semibold">Creator Studio</h2>
            <p className="text-sm opacity-65">Vue d’ensemble de votre chaîne TafaTube.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map(({label,value,icon:Icon}) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <Icon size={18} className="mb-3 opacity-70"/>
            <div className="text-2xl font-bold">{value.toLocaleString()}</div>
            <div className="text-xs opacity-60">{label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive size={18}/>
          <h3 className="font-semibold">Stockage vidéo</h3>
        </div>
        <div className="text-2xl font-bold">
          {(((stats?.storage_bytes ?? 0) / 1024 / 1024 / 1024)).toFixed(2)} Go
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 rounded-full bg-current opacity-70"/>
        </div>
        <p className="mt-2 text-xs opacity-55">Suivi global de l’espace utilisé par vos vidéos.</p>
      </div>
    </section>
  );
}
