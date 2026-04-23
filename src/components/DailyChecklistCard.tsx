import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2 } from "lucide-react";

export type WeeklyChecklistState = {
  saved_money: boolean;
  extra_income: boolean;
  avoided_unnecessary_expense: boolean;
};

interface Props {
  value: WeeklyChecklistState;
  onToggle: (key: keyof WeeklyChecklistState) => void;
}

const DailyChecklistCard = ({ value, onToggle }: Props) => {
  const rows: { key: keyof WeeklyChecklistState; label: string }[] = [
    { key: "saved_money", label: "Guardei dinheiro" },
    { key: "extra_income", label: "Fiz renda extra" },
    { key: "avoided_unnecessary_expense", label: "Evitei gasto desnecessário" },
  ];

  const done = rows.filter((r) => value[r.key]).length;

  return (
    <Card className="p-6 gradient-card shadow-soft border-border/60">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-xl font-bold">Checklist da semana</h2>
          <p className="text-xs text-muted-foreground">
            {done}/3 concluídos {done === 3 && "• mandou bem 🔥"}
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {rows.map((r) => {
          const checked = value[r.key];
          return (
            <li
              key={r.key}
              onClick={() => onToggle(r.key)}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-smooth ${
                checked
                  ? "bg-primary/10 border-primary/40"
                  : "bg-background/60 border-border/60 hover:border-primary/30"
              }`}
            >
              <Checkbox checked={checked} />
              <span
                className={`text-sm font-medium ${
                  checked ? "line-through text-muted-foreground" : ""
                }`}
              >
                {r.label}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};

export default DailyChecklistCard;
