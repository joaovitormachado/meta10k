import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Deposit, formatBRL, SOURCE_LABEL } from "@/lib/storage";
import { Trash2, History } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  deposits: Deposit[];
  onRemove: (id: string) => void;
}

const DepositList = ({ deposits, onRemove }: Props) => {
  const sorted = [...deposits].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Card className="p-6 gradient-card shadow-soft border-border/60">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <History className="w-5 h-5" />
        </div>
        <h2 className="font-display text-xl font-bold">Histórico</h2>
        <span className="ml-auto text-sm text-muted-foreground">
          {deposits.length} {deposits.length === 1 ? "aporte" : "aportes"}
        </span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-center text-muted-foreground py-8 text-sm">
          Nenhum aporte ainda. Comece registrando seu primeiro depósito!
        </p>
      ) : (
        <ScrollArea className="h-[320px] pr-3">
          <ul className="space-y-2">
            {sorted.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-background/60 border border-border/60 hover:border-primary/30 transition-smooth animate-fade-in-up"
              >
                <div className="min-w-0">
                  <p className="font-bold text-foreground">{formatBRL(d.amount)}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {new Date(d.date + "T00:00").toLocaleDateString("pt-BR")}
                    {d.source ? ` • ${SOURCE_LABEL[d.source]}` : ""}
                    {d.note ? ` • ${d.note}` : ""}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onRemove(d.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </Card>
  );
};

export default DepositList;
