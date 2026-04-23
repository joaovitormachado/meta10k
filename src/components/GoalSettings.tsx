import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GoalConfig } from "@/lib/storage";
import { Settings2, Save } from "lucide-react";
import { toast } from "sonner";

interface Props {
  config: GoalConfig;
  onSave: (c: GoalConfig) => void;
}

const GoalSettings = ({ config, onSave }: Props) => {
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState(String(config.goal));
  const [deadline, setDeadline] = useState(config.deadline ?? "");
  const [startDate, setStartDate] = useState(config.startDate);

  const handleSave = () => {
    const g = parseFloat(goal.replace(",", "."));
    if (!g || g <= 0) {
      toast.error("Meta inválida");
      return;
    }
    onSave({ goal: g, deadline: deadline || undefined, startDate });
    toast.success("Configurações salvas");
    setOpen(false);
  };

  if (!open) {
    return (
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Settings2 className="w-4 h-4" />
        Ajustar meta
      </Button>
    );
  }

  return (
    <Card className="p-6 gradient-card shadow-soft border-border/60 animate-scale-in">
      <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
        <Settings2 className="w-5 h-5 text-primary" />
        Configurar meta
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Meta total (R$)</Label>
          <Input value={goal} onChange={(e) => setGoal(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Data de início</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Data alvo</Label>
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button onClick={handleSave} className="gradient-primary text-primary-foreground gap-2">
          <Save className="w-4 h-4" /> Salvar
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </Card>
  );
};

export default GoalSettings;
