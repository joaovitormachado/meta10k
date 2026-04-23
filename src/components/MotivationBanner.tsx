import { Sparkles } from "lucide-react";
import { useMemo } from "react";

const PHRASES = [
  "Você está mais perto do que imagina",
  "Consistência > perfeição",
  "Você já fez mais que a maioria",
  "Cada R$ 1 te aproxima do seu objetivo",
  "Hoje é o melhor dia pra começar",
  "Pequenos passos, grandes resultados",
  "Disciplina vale mais que motivação",
  "O que você faz hoje, recebe amanhã",
];

interface Props {
  saved: number;
  goal: number;
}

const MotivationBanner = ({ saved, goal }: Props) => {
  const phrase = useMemo(() => {
    const seed = Number(new Date().toISOString().slice(0, 10).replace(/-/g, ""));
    return PHRASES[seed % PHRASES.length];
  }, []);

  const pct = Math.min(100, (saved / goal) * 100);

  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-accent/15 border border-accent/30">
      <div className="p-2 rounded-xl gradient-gold text-accent-foreground shrink-0">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-tight">{phrase}</p>
        <p className="text-xs text-muted-foreground">
          Sua jornada até seu objetivo: Você já completou {pct.toFixed(1)}% da sua meta
        </p>
      </div>
    </div>
  );
};

export default MotivationBanner;
