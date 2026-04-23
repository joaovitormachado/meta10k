import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChallengeProgress,
  loadChallenge,
  saveChallenge,
  todayISO,
} from "@/lib/storage";
import { Rocket, Check, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ALL_CHALLENGES = [
  [{ title: "Liste todos os seus gastos", desc: "Anote tudo que sai do seu bolso." }, { title: "Venda algo que não usa", desc: "Marketplace, OLX ou grupo do WhatsApp." }, { title: "Faça 1 renda extra", desc: "Um freela, um bico, um serviço." }, { title: "Copie 1 gasto fixo", desc: "Cancele uma assinatura ou troque por algo barato." }, { title: "Ofereca seu servico a 5 pessoas", desc: "Mande mensagem no privado, sem vergonha." }, { title: "Guarde tudo que sobrar hoje", desc: "Mesmo que sejam R$ 5, vai pro cofre." }, { title: "Planeje a semana seguinte", desc: "Defina meta, acoes e quanto vai guardar." }],
  [{ title: "Revise suas contas bancarias", desc: "Veja para onde seu dinheiro esta indo." }, { title: "Cancele 1 assinatura", desc: "Streaming, revista ou qualquer coisa que nao usa." }, { title: "Prepare um prato em casa", desc: "Evite delivery por uma semana." }, { title: "Venda 1 coisa online", desc: "Um objeto que nao usa mais." }, { title: "Facu um freela esta semana", desc: "Use suas habilidades para ganhar dinheiro extra." }, { title: "Nao compre nada por impulso", desc: "Antes de comprar, espere 24 horas." }, { title: "Organize suas financas", desc: "Planilha, app ou caderno." }],
  [{ title: "Defina um orcamento semanal", desc: "Separe quanto pode gastar por dia." }, { title: "Troque compras caras por baratas", desc: "Genericossao mais baratos." }, { title: "Faça um bico de fim de semana", desc: "Uber, freela ou qualquer servico." }, { title: "Pague uma divida", desc: "Se tiver, quite pelo menos uma." }, { title: "Invista R$ 10", desc: "Poupanca, tesouro ou outro." }, { title: "Nao coma fora esta semana", desc: "Leve marmita para o trabalho." }, { title: "Revise seus gastos", desc: "Veja onde pode cortar mais." }],
  [{ title: "Crie uma planilha de gastos", desc: "Controle tudo que entra e sai." }, { title: "Venda algo que nao usa", desc: "Roupas, moveis ou eletronicos." }, { title: "Faça economia semanal", desc: "Gaste 20% menos que a semana pasada." }, { title: "Poupe o troco", desc: "Guarde todas as moedas que sobraram." }, { title: "Evite compras por impulso", desc: "Lista no celular, compre so o que esta nela." }, { title: "Encontre renda extra", desc: "Freela, bico ou vender algo." }, { title: "Planeje o proximo mes", desc: "Defina quanto vai guardar." }],
  [{ title: "Baixe seu extrato bancario", desc: "Veja todos os gastos do mes." }, { title: "Cancele servicios nao usados", desc: "Apps, assinaturas, membros." }, { title: "Venda algo no marketplace", desc: "Qualquer coisa que nao usa mais." }, { title: "Cozinhe em casa", desc: "Evite delivery e restaurantes." }, { title: "Guarde dinheiro todo dia", desc: "Coloque qualquer quantia no cofre." }, { title: "Nao gaste por um dia", desc: "Teste sua disciplina." }, { title: "Avanca para a proxima semana", desc: "Reveja e planeje." }],
];

const getRandomChallenges = () => {
  const availableIndices = ALL_CHALLENGES.map((_, i) => i);
  const selected: typeof ALL_CHALLENGES[0] = [];
  while (selected.length < 7) {
    const idx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const challengeSet = ALL_CHALLENGES[idx];
    const randomIndex = Math.floor(Math.random() * challengeSet.length);
    if (!selected.some(s => s.title === challengeSet[randomIndex].title)) {
      selected.push(challengeSet[randomIndex]);
    }
    if (selected.length >= ALL_CHALLENGES.length * 7) break;
  }
  return selected.slice(0, 7);
};

const Challenge7Days = () => {
  const [progress, setProgress] = useState<ChallengeProgress>({ completed: [] });
  const [challenges, setChallenges] = useState(ALL_CHALLENGES[0]);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const saved = loadChallenge();
    setProgress(saved);
    if (saved.cycle !== undefined) {
      setCycle(saved.cycle);
      if (saved.challenges) {
        setChallenges(saved.challenges);
      }
    }
  }, []);

  const generateNewCycle = () => {
    const newChallenges = getRandomChallenges();
    const newCycle = cycle + 1;
    const next = {
      startedAt: todayISO(),
      completed: [],
      challenges: newChallenges,
      cycle: newCycle,
    };
    setProgress(next);
    setChallenges(newChallenges);
    setCycle(newCycle);
    saveChallenge(next);
  };

  const start = () => {
    if (cycle > 0) {
      generateNewCycle();
    } else {
      const next = { startedAt: todayISO(), completed: [], challenges: ALL_CHALLENGES[0], cycle: 0 };
      setProgress(next);
      setChallenges(ALL_CHALLENGES[0]);
      saveChallenge(next);
    }
    toast.success("Desafio iniciado! Bora 🚀");
  };

  const toggle = (i: number) => {
    const completed = progress.completed.includes(i)
      ? progress.completed.filter((c) => c !== i)
      : [...progress.completed, i];
    const next = { ...progress, completed };
    setProgress(next);
    saveChallenge(next);
    if (completed.length === 7) {
      toast.success("Desafio concluido! Novos desafios em breve 🏆");
      setTimeout(() => {
        generateNewCycle();
      }, 1500);
    }
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
                ? `${progress.completed.length}/7 dias concluidos`
                : "Comece agora e acelere sua meta"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {cycle > 0 && progress.startedAt && (
            <Button size="sm" variant="ghost" onClick={generateNewCycle} title="Novos desafios">
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
          {progress.startedAt ? (
            <Button size="sm" variant="ghost" onClick={reset}>
              Reiniciar
            </Button>
          ) : (
            <Button size="sm" onClick={start} className="gradient-primary text-primary-foreground">
              Comecar
            </Button>
          )}
        </div>
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
        {challenges.map((d, i) => {
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
