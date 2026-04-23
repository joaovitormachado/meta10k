import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChallengeProgress,
  loadChallenge,
  saveChallenge,
  todayISO,
} from "@/lib/storage";
import { Rocket, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const DAYS = [
  { title: "Liste todos os seus gastos", desc: "Anote tudo que sai do seu bolso." },
  { title: "Venda algo que não usa", desc: "Marketplace, OLX ou grupo do WhatsApp." },
  { title: "Faça 1 renda extra", desc: "Um freela, um bico, um serviço." },
  { title: "Corte 1 gasto fixo", desc: "Cancele uma assinatura ou troque por algo barato." },
  { title: "Ofereça seu serviço a 5 pessoas", desc: "Mande mensagem no privado, sem vergonha." },
  { title: "Guarde tudo que sobrar hoje", desc: "Mesmo que sejam R$ 5, vai pro cofre." },
  { title: "Planeje a semana seguinte", desc: "Defina meta, ações e quanto vai guardar." },
];

const Challenge7Days = () => {
  const [progress, setProgress] = useState<ChallengeProgress>({ completed: [] });

  useEffect(() => {
    setProgress(loadChallenge());
  }, []);

  const start = () => {
    const next = { startedAt: todayISO(), completed: [] };
    setProgress(next);
    saveChallenge(next);
    toast.success("Desafio iniciado! Bora 🚀");
  };

  const toggle = (i: number) => {
    const completed = progress.completed.includes(i)
      ? progress.completed.filter((c) => c !== i)
      : [...progress.completed, i];
    const next = { ...progress, completed };
    setProgress(next);
    saveChallenge(next);
    if (completed.length === 7) toast.success("Desafio 7 dias concluído! 🏆");
  };

  const reset = () => {
    const fresh = { completed: [] };
    setProgress(fresh);
    saveChallenge(fresh);
  };

  const pct = (progress.completed.length / 7) * 100;

  return (
    <Card className="p-6 gradient-card shadow-soft border-border/60">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg gradient-gold text-accent-foreground">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Desafio 7 dias</h2>
            <p className="text-xs text-muted-foreground">
              {progress.startedAt
                ? `${progress.completed.length}/7 dias concluídos`
                : "Comece agora e acelere sua meta"}
            </p>
          </div>
        </div>
        {progress.startedAt ? (
          <Button size="sm" variant="ghost" onClick={reset}>
            Reiniciar
          </Button>
        ) : (
          <Button size="sm" onClick={start} className="gradient-primary text-primary-foreground">
            Começar
          </Button>
        )}
      </div>

      {progress.startedAt && (
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className="h-full gradient-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <ol className="space-y-2">
        {DAYS.map((d, i) => {
          const done = progress.completed.includes(i);
          const disabled = !progress.startedAt;
          return (
            <li
              key={i}
              onClick={() => !disabled && toggle(i)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-smooth ${
                disabled
                  ? "opacity-60 bg-background/40 border-border/60"
                  : done
                  ? "bg-primary/10 border-primary/40 cursor-pointer"
                  : "bg-background/60 border-border/60 hover:border-primary/30 cursor-pointer"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  done
                    ? "gradient-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-bold ${done ? "line-through text-muted-foreground" : ""}`}>
                  Dia {i + 1}: {d.title}
                </p>
                <p className="text-xs text-muted-foreground">{d.desc}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
};

export default Challenge7Days;
