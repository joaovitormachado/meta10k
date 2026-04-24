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
import ProgressHeroPersonalized from "@/components/ProgressHeroPersonalized";
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
import { SmartAlerts, SmartSuggestions } from "@/components/SmartAlerts";
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
import type { Deposit, DepositSource } from "@/lib/storage";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { profile, user, signOut, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState<GoalRow | null>(null);
  const [contributions, setContributions] = useState<ContributionRow[]>([]);
  const [checklist, setChecklist] = useState<WeeklyChecklistRow | null>(null);

  // Goal editor dialog
  const [goalEditOpen, setGoalEditOpen] = useState(false);
  const [editTotal, setEditTotal] = useState("");
  const [editMonthly, setEditMonthly] = useState("");
  const [editMonths, setEditMonths] = useState("12");

  const handleLogout = async () => {
    await signOut();
    navigate("/auth", { replace: true });
    toast.success("Até logo! 👋");
  };

  // CORE DATA - ABSOLUTELY REAL DATA ONLY
  const goalTotal = Number(profile?.goal_target_value);
  const goalName = profile?.goal_name || "";
  const goalImage = profile?.goal_image_url || "";
  const deadlineMonths = goal?.deadline_months ? Number(goal.deadline_months) : 12;
  const goalMonthly = goalTotal / deadlineMonths;
  const displayName = profile?.name || user?.email?.split("@")[0] || (isAdmin ? "Administrador" : "");

  // Initial load
  useEffect(() => {
    if (!user || authLoading) return;
    
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
        
        // Sync editor with profile data
        setEditTotal(String(goalTotal));
        setEditMonths(String(g?.deadline_months || 12));
      } catch (e: any) {
        if (!isAdmin) toast.error("Erro ao carregar dados");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, isAdmin, authLoading, goalTotal]);

  // Map DB contributions → UI Deposit shape
  const deposits: Deposit[] = useMemo(
    () =>
      contributions.map((row) => ({
        id: row.id,
        amount: Number(row.amount),
        date: row.date,
        source: sourceFromDb[row.source],
      })),
    [contributions],
  );

  // Goal calculations
  const saved = (contributions ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  
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

    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const weeklyProgress = contributions
      .filter(row => new Date(row.date) >= thisWeekStart)
      .reduce((sum, row) => sum + Number(row.amount), 0);

    const dailyTarget = goalMonthly / 30;
    const weeklyTarget = goalMonthly / 4;

    const monthsLeft = goalMonthly > 0 ? Math.ceil(remaining / goalMonthly) : 0;

    // Calculate streak
    let streak = 0;
    if (contributions.length > 0) {
      const dates = Array.from(new Set(contributions.map(row => row.date.split("T")[0]))).sort().reverse();
      const todayStr = new Date().toISOString().split("T")[0];
      let checkDate = new Date(todayStr);
      
      // If no contribution today, check if there was one yesterday to keep the streak alive
      const hasToday = dates.includes(todayStr);
      if (!hasToday) {
        checkDate.setDate(checkDate.getDate() - 1);
      }
      
      for (const dateStr of dates) {
        const dStr = checkDate.toISOString().split("T")[0];
        if (dates.includes(dStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return {
      remaining,
      monthsLeft,
      dailyTarget,
      weeklyTarget,
      monthlyTarget: goalMonthly,
      dailyAvg,
      weeklyProgress,
      daysSinceStart,
      streak,
    };
  }, [contributions, saved, goalTotal, goalMonthly]);

  const saveGoalConfig = async () => {
    if (!user || isAdmin) return;
    const t = parseFloat(editTotal.replace(",", "."));
    const m = parseInt(editMonths);
    if (!t || t <= 0) return toast.error("Meta total inválida");
    const monthly = t / m;
    try {
      const updated = await recomputeAndSaveGoal(user.id, t, monthly, m);
      
      await supabase
        .from("profiles")
        .update({ goal_target_value: t })
        .eq("id", user.id);

      setGoal(updated);
      setGoalEditOpen(false);
      toast.success("Meta atualizada ✅");
    } catch (e: any) {
      toast.error("Erro ao salvar meta");
    }
  };

  const addDeposit = async (amount: number, _note: string, date: string, source: DepositSource) => {
    if (!user || isAdmin) return;
    try {
      const created = await insertContribution(user.id, amount, sourceToDb[source], date);
      setContributions(prev => [created, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
      const updated = await recomputeAndSaveGoal(user.id, goalTotal, goalMonthly, deadlineMonths);
      setGoal(updated);
    } catch (e: any) {
      toast.error("Erro ao salvar aporte");
    }
  };

  const removeDeposit = async (id: string) => {
    if (!user || isAdmin) return;
    try {
      await deleteContribution(id);
      setContributions((prev) => prev.filter((c) => c.id !== id));
      const updated = await recomputeAndSaveGoal(user.id, goalTotal, goalMonthly, deadlineMonths);
      setGoal(updated);
    } catch (e: any) {
      toast.error("Erro ao remover");
    }
  };

  const toggleChecklist = async (key: keyof WeeklyChecklistState) => {
    if (!user || isAdmin) return;
    const current: WeeklyChecklistState = {
      saved_money: checklist?.saved_money ?? false,
      extra_income: checklist?.extra_income ?? false,
      avoided_unnecessary_expense: checklist?.avoided_unnecessary_expense ?? false,
    };
    const next = { ...current, [key]: !current[key] };
    
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
      toast.error("Erro ao salvar checklist");
    }
  };

  const resetAll = async () => {
    if (!user || isAdmin) return;
    try {
      // 1. Apagar contribuições
      await supabase.from("contributions").delete().eq("user_id", user.id);
      
      // 2. Apagar meta da tabela goals
      await supabase.from("goals").delete().eq("user_id", user.id);
      
      // 3. Limpar perfil para forçar o Onboarding
      await supabase
        .from("profiles")
        .update({ 
          goal_name: null, 
          goal_target_value: null, 
          goal_image_url: null 
        })
        .eq("id", user.id);

      toast.success("Tudo zerado!");
      
      // Recarregar a página forçará o OnboardingGate a rodar novamente
      window.location.reload();
    } catch (e: any) {
      toast.error("Erro ao resetar");
    }
  };

  if (loading || authLoading) {
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
                {displayName ? `Olá, ${displayName}` : `Sua jornada`}
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
                    Remove todos os seus aportes e sua meta atual.
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
        {/* HERO PERSONALIZADO */}
        <section className="space-y-4">
          <ProgressHeroPersonalized
            saved={saved}
            goal={goalTotal}
            goalName={goalName}
            goalImage={goalImage}
            goalMonthly={goalMonthly}
            weeklyProgress={stats.weeklyProgress}
            daysLeft={stats.monthsLeft}
          />
          <AddDepositDialog onAdd={addDeposit} />
        </section>

        {/* ALERTAS INTELIGENTES */}
        {!isAdmin && (
          <SmartAlerts
            saved={saved}
            goal={goalTotal}
            goalMonthly={goalMonthly}
            contributions={contributions.map(c => ({ amount: Number(c.amount), date: c.date }))}
            daysSinceStart={stats.daysSinceStart}
            dailyAvg={stats.dailyAvg}
            monthsLeft={stats.monthsLeft}
          />
        )}

        {/* SUGESTOES INTELIGENTES */}
        {!isAdmin && (
          <SmartSuggestions
            saved={saved}
            goal={goalTotal}
            goalMonthly={goalMonthly}
            dailyAvg={stats.dailyAvg}
            remaining={stats.remaining}
          />
        )}

        {/* NÍVEIS */}
        <LevelsTrack saved={saved} goal={goalTotal} goalName={goalName} />

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
              <Label htmlFor="months">Prazo (meses)</Label>
              <Input
                id="months"
                inputMode="numeric"
                value={editMonths}
                onChange={(e) => setEditMonths(e.target.value)}
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
