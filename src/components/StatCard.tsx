import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: "primary" | "gold" | "muted";
}

const StatCard = ({ label, value, hint, icon: Icon, accent = "primary" }: Props) => {
  const accentClasses = {
    primary: "bg-primary/10 text-primary",
    gold: "bg-accent/20 text-accent-foreground",
    muted: "bg-muted text-muted-foreground",
  };

  return (
    <Card className="p-5 gradient-card border-border/60 shadow-soft hover:shadow-elegant transition-smooth animate-fade-in-up">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {label}
          </p>
          <p className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {value}
          </p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${accentClasses[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
