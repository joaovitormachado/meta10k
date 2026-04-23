import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PiggyBank, Target, Upload, Search, Sparkles, ArrowRight, Loader2, Camera } from "lucide-react";
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

const Onboarding = ({ userId, onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(1);
  const [goalName, setGoalName] = useState("");
  const [goalValue, setGoalValue] = useState("");
  const [goalImage, setGoalImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const searchImage = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=5&orientation=landscape`,
        {
          headers: {
            Authorization: "Client-ID YOUR_UNSPLASH_KEY",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.results?.length > 0) {
          setGoalImage(data.results[0].urls.regular);
          toast.success("Imagem encontrada!");
        } else {
          toast.error("Nenhuma imagem encontrada. Tente outro termo.");
        }
      }
    } catch {
      setGoalImage(`https://source.unsplash.com/800x400/?${encodeURIComponent(searchQuery)}`);
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
      const { error } = await supabase
        .from("profiles")
        .update({
          goal_name: goalName,
        })
        .eq("id", userId);

      if (error) throw error;

      if (goalImage) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          if (goalImage.startsWith("data:")) {
            resolve(goalImage);
          } else {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(goalImage);
          }
        });

        const fileName = `${userId}_goal_${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("goal-images")
          .upload(fileName, fetch(base64).then(r => r.blob()), {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("goal-images")
            .getPublicUrl(fileName);
          
          await supabase
            .from("profiles")
            .update({ goal_image: urlData.publicUrl })
            .eq("id", userId);
        }
      }

      await supabase
        .from("goals")
        .upsert({
          user_id: userId,
          goal_total: parseFloat(goalValue.replace(",", ".")),
          goal_monthly: parseFloat(goalValue.replace(",", ".")) / 10,
          deadline_months: 10,
          amount_saved: 0,
          amount_remaining: parseFloat(goalValue.replace(",", ".")),
          progress_percent: 0,
        }, { onConflict: "user_id" });

      toast.success("Seu sonho foi configurado! Vamos juntos 💪");
      onComplete();
    } catch (error: any) {
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
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {step === 1 ? "Qual é o seu sonho?" : step === 2 ? "Quanto custa?" : "Como é esse sonho?"}
            </h1>
            <p className="text-muted-foreground">
              {step === 1 && "Pense no que você quer conquistar. Pode ser qualquer coisa!"}
              {step === 2 && "Defina o valor necessário para realizar esse sonho"}
              {step === 3 && "Uma imagem ajuda a manter o foco"}
            </p>
          </div>

          {/* Step 1: Goal Name */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="space-y-3">
                <Label htmlFor="goal" className="text-lg font-medium">
                  O que você quer conquistar?
                </Label>
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
                  {COMMON_GOALS.slice(0, 6).map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setGoalName(goal)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        goalName === goal
                          ? "bg-primary text-primary-foreground"
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

          {/* Step 2: Goal Value */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="space-y-3">
                <Label htmlFor="value" className="text-lg font-medium">
                  Qual o valor necessário?
                </Label>
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
                        setGoalValue((parseInt(value) / 100).toLocaleString("pt-BR"));
                      } else {
                        setGoalValue("");
                      }
                    }}
                    className="h-14 text-2xl text-center font-bold pl-12 border-2 focus:border-primary rounded-xl"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Resumo:</span>
                </div>
                <p className="text-lg font-bold">{goalName}</p>
                <p className="text-2xl font-extrabold text-primary">
                  R$ {goalValue || "0"}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 h-12"
                >
                  Voltar
                </Button>
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

          {/* Step 3: Image */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="space-y-3">
                <Label className="text-lg font-medium">
                  Adicione uma imagem do seu sonho (opcional)
                </Label>
                
                {goalImage ? (
                  <div className="relative rounded-2xl overflow-hidden">
                    <img
                      src={goalImage}
                      alt={goalName}
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      onClick={() => setGoalImage("")}
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-8 space-y-4">
                    <div className="flex justify-center gap-4">
                      <label className="flex flex-col items-center gap-2 cursor-pointer p-4 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-sm">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>

                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                          <Search className="w-6 h-6 text-accent" />
                        </div>
                        <span className="text-sm">Buscar</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite para buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={searchImage} disabled={searching || !searchQuery}>
                        {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 h-12"
                >
                  Voltar
                </Button>
                <Button
                  onClick={saveProfile}
                  className="flex-1 h-12 gradient-primary shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Começar a jornada <Sparkles className="w-5 h-5 ml-2" /></>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="flex justify-center gap-2 pt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-all ${
                  s === step
                    ? "bg-primary w-8"
                    : s < step
                    ? "bg-primary"
                    : "bg-muted"
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