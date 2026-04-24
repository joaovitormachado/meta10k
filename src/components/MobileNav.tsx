import { Home, Plus, Settings2, ShieldCheck, LogOut, RotateCcw, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
}

const MobileNav = ({ activeTab, onTabChange, onAddClick }: MobileNavProps) => {
  const { isAdmin } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-card/95 backdrop-blur-xl border-t border-border/50 px-4 py-2 flex items-center justify-between pb-8">
        <button
          onClick={() => onTabChange("home")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "home" ? "text-primary scale-110" : "text-muted-foreground"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Início</span>
        </button>

        <button
          onClick={() => onTabChange("history")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "history" ? "text-primary scale-110" : "text-muted-foreground"
          }`}
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-[10px] font-bold">Histórico</span>
        </button>

        <div className="relative -top-4">
          <button
            onClick={onAddClick}
            className="w-14 h-14 rounded-full gradient-primary text-primary-foreground shadow-glow flex items-center justify-center transition-transform active:scale-90"
            aria-label="Adicionar aporte"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>

        <button
          onClick={() => onTabChange("challenges")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "challenges" ? "text-primary scale-110" : "text-muted-foreground"
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-bold">Desafios</span>
        </button>

        <button
          onClick={() => onTabChange("profile")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "profile" ? "text-primary scale-110" : "text-muted-foreground"
          }`}
        >
          <Settings2 className="w-5 h-5" />
          <span className="text-[10px] font-bold">Perfil</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNav;
