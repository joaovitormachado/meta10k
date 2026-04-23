import { Card } from "@/components/ui/card";
import { Lightbulb, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const ACTIONS = [
  "Venda 1 item parado em casa",
  "Anuncie algo no marketplace agora",
  "Ofereça 1 serviço pra um conhecido",
  "Liste 3 gastos que você pode cortar essa semana",
  "Faça 1 freelance rápido hoje",
  "Peça indicação de cliente pra 3 pessoas",
  "Venda um doce/lanche pra colegas amanhã",
  "Faça uma faxina paga no fim de semana",
  "Revise assinaturas e cancele 1 inútil",
  "Transforme uma habilidade em renda: ofereça hoje",
  "Pesquise 1 produto barato pra revender",
  "Poste seu serviço em 1 grupo do WhatsApp",
];

const pickThree = (seed: number) => {
  const arr = [...ACTIONS];
  const out: string[] = [];
  let s = seed;
  for (let i = 0; i < 3 && arr.length; i++) {
    s = (s * 9301 + 49297) % 233280;
    const idx = Math.floor((s / 233280) * arr.length);
    out.push(arr.splice(idx, 1)[0]);
  }
  return out;
};

const DailyActions = () => {
  const todaySeed = Number(new Date().toISOString().slice(0, 10).replace(/-/g, ""));
  const [seed, setSeed] = useState(todaySeed);
  const items = pickThree(seed);

  return (
    <Card className="p-6 gradient-card shadow-soft border-border/60">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent/20 text-accent-foreground">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">O que fazer hoje</h2>
            <p className="text-xs text-muted-foreground">3 ações simples pra hoje</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setSeed(Math.floor(Math.random() * 100000))}
          className="gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          Trocar
        </Button>
      </div>

      <ul className="space-y-2">
        {items.map((a, i) => (
          <li
            key={`${seed}-${i}`}
            className="flex items-start gap-3 p-3 rounded-xl bg-background/60 border border-border/60 hover:border-primary/30 transition-smooth animate-fade-in-up"
          >
            <span className="w-7 h-7 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
              {i + 1}
            </span>
            <p className="text-sm font-medium pt-0.5">{a}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default DailyActions;
