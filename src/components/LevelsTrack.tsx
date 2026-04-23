import { Card } from "@/components/ui/card";
import { LEVELS, formatBRL, getCurrentLevel } from "@/lib/storage";
import { Check } from "lucide-react";

interface Props {
  saved: number;
  goal: number;
}

const LevelsTrack = ({ saved, goal }: Props) => {
  const { next, scaled } = getCurrentLevel(saved, goal);

  return (
    <Card className="p-6 gradient-card shadow-soft border-border/60">
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-xl font-bold">Seus níveis</h2>
          <p className="text-xs text-muted-foreground">
            {next
              ? `Próximo: ${next.label} • ${formatBRL(next.value - saved)} restantes`
              : "Você desbloqueou todos os níveis 🎉"}
          </p>
        </div>
      </div>

      <div className="relative">
        {/* Linha de fundo */}
        <div className="absolute top-5 left-0 right-0 h-1.5 bg-muted rounded-full" />
        {/* Linha preenchida */}
        <div
          className="absolute top-5 left-0 h-1.5 gradient-primary rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(100, (saved / goal) * 100)}%`,
          }}
        />

        <ol className="relative grid grid-cols-5 gap-1">
          {scaled.map((lvl, i) => {
            const reached = saved >= lvl.value;
            return (
              <li key={i} className="flex flex-col items-center text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold border-2 transition-smooth z-10 ${
                    reached
                      ? "gradient-primary text-primary-foreground border-transparent shadow-glow"
                      : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  {reached ? <Check className="w-5 h-5" /> : <span>{LEVELS[i].emoji}</span>}
                </div>
                <p className={`mt-2 text-[11px] font-semibold leading-tight ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                  {LEVELS[i].label}
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
