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

export default function Onboarding({ userId, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [goalName, setGoalName] = useState("");
  const [goalValue, setGoalValue] = useState("");
  const [goalType, setGoalType] = useState("");
  const [goalImage, setGoalImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const GOAL_TYPES = [
    { id: "liberdade", label: "Liberdade", icon: Sparkles, desc: "Independência e novas experiências" },
    { id: "seguranca", label: "Segurança", icon: Shield, desc: "Tranquilidade para sua família" },
    { id: "conforto", label: "Conforto", icon: Heart, desc: "Melhorar sua qualidade de vida" },
    { id: "status", label: "Conquista", icon: Zap, desc: "Realizar um grande desejo pessoal" },
  ];

  async function searchImage() {
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
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGoalImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function saveProfile() {
    setLoading(true);
    try {
      const numericValue = parseFloat(goalValue.replace(/\./g, "").replace(",", "."));
      if (isNaN(numericValue)) throw new Error("Valor inválido");

      const finalImage = goalImage || `https://source.unsplash.com/1600x900/?${encodeURIComponent(goalName)}`;
      
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
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-lg shadow-2xl border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-gradient-to-r from-primary via-accent to-primary h-1.5 animate-pulse" />
        
        <CardContent className="p-8 md:p-10 space-y-8">
          <div className="text-center space-y-3">
            <div className="mx-auto w-20 h-20 rounded-[2rem] gradient-primary flex items-center justify-center shadow-glow animate-bounce-slow">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="space-y-1">
              <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight text-foreground">
                {currentStep === 1 ? "Qual o seu objetivo?" : 
                 currentStep === 2 ? "Quanto você precisa?" : 
                 currentStep === 3 ? "Qual o seu motivo?" : 
                 "Visualize o sucesso"}
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                {currentStep === 1 ? "Dê um nome para o seu grande sonho" : 
                 currentStep === 2 ? "Defina o valor total da sua conquista" : 
                 currentStep === 3 ? "O que essa meta significa para você?" : 
                 "Uma imagem vale mais que mil palavras"}
              </p>
            </div>
          </div>

          {currentStep === 1 && (
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
                onClick={() => goalName && setCurrentStep(2)}
                className="w-full h-12 text-lg gradient-primary shadow-lg hover:shadow-xl transition-all"
                disabled={!goalName}
              >
                Continuar <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {currentStep === 2 && (
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
                <Button onClick={() => setCurrentStep(1)} variant="outline" className="flex-1 h-12">Voltar</Button>
                <Button
                  onClick={() => goalValue && setCurrentStep(3)}
                  className="flex-1 h-12 gradient-primary shadow-lg"
                  disabled={!goalValue}
                >
                  Continuar <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
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
                <Button onClick={() => setCurrentStep(2)} variant="outline" className="flex-1 h-12">Voltar</Button>
                <Button
                  onClick={() => goalType && setCurrentStep(4)}
                  className="flex-1 h-12 gradient-primary shadow-lg"
                  disabled={!goalType}
                >
                  Continuar <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="space-y-3">
                <Label className="text-lg font-medium">Visualize sua conquista</Label>
                
                {goalImage ? (
                  <div className="relative rounded-2xl overflow-hidden shadow-inner bg-muted">
                    <img src={goalImage} alt={goalName} className="w-full h-56 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                       <p className="text-white font-bold text-lg">{goalName}</p>
                       <Button onClick={() => setGoalImage("")} variant="destructive" size="sm">Trocar imagem</Button>
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
                <Button onClick={() => setCurrentStep(3)} variant="outline" className="flex-1 h-12">Voltar</Button>
                <Button
                  onClick={saveProfile}
                  className="flex-1 h-12 gradient-primary shadow-lg"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Começar minha jornada <ArrowRight className="w-5 h-5 ml-2" /></>}
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-2 pt-4">
            {[1, 2, 3, 4].map((stepIndex) => (
              <div
                key={stepIndex}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  stepIndex === currentStep ? "bg-primary w-8" : stepIndex < currentStep ? "bg-primary/60" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}