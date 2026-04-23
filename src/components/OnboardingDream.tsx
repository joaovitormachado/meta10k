import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PiggyBank, Target, Upload, Search, Sparkles, ArrowRight, Loader2, Camera, Shield, Zap, Heart } from "lucide-react";
import { toast } from "sonner";

interface OnboardingProps {
  userId: string;
  onComplete: () => void;
}

const COMMON_GOALS = [
  "Reserva de emergência",
  "Viagem dos sonhos",
  "Entrada de imóvel",
  "Carro novo",
  "Quitar dívidas",
  "iPhone / Gadgets",
  "Educação / Curso",
  "Negócio próprio",
  "Casa própria",
  "Lua de mel",
];

const GOAL_TYPES = [
  { id: "liberdade", label: "Liberdade", icon: Sparkles, desc: "Independência e novas experiências" },
  { id: "seguranca", label: "Segurança", icon: Shield, desc: "Tranquilidade para sua família" },
  { id: "conforto", label: "Conforto", icon: Heart, desc: "Melhorar sua qualidade de vida" },
  { id: "status", label: "Conquista", icon: Zap, desc: "Realizar um grande desejo pessoal" },
];

const Onboarding = ({ userId, onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(1);
  const [goalName, setGoalName] = useState("");
  const [goalValue, setGoalValue] = useState("");
  const [goalType, setGoalType] = useState("");
  const [goalImage, setGoalImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const searchImage = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      setGoalImage(`https://images.unsplash.com/photo-1500673922987-e212871fec22?q=80&w=1000&auto=format&fit=crop`);
      setGoalImage(`https://source.unsplash.com/1600x900/?${encodeURIComponent(searchQuery)}`);
      toast.success("Imagem selecionada!");
    } catch {
      toast.error("Erro ao carregar imagem.");
    } finally {
      setSearching(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGoalImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const numericValue = parseFloat(goalValue.replace(/\./g, "").replace(",", "."));
      if (isNaN(numericValue)) throw new Error("Valor inválido");

      const finalImage = goalImage || `https://source.unsplash.com/1600x900/?${encodeURIComponent(goalName)}`;
      
      // UPSERT Profile - ensures record exists and is updated
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          goal_name: goalName,
          goal_target_value: numericValue,
          goal_type: goalType,
          goal_image_url: finalImage,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // UPSERT Goal - consistency for dashboard calculations
      const { error: goalError } = await supabase
        .from("goals")
        .upsert({
          user_id: userId,
          goal_total: numericValue,
          goal_monthly: numericValue / 12,
          deadline_months: 12,
          amount_saved: 0,
          amount_remaining: numericValue,
          progress_percent: 0,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (goalError) throw goalError;

      toast.success("Seu sonho foi configurado! Vamos juntos 💪");
      onComplete();
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-primary via-primary/90 to-accent h-2" />
        
        <CardContent className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {step === 1 ? "Qual é o seu sonho?" : 
               step === 2 ? "Quanto custa?" : 
               step === 3 ? "O que esse sonho representa?" : 
               "Visualize sua conquista"}
            </h1>
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="space-y-3">
                <Label htmlFor="goal" className="text-lg font-medium">O que você quer conquistar?</Label>
                <Input
                  id="goal"
                  placeholder="Ex: Honda Civic Touring 2024"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="h-14 text-lg border-2 focus:border-primary rounded-xl"
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Ou escolha uma opção rápida:</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_GOALS.slice(0, 8).map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setGoalName(goal)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        goalName === goal
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => goalName && setStep(2)}
                className="w-full h-12 text-lg gradient-primary shadow-lg hover:shadow-xl transition-all"
                disabled={!goalName}
              >
                Continuar <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="space-y-3">
                <Label htmlFor="value" className="text-lg font-medium">Qual o valor necessário?</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">R$</span>
                  <Input
                    id="value"
                    type="text"
                    inputMode="decimal"
                    placeholder="35.000"
                    value={goalValue}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value) {
                        setGoalValue(Number(parseInt(value) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
                      } else {
                        setGoalValue("");
                      }
                    }}
                    className="h-14 text-2xl text-center font-bold pl-12 border-2 focus:border-primary rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1 h-12">Voltar</Button>
                <Button
                  onClick={() => goalValue && setStep(3)}
                  className="flex-1 h-12 gradient-primary shadow-lg"
                  disabled={!goalValue}
                >
                  Continuar <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <Label className="text-lg font-medium">Este objetivo trará mais...</Label>
              <div className="grid grid-cols-1 gap-3">
                {GOAL_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setGoalType(type.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      goalType === type.id
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-muted hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${goalType === type.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <type.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold">{type.label}</p>
                      <p className="text-sm text-muted-foreground">{type.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1 h-12">Voltar</Button>
                <Button
                  onClick={() => goalType && setStep(4)}
                  className="flex-1 h-12 gradient-primary shadow-lg"
                  disabled={!goalType}
                >
                  Continuar <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="space-y-3">
                <Label className="text-lg font-medium">Visualize sua conquista</Label>
                
                {goalImage ? (
                  <div className="relative rounded-2xl overflow-hidden shadow-inner bg-muted">
                    <img src={goalImage} alt={goalName} className="w-full h-56 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                       <p className="text-white font-bold text-lg">{goalName}</p>
                       <Button onClick={() => setGoalImage("")} variant="destructive" size="sm">Trocar</Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-6 space-y-4 bg-muted/20">
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex flex-col items-center gap-2 cursor-pointer p-4 rounded-xl hover:bg-muted/50 transition-colors bg-card shadow-sm border">
                        <Upload className="w-6 h-6 text-primary" />
                        <span className="text-xs font-medium">Fazer Upload</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card shadow-sm border opacity-50 cursor-not-allowed">
                        <Search className="w-6 h-6 text-accent" />
                        <span className="text-xs font-medium">Buscar (Auto)</span>
                      </div>
                    </div>
                    <p className="text-center text-xs text-muted-foreground italic">Dica: Uma imagem real ajuda seu cérebro a focar na meta!</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(3)} variant="outline" className="flex-1 h-12">Voltar</Button>
                <Button
                  onClick={saveProfile}
                  className="flex-1 h-12 gradient-primary shadow-lg"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Começar Jornada <Sparkles className="w-5 h-5 ml-2" /></>}
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-2 pt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  s === step ? "bg-primary w-8" : s < step ? "bg-primary/60" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;