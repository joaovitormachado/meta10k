import { Progress } from "@/components/ui/progress";
import { formatBRL } from "@/lib/storage";
import { Sparkles, Trophy, Calendar, TrendingUp, Zap, Target, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  saved: number;
  goal: number;
  goalName?: string;
  goalImage?: string;
  goalMonthly?: number;
  weeklyProgress?: number;
  daysLeft?: number;
}

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

const getProgressMessage = (pct: number) => {
  if (pct === 100) return "Conquistou seu sonho! 🏆";
  if (pct >= 75) return "Quase lá! Continue assim!";
  if (pct >= 50) return "Metade do caminho! Você está incrível!";
  if (pct >= 25) return "Ótimo progresso! Não pare!";
  if (pct >= 10) return "Um ótimo começo!";
  return "Cada centavo conta!";
};

const ProgressHeroPersonalized = ({ saved, goal, goalName, goalImage, goalMonthly = 0, weeklyProgress = 0, daysLeft = 0 }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const pct = Math.min(100, (saved / goal) * 100);
  const remaining = Math.max(0, goal - saved);
  const reached = saved >= goal;
  const greeting = getTimeGreeting();
  const message = getProgressMessage(pct);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const weeklyRemaining = goalMonthly > 0 ? Math.max(0, goalMonthly - weeklyProgress) : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-elegant">
      {/* Background Image */}
      {goalImage && (
        <div className="absolute inset-0 z-0">
          <img 
            src={goalImage} 
            alt={goalName || "Seu objetivo"} 
            className="w-full h-full object-cover opacity-20 blur-sm scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60" />
        </div>
      )}

      {/* Gradient fallback */}
      {!goalImage && <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent z-0" />}

      <div className={`relative z-10 p-8 md:p-12 ${loaded ? "animate-in fade-in duration-500" : ""}`}>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-10 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative z-10 space-y-6">
          {/* Greeting & Goal Name */}
          <div className="space-y-1">
            <p className="text-lg font-medium opacity-90">
              {greeting}! 👋
            </p>
            <div className="flex items-center gap-2">
              {reached ? (
                <Trophy className="w-6 h-6 text-yellow-400" />
              ) : (
                <Sparkles className="w-6 h-6 text-accent" />
              )}
              <h2 className="font-display text-2xl md:text-3xl font-extrabold">
                {goalName ? `Seu objetivo: ${goalName}` : "Sua jornada"}
              </h2>
            </div>
            <p className={`text-lg font-medium ${reached ? "text-yellow-400" : "text-accent"}`}>
              {message}
            </p>
          </div>

          {/* Main Stats */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
                {formatBRL(saved)}
              </h1>
              <span className="text-xl md:text-2xl opacity-80 font-medium">
                de {formatBRL(goal)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Progresso
                </span>
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

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="text-xs text-white/70 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Resta guardar
              </p>
              <p className="text-lg font-bold">{formatBRL(remaining)}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="text-xs text-white/70 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Meses restantes
              </p>
              <p className="text-lg font-bold">{daysLeft > 0 ? daysLeft : "-"}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="text-xs text-white/70 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Meta semanal
              </p>
              <p className="text-lg font-bold">{formatBRL(goalMonthly / 4)}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="text-xs text-white/70 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Essa semana
              </p>
              <p className="text-lg font-bold text-green-400">{formatBRL(weeklyProgress)}</p>
            </div>
          </div>

          {/* CTA */}
          {!reached && weeklyRemaining > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Falta pouco! Guarde <span className="font-bold text-accent">{formatBRL(weeklyRemaining)}</span> essa semana
                </p>
                <p className="text-sm text-white/70">
                  para manter o ritmo da sua jornada
                </p>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          )}

          {reached && (
            <div className="bg-yellow-400/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="font-bold text-xl">🎉 PARABÉNS! VOCÊ CONSEGUI! 🎉</p>
              <p className="text-sm mt-1">Seu sonho foi realizado! Hora de comemorar!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressHeroPersonalized;