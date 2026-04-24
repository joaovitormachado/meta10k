import { Card } from "@/components/ui/card";
import { LEVELS, formatBRL, getCurrentLevel } from "@/lib/storage";
import { Check } from "lucide-react";

interface Props {
  saved: number;
  goal: number;
  goalName?: string;
}

const getPersonalizedLevels = (goal: number) => {
  const percentages = [10, 25, 50, 75, 100];
  return percentages.map((pct) => ({
    value: (pct / 100) * goal,
    label: pct === 100 ? "Conquista" : pct === 75 ? "Quase lá" : pct === 50 ? "Metade" : pct === 25 ? "Um quarto" : "Início",
    emoji: pct === 100 ? "🏆" : pct === 75 ? "🔥" : pct === 50 ? "⚡" : pct === 25 ? "🌱" : "🌱"
  }));
};

const LevelsTrack = ({ saved, goal, goalName }: Props) => {
  const personalizedLevels = getPersonalizedLevels(goal);
  const percentages = [10, 25, 50, 75, 100];
  const nextPercent = percentages.find(p => (saved / goal) * 100 < p);
  const nextValue = nextPercent ? (nextPercent / 100) * goal : null;

  return (
    <Card className="p-6 gradient-card shadow-soft border-border/60">
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-xl font-bold">Sua jornada</h2>
          <p className="text-xs text-muted-foreground">
            {nextValue
              ? `Próximo marco • ${formatBRL(nextValue - saved)} restantes`
              : "Parabéns! Você conseguiu! 🎉"}
          </p>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
        <div className="absolute top-5 left-0 right-0 h-1.5 bg-muted rounded-full" />
        <div
          className="absolute top-5 left-0 h-1.5 gradient-primary rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(100, (saved / goal) * 100)}%`,
          }}
        />

        <ol className="relative flex justify-between min-w-[500px] md:min-w-0 md:grid md:grid-cols-5 gap-1">
          {personalizedLevels.map((lvl, i) => {
            const reached = saved >= lvl.value;
            return (
              <li key={i} className="flex flex-col items-center text-center px-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold border-2 transition-smooth z-10 ${
                    reached
                      ? "gradient-primary text-primary-foreground border-transparent shadow-glow"
                      : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  {reached ? <Check className="w-5 h-5" /> : <span>{lvl.emoji}</span>}
                </div>
                <p className={`mt-2 text-[11px] font-semibold leading-tight ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                  {lvl.label}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatBRL(lvl.value)}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </Card>
  );
};

export default LevelsTrack;