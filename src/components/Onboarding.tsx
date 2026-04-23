import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoalConfig, formatBRL } from "@/lib/storage";
import { PiggyBank, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onComplete: (config: GoalConfig) => void;
}

const Onboarding = ({ open, onComplete }: Props) => {
  const [step, setStep] = useState(0);
  const [income, setIncome] = useState("");
  const [monthly, setMonthly] = useState("");
  const [months, setMonths] = useState("10");

  const incomeN = parseFloat(income.replace(",", ".")) || 0;
  const monthlyN = parseFloat(monthly.replace(",", ".")) || 0;
  const monthsN = Math.max(1, parseInt(months) || 10);
  const computed = monthlyN * monthsN;

  const finish = () => {
    if (monthlyN <= 0) {
      toast.error("Informe quanto pretende guardar por mês");
      return;
    }
    const goal = 10000;
    const start = new Date();
    const deadline = new Date();
    deadline.setMonth(start.getMonth() + monthsN);
    onComplete({
      goal,
      startDate: start.toISOString().slice(0, 10),
      deadline: deadline.toISOString().slice(0, 10),
      monthlyTarget: monthlyN,
      income: incomeN,
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto p-3 rounded-2xl gradient-primary text-primary-foreground mb-2">
            <PiggyBank className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center font-display text-2xl">
            Bora juntar seus primeiros R$ 10.000?
          </DialogTitle>
          <DialogDescription className="text-center">
            Responde 3 perguntas e o app monta seu plano.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {step === 0 && (
            <div className="space-y-2 animate-fade-in-up">
              <Label>Quanto você ganha por mês? (opcional)</Label>
              <Input
                inputMode="decimal"
                placeholder="Ex: 2500"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Só pra te dar referência. Fica salvo só no seu navegador.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2 animate-fade-in-up">
              <Label>Quanto você quer guardar por mês?</Label>
              <Input
                inputMode="decimal"
                placeholder="Ex: 1000"
                value={monthly}
                onChange={(e) => setMonthly(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Comece pequeno. Você pode ajustar depois.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 animate-fade-in-up">
              <div className="space-y-2">
                <Label>Em quantos meses quer chegar nos R$ 10.000?</Label>
                <Input
                  type="number"
                  min={1}
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                />
              </div>
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm">
                  No seu ritmo, em <b>{monthsN} meses</b> você guarda{" "}
                  <b>{formatBRL(computed)}</b>.{" "}
                  {computed >= 10000
                    ? "Vai bater a meta com folga 🏆"
                    : `Faltam ${formatBRL(10000 - computed)} — vamos buscar com renda extra 💪`}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-between sm:justify-between gap-2">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="gradient-primary text-primary-foreground"
            >
              Continuar
            </Button>
          ) : (
            <Button
              onClick={finish}
              className="gradient-primary text-primary-foreground"
            >
              Bora começar 🚀
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Onboarding;
