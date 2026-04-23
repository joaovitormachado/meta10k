import { Progress } from "@/components/ui/progress";
import { formatBRL } from "@/lib/storage";
import { Sparkles, Trophy } from "lucide-react";

interface Props {
  saved: number;
  goal: number;
}

const ProgressHero = ({ saved, goal }: Props) => {
  const pct = Math.min(100, (saved / goal) * 100);
  const remaining = Math.max(0, goal - saved);
  const reached = saved >= goal;

  return (
    <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 md:p-12 shadow-elegant text-primary-foreground">
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-10 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-2 text-sm font-medium opacity-90">
          {reached ? <Trophy className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          <span>{reached ? "Meta conquistada!" : "Sua jornada para R$ 10.000"}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight">
              {formatBRL(saved)}
            </h1>
            <span className="text-xl md:text-2xl opacity-80 font-medium">
              de {formatBRL(goal)}
            </span>
          </div>
          <p className="text-base md:text-lg opacity-90">
            {reached
              ? "Você alcançou sua meta. Hora de comemorar 🎉"
              : `Faltam ${formatBRL(remaining)} para conquistar seu objetivo.`}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Progresso</span>
            <span>{pct.toFixed(1)}%</span>
          </div>
          <div className="relative">
            <Progress value={pct} className="h-4 bg-white/20" />
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div className="animate-shine h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressHero;
