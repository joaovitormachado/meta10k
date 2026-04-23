import { useEffect, useMemo, useState } from "react";
import { formatBRL } from "@/lib/storage";
import {
  ContributionRow,
  GoalRow,
  WeeklyChecklistRow,
  fetchContributions,
  fetchCurrentWeekChecklist,
  fetchGoal,
  insertContribution,
  deleteContribution,
  recomputeAndSaveGoal,
  upsertGoal,
  upsertWeeklyChecklist,
  sourceToDb,
  sourceFromDb,
} from "@/lib/supabaseData";
import { supabase } from "@/integrations/supabase/client";
import ProgressHero from "@/components/ProgressHero";
import StatCard from "@/components/StatCard";
import AddDepositDialog from "@/components/AddDepositDialog";
import DepositList from "@/components/DepositList";
import LevelsTrack from "@/components/LevelsTrack";
import DailyActions from "@/components/DailyActions";
import DailyChecklistCard, {
  WeeklyChecklistState,
} from "@/components/DailyChecklistCard";
import Challenge7Days from "@/components/Challenge7Days";
import EvolutionChart from "@/components/EvolutionChart";
import MotivationBanner from "@/components/MotivationBanner";
import FirstResults from "@/components/FirstResults";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Target,
  Flame,
  PiggyBank,
  RotateCcw,
  CalendarDays,
  TrendingUp,
  LogOut,
  Settings2,
  Loader2,
} from "lucide-react";
import type { Deposit } from "@/lib/storage";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState<GoalRow | null>(null);
  const [contributions, setContributions] = useState<ContributionRow[]>([]);
  const [checklist, setChecklist] = useState<WeeklyChecklistRow | null>(null);

  // Goal editor dialog
  const [goalEditOpen, setGoalEditOpen] = useState(false);
  const [editTotal, setEditTotal] = useState("10000");
  const [editMonthly, setEditMonthly] = useState("500");

  const handleLogout = async () => {
    await signOut();
    navigate("/auth", { replace: true });
    toast.success("Até logo! 👋");
  };

  const displayName = profile?.name || user?.email?.split("@")[0] || "";

  // Initial load
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [g, c, wc] = await Promise.all([
          fetchGoal(user.id),
          fetchContributions(user.id),
          fetchCurrentWeekChecklist(user.id),
        ]);
        if (!active) return;
        setGoal(g);
        setContributions(c);
        setChecklist(wc);
        if (g) {
          setEditTotal(String(g.goal_total));
          setEditMonthly(String(g.goal_monthly));
        }
      } catch (e: any) {
        toast.error(e.message ?? "Erro ao carregar dados");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  // Map DB contributions → UI Deposit shape (minimize changes in child components)
  const deposits: Deposit[] = useMemo(
    () =>
      contributions.map((c) => ({
        id: c.id,
        amount: Number(c.amount),
        date: c.date,
        source: sourceFromDb[c.source],
      })),
    [contributions],
  );

  const saved = goal ? Number(goal.amount_saved) : 0;
  const goalTotal = goal ? Number(goal.goal_total) : 10000;
  const goalMonthly = goal ? Number(goal.goal_monthly) : 500;

  const stats = useMemo(() => {
    const remaining = Math.max(0, goalTotal - saved);
    const today = new Date();
    const oldest = contributions.length
      ? new Date(contributions[contributions.length - 1].date)
      : today;
    const daysSinceStart = Math.max(
      1,
      Math.floor((today.getTime() - oldest.getTime()) / 86400000) + 1,
    );
    const dailyAvg = saved / daysSinceStart;

    // ritmo necessário p/ meta mensal
    const dailyTarget = goalMonthly / 30;
    const weeklyTarget = goalMonthly / 4;

    const projectionDays = dailyAvg > 0 ? Math.ceil(remaining / dailyAvg) : 0;
    const projectedDate =
      dailyAvg > 0 ? new Date(today.getTime() + projectionDays * 86400000) : null;

    const dateSet = new Set(deposits.map((d) => d.date));
    let streak = 0;
    const cursor = new Date();
    while (dateSet.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    const monthsLeft = goalMonthly > 0 ? Math.ceil(remaining / goalMonthly) : 0;

    return {
      remaining,
      monthsLeft,
      dailyTarget,
      weeklyTarget,
      monthlyTarget: goalMonthly,
      projectedDate,
      streak,
      dailyAvg,
    };
  }, [contributions, deposits, saved, goalTotal, goalMonthly]);

  const addDeposit = async (
    amount: number,
    _note: string,
    date: string,
    source: "salario" | "renda_extra" | "venda" | "outro",
  ) => {
    if (!user) return;
    try {
      const created = await insertContribution(user.id, amount, sourceToDb[source], date);
      const next = [created, ...contributions].sort((a, b) =>
        b.date.localeCompare(a.date),
      );
      setContributions(next);
      const updated = await recomputeAndSaveGoal(user.id, goalTotal, goalMonthly);
      setGoal(updated);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar aporte");
    }
  };

  const removeDeposit = async (id: string) => {
    if (!user) return;
    try {
      await deleteContribution(id);
      setContributions((prev) => prev.filter((c) => c.id !== id));
      const updated = await recomputeAndSaveGoal(user.id, goalTotal, goalMonthly);
      setGoal(updated);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao remover");
    }
  };

  const saveGoalConfig = async () => {
    if (!user) return;
    const t = parseFloat(editTotal.replace(",", "."));
    const m = parseFloat(editMonthly.replace(",", "."));
    if (!t || t <= 0) return toast.error("Meta total inválida");
    if (!m || m <= 0) return toast.error("Meta mensal inválida");
    try {
      const updated = await recomputeAndSaveGoal(user.id, t, m);
      setGoal(updated);
      setGoalEditOpen(false);
      toast.success("Meta atualizada ✅");
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar meta");
    }
  };

  const toggleChecklist = async (
    key: keyof WeeklyChecklistState,
  ) => {
    if (!user) return;
    const current: WeeklyChecklistState = {
      saved_money: checklist?.saved_money ?? false,
      extra_income: checklist?.extra_income ?? false,
      avoided_unnecessary_expense:
        checklist?.avoided_unnecessary_expense ?? false,
    };
    const next = { ...current, [key]: !current[key] };
    // Optimistic
    setChecklist((prev) => ({
      ...(prev ?? {
        id: "tmp",
        user_id: user.id,
        week_reference: new Date().toISOString().slice(0, 10),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
      ...next,
    }) as WeeklyChecklistRow);
    try {
      const saved = await upsertWeeklyChecklist(user.id, next);
      setChecklist(saved);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar checklist");
    }
  };

  const resetAll = async () => {
    if (!user) return;
    try {
      // Delete all contributions
      const ids = contributions.map((c) => c.id);
      if (ids.length) {
        const { error } = await supabase
          .from("contributions")
          .delete()
          .in("id", ids);
        if (error) throw error;
      }
      setContributions([]);
      const updated = await upsertGoal(user.id, {
        goal_total: 10000,
        goal_monthly: 500,
        amount_saved: 0,
        amount_remaining: 10000,
        progress_percent: 0,
      });
      setGoal(updated);
      setEditTotal("10000");
      setEditMonthly("500");
      toast.success("Tudo zerado! Bora recomeçar 🚀");
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao resetar");
    }
  };

  if (loading || !goal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const checklistValue: WeeklyChecklistState = {
    saved_money: checklist?.saved_money ?? false,
    extra_income: checklist?.extra_income ?? false,
    avoided_unnecessary_expense: checklist?.avoided_unnecessary_expense ?? false,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/60 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl gradient-primary text-primary-foreground shadow-soft">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-extrabold leading-none">
                Sistema 10K
              </h1>
              <p className="text-[11px] text-muted-foreground">
                {displayName ? `Olá, ${displayName}` : `Sua jornada até ${formatBRL(goalTotal)}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGoalEditOpen(true)}
              className="gap-2"
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">Ajustar meta</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Resetar"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Resetar tudo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Remove todos os seus aportes e restaura a meta padrão de R$ 10.000.
                    Não dá pra desfazer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={resetAll}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sim, resetar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Sair"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6">
        {/* HERO + AÇÃO */}
        <section className="space-y-4">
          <ProgressHero saved={saved} goal={goalTotal} />
          <AddDepositDialog onAdd={addDeposit} />
          <MotivationBanner saved={saved} goal={goalTotal} />
        </section>

        {/* NÍVEIS */}
        <LevelsTrack saved={saved} goal={goalTotal} />

        {/* STATS */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            label="Falta"
            value={formatBRL(stats.remaining)}
            icon={Target}
            accent="primary"
            hint={
              stats.monthsLeft
                ? `≈ ${stats.monthsLeft} ${stats.monthsLeft === 1 ? "mês" : "meses"}`
                : undefined
            }
          />
          <StatCard
            label="Meta semanal"
            value={formatBRL(stats.weeklyTarget)}
            icon={CalendarDays}
            accent="gold"
            hint={`≈ ${formatBRL(stats.dailyTarget)}/dia`}
          />
          <StatCard
            label="Meta mensal"
            value={formatBRL(stats.monthlyTarget)}
            icon={TrendingUp}
            accent="primary"
            hint="ritmo necessário"
          />
          <StatCard
            label="Sequência"
            value={`${stats.streak} ${stats.streak === 1 ? "dia" : "dias"}`}
            icon={Flame}
            accent="gold"
            hint={
              stats.projectedDate
                ? `meta em ${stats.projectedDate.toLocaleDateString("pt-BR")}`
                : "no ritmo atual"
            }
          />
        </section>

        {/* AÇÃO + CHECKLIST */}
        <section className="grid lg:grid-cols-2 gap-4 md:gap-6">
          <DailyActions />
          <DailyChecklistCard value={checklistValue} onToggle={toggleChecklist} />
        </section>

        {/* RESULTADO + DESAFIO */}
        <section className="grid lg:grid-cols-2 gap-4 md:gap-6">
          <FirstResults deposits={deposits} />
          <Challenge7Days />
        </section>

        {/* EVOLUÇÃO + HISTÓRICO */}
        <section className="grid lg:grid-cols-2 gap-4 md:gap-6">
          <EvolutionChart deposits={deposits} goal={goalTotal} />
          <DepositList deposits={deposits} onRemove={removeDeposit} />
        </section>

        <footer className="text-center text-xs text-muted-foreground pt-4 pb-8">
          Seus dados ficam salvos com segurança na sua conta. Cada aporte conta 💪
        </footer>
      </main>

      {/* Goal edit dialog */}
      <Dialog open={goalEditOpen} onOpenChange={setGoalEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Ajustar meta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="total">Meta total (R$)</Label>
              <Input
                id="total"
                inputMode="decimal"
                value={editTotal}
                onChange={(e) => setEditTotal(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly">Meta mensal (R$)</Label>
              <Input
                id="monthly"
                inputMode="decimal"
                value={editMonthly}
                onChange={(e) => setEditMonthly(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setGoalEditOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={saveGoalConfig}
              className="gradient-primary text-primary-foreground"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
