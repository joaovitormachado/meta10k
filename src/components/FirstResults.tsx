import { Card } from "@/components/ui/card";
import { Deposit, formatBRL } from "@/lib/storage";
import { Trophy } from "lucide-react";

interface Props {
  deposits: Deposit[];
}

const FirstResults = ({ deposits }: Props) => {
  const extra = deposits
    .filter((d) => d.source && d.source !== "salario")
    .reduce((s, d) => s + d.amount, 0);
  const total = deposits.reduce((s, d) => s + d.amount, 0);

  return (
    <Card className="p-6 gradient-card shadow-soft border-border/60">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg gradient-gold text-accent-foreground">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold">Seu primeiro resultado</h2>
          <p className="text-xs text-muted-foreground">Tudo que você já gerou</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Gerado fora do salário
          </p>
          <p className="font-display text-2xl font-extrabold text-primary mt-1">
            {formatBRL(extra)}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-accent/15 border border-accent/30">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Total guardado
          </p>
          <p className="font-display text-2xl font-extrabold text-accent-foreground mt-1">
            {formatBRL(total)}
          </p>
        </div>
      </div>

      {extra === 0 && (
        <p className="text-xs text-muted-foreground mt-3">
          Dica: registre aportes com origem "Renda extra" ou "Venda" pra acompanhar
          quanto você gerou além do salário.
        </p>
      )}
    </Card>
  );
};

export default FirstResults;
