import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type GoalRow = Database["public"]["Tables"]["goals"]["Row"];
export type ContributionRow = Database["public"]["Tables"]["contributions"]["Row"];
export type WeeklyChecklistRow = Database["public"]["Tables"]["weekly_checklists"]["Row"];
export type ContributionSource = Database["public"]["Enums"]["contribution_source"];

// Map UI source → DB enum
export const sourceToDb: Record<string, ContributionSource> = {
  salario: "salary",
  renda_extra: "extra_income",
  venda: "sale",
  outro: "other",
};

export const sourceFromDb: Record<ContributionSource, "salario" | "renda_extra" | "venda" | "outro"> = {
  salary: "salario",
  extra_income: "renda_extra",
  sale: "venda",
  other: "outro",
};

// Get current week reference (Monday) as YYYY-MM-DD
export const currentWeekRef = (): string => {
  const d = new Date();
  const day = d.getDay(); // 0 sun .. 6 sat
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
};

export async function fetchGoal(userId: string) {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertGoal(userId: string, patch: Partial<GoalRow>) {
  const { data, error } = await supabase
    .from("goals")
    .upsert({ user_id: userId, ...patch }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchContributions(userId: string) {
  const { data, error } = await supabase
    .from("contributions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function insertContribution(
  userId: string,
  amount: number,
  source: ContributionSource,
  date: string,
) {
  const { data, error } = await supabase
    .from("contributions")
    .insert({ user_id: userId, amount, source, date })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteContribution(id: string) {
  const { error } = await supabase.from("contributions").delete().eq("id", id);
  if (error) throw error;
}

export async function recomputeAndSaveGoal(
  userId: string,
  goalTotal: number,
  goalMonthly: number,
) {
  const { data: rows, error } = await supabase
    .from("contributions")
    .select("amount")
    .eq("user_id", userId);
  if (error) throw error;
  const saved = (rows ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const remaining = Math.max(0, goalTotal - saved);
  const pct = goalTotal > 0 ? Math.min(100, (saved / goalTotal) * 100) : 0;
  return upsertGoal(userId, {
    goal_total: goalTotal,
    goal_monthly: goalMonthly,
    amount_saved: saved,
    amount_remaining: remaining,
    progress_percent: pct,
  });
}

export async function fetchCurrentWeekChecklist(userId: string) {
  const week = currentWeekRef();
  const { data, error } = await supabase
    .from("weekly_checklists")
    .select("*")
    .eq("user_id", userId)
    .eq("week_reference", week)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertWeeklyChecklist(
  userId: string,
  patch: Partial<WeeklyChecklistRow>,
) {
  const week = currentWeekRef();
  const { data, error } = await supabase
    .from("weekly_checklists")
    .upsert(
      { user_id: userId, week_reference: week, ...patch },
      { onConflict: "user_id,week_reference" },
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}
