import { Home, Plus, Settings2, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

interface MobileNavProps {
  onAddClick: () => void;
  onSettingsClick: () => void;
  onLogoutClick: () => void;
}

const MobileNav = ({ onAddClick, onSettingsClick, onLogoutClick }: MobileNavProps) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isAdminPage = location.pathname === "/admin";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-card/80 backdrop-blur-lg border-t border-border/50 px-6 py-3 flex items-center justify-between pb-8">
        <button
          onClick={() => navigate("/")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isHome ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Início</span>
        </button>

        <button
          onClick={onSettingsClick}
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <Settings2 className="w-6 h-6" />
          <span className="text-[10px] font-medium">Meta</span>
        </button>

        <div className="relative -top-6">
          <button
            onClick={onAddClick}
            className="w-14 h-14 rounded-full gradient-primary text-primary-foreground shadow-glow flex items-center justify-center transition-transform active:scale-95"
            aria-label="Adicionar aporte"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>

        {isAdmin ? (
          <button
            onClick={() => navigate("/admin")}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isAdminPage ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <ShieldCheck className="w-6 h-6" />
            <span className="text-[10px] font-medium">Painel</span>
          </button>
        ) : (
          <button
            onClick={onLogoutClick}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-[10px] font-medium">Sair</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default MobileNav;
