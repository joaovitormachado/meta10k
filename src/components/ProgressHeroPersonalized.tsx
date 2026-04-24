import { Progress } from "@/components/ui/progress";
import { formatBRL } from "@/lib/storage";
import { Sparkles, Trophy, Calendar, TrendingUp, Zap, Target, ChevronRight, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import ShareProgressDialog from "./ShareProgressDialog";

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

  const weeklyTarget = goalMonthly / 4;
  const weeklyRemaining = Math.max(0, weeklyTarget - weeklyProgress);

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-elegant bg-card">
      {/* Background Image with better contrast */}
      {goalImage && (
        <div className="absolute inset-0 z-0">
          <img 
            src={goalImage} 
            alt={goalName || "Seu objetivo"} 
            className="w-full h-full object-cover opacity-30 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/40" />
        </div>
      )}

      {/* Gradient fallback */}
      {!goalImage && <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background z-0" />}

      <div className={`relative z-10 p-6 md:p-10 ${loaded ? "animate-in fade-in duration-500" : ""}`}>
        <div className="space-y-6">
          {/* Header section - Compact */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {greeting}, seu sonho é:
              </p>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl md:text-2xl font-extrabold truncate max-w-[200px] md:max-w-none">
                  {goalName || "Seu objetivo"}
                </h2>
                {reached ? (
                  <Trophy className="w-5 h-5 text-yellow-500 animate-bounce" />
                ) : (
                  <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Restante</p>
                <p className="font-display text-lg md:text-xl font-bold text-accent">
                  {formatBRL(remaining)}
                </p>
              </div>
              <ShareProgressDialog 
                saved={saved} 
                goal={goal} 
                goalName={goalName || "Meu sonho"} 
                goalImage={goalImage} 
              />
            </div>
          </div>

          {/* Main Value & Progress */}
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valor Guardado</p>
                <div className="flex items-baseline gap-2">
                  <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
                    {formatBRL(saved)}
                  </h1>
                  <span className="text-sm md:text-xl opacity-60 font-medium">
                    / {formatBRL(goal)}
                  </span>
                </div>
              </div>
              <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-bold border border-primary/20 mb-2">
                {pct.toFixed(1)}%
              </div>
            </div>

            {/* Progress Bar - Thinner and sleek */}
            <div className="relative">
              <Progress value={pct} className="h-3 bg-muted/50 overflow-hidden" />
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                <div className="animate-shine h-full" />
              </div>
            </div>
          </div>

          {/* Bottom Grid - Targets */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/40">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-accent" />
                <p className="text-xs font-bold text-muted-foreground uppercase">Meta Semanal</p>
              </div>
              <p className="text-xl font-extrabold">{formatBRL(weeklyTarget)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Ritmo ideal para o prazo</p>
            </div>
            
            <div className={`rounded-2xl p-4 border transition-colors ${
              weeklyRemaining === 0 
                ? "bg-green-500/10 border-green-500/20" 
                : "bg-primary/5 border-primary/10"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold text-muted-foreground uppercase">Falta p/ semana</p>
              </div>
              <p className={`text-xl font-extrabold ${weeklyRemaining === 0 ? "text-green-500" : "text-foreground"}`}>
                {weeklyRemaining === 0 ? "Meta batida! ✅" : formatBRL(weeklyRemaining)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {weeklyRemaining === 0 ? "Você está no caminho certo" : "Vamos acelerar o passo!"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressHeroPersonalized;