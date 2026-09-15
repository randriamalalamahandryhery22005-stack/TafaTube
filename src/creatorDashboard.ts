import { supabase } from "./lib/supabase";

export type CreatorStats = {
  videos:number; views:number; likes:number; comments:number;
  shares:number; subscribers:number; storage_bytes:number;
};

export async function getCreatorDashboard(userId: string): Promise<CreatorStats> {
  const { data, error } = await supabase.rpc("get_creator_dashboard", {
    p_owner_id: userId,
  });
  if (error) throw error;
  return (data ?? {
    videos:0, views:0, likes:0, comments:0, shares:0,
    subscribers:0, storage_bytes:0,
  }) as CreatorStats;
}
