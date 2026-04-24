import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, Instagram, MessageCircle } from "lucide-react";
import { formatBRL } from "@/lib/storage";
import { useRef } from "react";
import { toast } from "sonner";

interface Props {
  saved: number;
  goal: number;
  goalName: string;
  goalImage?: string;
}

const ShareProgressDialog = ({ saved, goal, goalName, goalImage }: Props) => {
  const pct = Math.min(100, (saved / goal) * 100);
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Meu progresso: ${goalName}`,
          text: `Já guardei ${formatBRL(saved)} para o meu sonho: ${goalName}! Faltam ${formatBRL(goal - saved)}.`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      toast.info("Compartilhamento não suportado neste navegador. Copie o link!");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-white/10 border-white/20 hover:bg-white/20 text-foreground">
          <Share2 className="w-4 h-4" />
          <span>Compartilhar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none bg-transparent">
        <div className="relative aspect-[9/16] w-full bg-card rounded-3xl overflow-hidden shadow-2xl border border-border/50">
          {/* Background Image */}
          {goalImage && (
            <div className="absolute inset-0">
              <img src={goalImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
            </div>
          )}
          {!goalImage && <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-accent" />}

          <div className="relative h-full flex flex-col items-center justify-between p-8 text-center text-white">
            <div className="space-y-2 pt-10">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/30">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-80">Minha Jornada</p>
              <h2 className="text-3xl font-extrabold leading-tight">{goalName}</h2>
            </div>

            <div className="w-full space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider opacity-80">
                  <span>Progresso</span>
                  <span>{pct.toFixed(1)}%</span>
                </div>
                <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000" 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] font-bold uppercase opacity-60">Já conquistado</p>
                  <p className="text-3xl font-black">{formatBRL(saved)}</p>
                </div>
              </div>
            </div>

            <div className="pb-10 space-y-4 w-full">
              <p className="text-sm font-medium opacity-80 italic">"Cada pequeno passo me aproxima do meu grande sonho."</p>
              <div className="pt-4 flex justify-center gap-3">
                <Button onClick={handleShare} className="rounded-full bg-white text-black hover:bg-white/90 font-bold px-8">
                  Compartilhar agora
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareProgressDialog;
