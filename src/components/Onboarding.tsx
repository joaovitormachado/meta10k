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
import { Search, Sparkles, Target, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const GOAL_SUGGESTIONS = [
  { name: "Honda Civic", image: "https://images.unsplash.com/photo-1606611013016-969c19ba27ad?w=400&h=300&fit=crop" },
  { name: "Viagem Europa", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=300&fit=crop" },
  { name: "iPhone Pro", image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop" },
  { name: "Reserva emergência", image: "https://images.unsplash.com/photo-1579621970563-eb002756a337?w=400&h=300&fit=crop" },
  { name: "Entrada imóvel", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop" },
  { name: "Quitar dívidas", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop" },
  { name: "Carro zero", image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop" },
  { name: "Notebook", image: "https://images.unsplash.com/photo-1496180474307-a796c7aab9e1?w=400&h=300&fit=crop" },
];

interface Props {
  open: boolean;
  onComplete: (config: GoalConfig) => void;
}

const Onboarding = ({ open, onComplete }: Props) => {
  const [step, setStep] = useState(0);
  const [goalName, setGoalName] = useState("");
  const [goalValue, setGoalValue] = useState("");
  const [goalImage, setGoalImage] = useState("");
  const [income, setIncome] = useState("");
  const [monthly, setMonthly] = useState("");
  const [months, setMonths] = useState("10");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const goalValueN = parseFloat(goalValue.replace(",", ".")) || 0;
  const incomeN = parseFloat(income.replace(",", ".")) || 0;
  const monthlyN = parseFloat(monthly.replace(",", ".")) || 0;
  const monthsN = Math.max(1, parseInt(months) || 10);
  const computed = monthlyN * monthsN;

  const searchGoals = GOAL_SUGGESTIONS.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const finish = () => {
    if (!goalName.trim()) {
      toast.error("Qual é o seu objetivo?");
      return;
    }
    if (goalValueN <= 0) {
      toast.error("Informe o valor do seu objetivo");
      return;
    }
    const start = new Date();
    const deadline = new Date();
    deadline.setMonth(start.getMonth() + monthsN);
    onComplete({
      goal: goalValueN,
      startDate: start.toISOString().slice(0, 10),
      deadline: deadline.toISOString().slice(0, 10),
      monthlyTarget: monthlyN,
      income: incomeN,
      goalName: goalName.trim(),
      goalImage: goalImage || GOAL_SUGGESTIONS[0]?.image || "",
      goalValue: goalValueN,
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto p-3 rounded-2xl gradient-primary text-primary-foreground mb-2">
            <Target className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center font-display text-2xl">
            Qual é o seu sonho?
          </DialogTitle>
          <DialogDescription className="text-center">
            Vamos transformar seu objetivo em algo real.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {step === 0 && (
            <div className="space-y-4 animate-fade-in-up">
              <Label className="text-base font-medium">O que você quer conquistar?</Label>
              <Input
                placeholder="Ex: Honda Civic, Viagem para Europa, iPhone..."
                value={goalName}
                onChange={(e) => {
                  setGoalName(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                onFocus={() => setShowSearch(true)}
                autoFocus
                className="text-lg h-14"
              />
              
              {showSearch && searchQuery && (
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {searchGoals.length > 0 ? (
                    searchGoals.map((goal) => (
                      <button
                        key={goal.name}
                        onClick={() => {
                          setGoalName(goal.name);
                          setGoalImage(goal.image);
                          setShowSearch(false);
                        }}
                        className="relative rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all group text-left"
                      >
                        <img src={goal.image} alt={goal.name} className="w-full h-16 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-1">
                          <span className="text-white text-xs font-medium truncate">{goal.name}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="col-span-2 text-center text-muted-foreground text-sm py-2">
                      Digite acima para buscar sugestões
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Search className="w-4 h-4" />
                <span>Ou <button type="button" onClick={() => setShowSearch(true)} className="text-primary underline">busque um objetivo</button></span>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-fade-in-up">
              <Label className="text-base font-medium">Quanto custa o seu "{goalName}"?</Label>
              <Input
                inputMode="decimal"
                placeholder="Ex: 35000"
                value={goalValue}
                onChange={(e) => setGoalValue(e.target.value)}
                autoFocus
                className="text-lg h-14"
              />
              <p className="text-xs text-muted-foreground">
                Valor total para conquistar seu objetivo
              </p>

              {goalValueN > 0 && (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium">
                      {formatBRL(goalValueN)} para realizar seu sonho
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="text-center mb-4">
                <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden shadow-lg mb-3">
                  <img 
                    src={goalImage || GOAL_SUGGESTIONS[0]?.image} 
                    alt={goalName} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-display text-xl font-bold">{goalName}</h3>
                <p className="text-primary font-medium">{formatBRL(goalValueN)}</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Quanto você ganha por mês? (opcional)</Label>
                  <Input
                    inputMode="decimal"
                    placeholder="Ex: 5000"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Quanto pode guardar por mês?</Label>
                  <Input
                    inputMode="decimal"
                    placeholder="Ex: 1000"
                    value={monthly}
                    onChange={(e) => setMonthly(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Em quantos meses quer alcançar?</Label>
                  <Input
                    type="number"
                    min={1}
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary mb-1" />
                <p className="text-sm">
                  No seu ritmo, em <b>{monthsN} meses</b> você economiza{" "}
                  <b>{formatBRL(computed)}</b>.{" "}
                  {computed >= goalValueN ? (
                    <span className="text-green-600 font-medium">Você consegue! 🎉</span>
                  ) : (
                    <span>Faltam {formatBRL(goalValueN - computed)} — vamos buscar com renda extra 💪</span>
                  )}
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
              onClick={() => {
                if (step === 0 && !goalName.trim()) {
                  toast.error("Qual é o seu objetivo?");
                  return;
                }
                if (step === 1 && goalValueN <= 0) {
                  toast.error("Informe o valor do objetivo");
                  return;
                }
                setStep(step + 1);
              }}
              className="gradient-primary text-primary-foreground"
            >
              Continuar
            </Button>
          ) : (
            <Button
              onClick={finish}
              className="gradient-primary text-primary-foreground"
            >
              Finalizar minha jornada 🚀
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Onboarding;