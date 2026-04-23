import { Progress } from "@/components/ui/progress";
import { formatBRL } from "@/lib/storage";
import { Sparkles, Target, TrendUp, Trophy, Zap } from "lucide-react";

interface Props {
  saved: number;
  goal: number;
  goalName?: string;
  goalImage?: string;
  monthlyTarget?: number;
}

const ProgressHero = ({ saved, goal, goalName, goalImage, monthlyTarget }: Props) => {
  const pct = Math.min(100, (saved / goal) * 100);
  const remaining = Math.max(0, goal - saved);
  const reached = saved >= goal;
  const weeklyNeeded = monthlyTarget ? monthlyTarget / 4 : remaining / 10;

  return (
    <div className="relative overflow-hidden rounded-3xl gradient-hero shadow-elegant text-primary-foreground">
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-10 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative z-10">
        {!reached ? (
          <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8">
            <div className="flex-shrink-0">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20">
                <img
                  src={goalImage || "https://images.unsplash.com/photo-1579621970563-eb002756a337?w=400&h=300&fit=crop"}
                  alt={goalName || "Objetivo"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium opacity-90">
                <Target className="w-4 h-4" />
                <span>Seu objetivo: <span className="font-bold">{goalName || "Seu sonho"}</span></span>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight">
                    {formatBRL(saved)}
                  </h1>
                  <span className="text-lg md:text-xl opacity-80 font-medium">
                    de {formatBRL(goal)}
                  </span>
                </div>
                <p className="text-base md:text-lg opacity-90">
                  Faltam <span className="font-bold">{formatBRL(remaining)}</span> para realizar seu {goalName || "sonho"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Progresso</span>
                  <span>{pct.toFixed(1)}%</span>
                </div>
                <div className="relative">
                  <Progress value={pct} className="h-3 bg-white/20" />
                  <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    <div className="animate-shine h-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 flex flex-col items-end gap-2">
              <div className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1.5 rounded-full">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>~{formatBRL(weeklyNeeded)} essa semana</span>
              </div>
              <p className="text-xs text-right opacity-70">
                Já poupou para seu {goalName} hoje?
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 md:p-12 text-center space-y-6">
            <div className="mx-auto w-32 h-32 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-yellow-400">
              <img
                src={goalImage || "https://images.unsplash.com/photo-1579621970563-eb002756a337?w=400&h=300&fit=crop"}
                alt={goalName || "Objetivo"}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-300" />
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                parabéns! Você conseguiu!
              </h2>
            </div>

            <div className="space-y-2">
              <p className="text-6xl md:text-7xl font-display font-extrabold">
                {formatBRL(saved)}
              </p>
              <p className="text-xl opacity-90">
                Você realizou seu <span className="font-bold">{goalName}</span>!
              </p>
            </div>

            <div className="inline-flex items-center gap-2 bg-yellow-400/20 px-4 py-2 rounded-full">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="font-medium">Hora de celebrar! 🎉</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressHero;