import { Card } from "@/components/ui/card";
import { Deposit, formatBRL } from "@/lib/storage";
import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  deposits: Deposit[];
  goal: number;
}

const EvolutionChart = ({ deposits, goal }: Props) => {
  const sorted = [...deposits].sort((a, b) => a.date.localeCompare(b.date));
  let acc = 0;
  const data = sorted.map((d) => {
    acc += d.amount;
    return {
      date: new Date(d.date + "T00:00").toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      total: Math.round(acc),
    };
  });

  return (
    <Card className="p-6 gradient-card shadow-soft border-border/60">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold">Evolução</h2>
          <p className="text-xs text-muted-foreground">
            Acumulado rumo a {formatBRL(goal)}
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-12">
          Adicione aportes pra ver a evolução aparecer aqui 📈
        </p>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => `R$${v}`}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v: number) => [formatBRL(v), "Acumulado"]}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#g)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default EvolutionChart;
