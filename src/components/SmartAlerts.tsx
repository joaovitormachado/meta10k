import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { formatBRL } from "@/lib/storage";
import { Zap, Target, TrendingUp, Clock, Lightbulb, AlertTriangle, Star, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface SmartAlertsProps {
  saved: number;
  goal: number;
  goalMonthly: number;
  contributions: { amount: number; date: string }[];
  daysSinceStart: number;
  dailyAvg: number;
  monthsLeft: number;
}

const MARCOS = [10, 25, 50, 75, 90, 100];

const SmartAlerts = ({ saved, goal, goalMonthly, contributions, daysSinceStart, dailyAvg, monthsLeft }: SmartAlertsProps) => {
  const alerts = useMemo(() => {
    const newAlerts: { type: "info" | "warning" | "success" | "tip"; icon: React.ReactNode; message: string; action?: () => void }[] = [];
    const pct = (saved / goal) * 100;
    const remaining = goal - saved;

    // Check milestones
    const nextMarco = MARCOS.find(m => m > pct);
    if (nextMarco) {
      const valueForMarco = (nextMarco / 100) * goal;
      const diffForMarco = valueForMarco - saved;
      if (diffForMarco <= remaining * 0.1) {
        alerts.push({
          type: "success",
          icon: <Star className="w-4 h-4" />,
          message: `Você está a ${formatBRL(diffForMarco)} do marco ${nextMarco}%!`,
        });
      }
    }

    // Weekly progress
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const weeklyTotal = contributions
      .filter(c => new Date(c.date) >= thisWeekStart)
      .reduce((sum, c) => sum + c.amount, 0);

    if (weeklyTotal >= goalMonthly / 4) {
      alerts.push({
        type: "success",
        icon: <Zap className="w-4 h-4" />,
        message: `Incrível! Você já guardou ${formatBRL(weeklyTotal)} essa semana!`,
      });
    } else if (goalMonthly > 0) {
      const weeklyTarget = goalMonthly / 4;
      const weeklyRemaining = weeklyTarget - weeklyTotal;
      if (weeklyRemaining > 0) {
        alerts.push({
          type: "warning",
          icon: <Target className="w-4 h-4" />,
          message: `Guarda ${formatBRL(weeklyRemaining)} essa semana para manter o ritmo!`,
        });
      }
    }

    // Projection
    if (monthsLeft > 0 && monthsLeft <= 3) {
      alerts.push({
        type: "info",
        icon: <Clock className="w-4 h-4" />,
        message: `Só mais ${monthsLeft} ${monthsLeft === 1 ? "mês" : "meses"}! Continue assim!`,
      });
    }

    // Daily average
    if (dailyAvg > 0 && daysSinceStart > 7) {
      const projectedMonths = remaining / (dailyAvg * 30);
      if (projectedMonths < monthsLeft && projectedMonths > 0) {
        alerts.push({
          type: "success",
          icon: <TrendingUp className="w-4 h-4" />,
          message: `No seu ritmo atual, você chega lá em ${Math.ceil(projectedMonths)} meses!`,
        });
      }
    }

    return newAlerts;
  }, [saved, goal, goalMonthly, contributions, daysSinceStart, dailyAvg, monthsLeft]);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, index) => (
        <Card
          key={index}
          className={`p-4 flex items-center gap-3 cursor-pointer hover:scale-[1.01] transition-transform ${
            alert.type === "success"
              ? "bg-green-500/10 border-green-500/30"
              : alert.type === "warning"
              ? "bg-yellow-500/10 border-yellow-500/30"
              : alert.type === "info"
              ? "bg-primary/10 border-primary/30"
              : "bg-accent/10 border-accent/30"
          }`}
          onClick={() => {
            if (alert.action) alert.action();
          }}
        >
          <div className={`p-2 rounded-full ${
            alert.type === "success"
              ? "bg-green-500/20 text-green-500"
              : alert.type === "warning"
              ? "bg-yellow-500/20 text-yellow-500"
              : alert.type === "info"
              ? "bg-primary/20 text-primary"
              : "bg-accent/20 text-accent"
          }`}>
            {alert.icon}
          </div>
          <p className="text-sm font-medium flex-1">{alert.message}</p>
        </Card>
      ))}
    </div>
  );
};

interface SmartSuggestionsProps {
  saved: number;
  goal: number;
  goalMonthly: number;
  dailyAvg: number;
  remaining: number;
}

const SmartSuggestions = ({ saved, goal, goalMonthly, dailyAvg, remaining }: SmartSuggestionsProps) => {
  const suggestions = useMemo(() => {
    const items: { icon: React.ReactNode; title: string; impact: string; savings: number | null }[] = [];

    // Extra savings suggestions
    if (dailyAvg > 0) {
      // If save R$50 extra today
      const savingsFrom50 = dailyAvg * 30 * 0.1;
      const daysSavedFrom50 = Math.ceil((remaining - savingsFrom50) / dailyAvg) - Math.ceil(remaining / dailyAvg);
      if (daysSavedFrom50 > 0) {
        items.push({
          icon: <Sparkles className="w-5 h-5" />,
          title: "Guardar R$50 extras essa semana",
          impact: `Acelera em ${daysSavedFrom50} dias`,
          savings: 50,
        });
      }
    }

    // Extra income suggestion
    const weeklyTarget = goalMonthly / 4;
    const currentWeeklyProgress = dailyAvg * 7;
    const gap = weeklyTarget - currentWeeklyProgress;

    if (gap > 0) {
      items.push({
        icon: <Lightbulb className="w-5 h-5" />,
        title: "Fazer 1 renda extra essa semana",
        impact: `Cobre o gap de ${formatBRL(gap)}`,
        savings: null,
      });
    }

    // Sell something
    const avgItemValue = 100;
    const impact = Math.ceil((remaining - avgItemValue) / dailyAvg) - Math.ceil(remaining / dailyAvg);
    if (impact > 0 && impact < 60) {
      items.push({
        icon: <Zap className="w-5 h-5" />,
        title: "Vender algo que não usa",
        impact: `Acelera em ~${impact} dias`,
        savings: avgItemValue,
      });
    }

    // Cut expense
    if (remaining > 0) {
      items.push({
        icon: <AlertTriangle className="w-5 h-5" />,
        title: "Cortar 1 assinatura por um mês",
        impact: `Soma ~R$50 à sua meta`,
        savings: 50,
      });
    }

    return items.slice(0, 3);
  }, [saved, goal, goalMonthly, dailyAvg, remaining]);

  if (suggestions.length === 0) return null;

  return (
    <Card className="p-6 gradient-card shadow-soft border-border/60">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-accent/20 text-accent">
          <Lightbulb className="w-5 h-5" />
        </div>
        <h3 className="font-display text-lg font-bold">Sugestões para acelerar</h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((s, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-3 rounded-xl bg-background/60 border border-border/60 hover:border-primary/30 transition-colors cursor-pointer"
          >
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              {s.icon}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.impact}</p>
            </div>
            {s.savings && (
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{formatBRL(s.savings)}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export { SmartAlerts, SmartSuggestions };