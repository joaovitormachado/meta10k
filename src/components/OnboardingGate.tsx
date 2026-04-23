import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import OnboardingDream from "@/components/OnboardingDream";

const OnboardingGate = ({ children }: { children: ReactNode }) => {
  const { profile, loading, user } = useAuth();

  // 1. Enquanto carrega a autenticação ou o perfil, não mostra nada além do Loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Se não houver usuário (não logado), o ProtectedRoute já deve ter lidado com isso, 
  // mas aqui garantimos que não renderizamos o dashboard.
  if (!user) return null;

  // 3. Validação CRÍTICA da Meta
  // Se não houver profile, ou se os campos essenciais forem nulos/vazios/0
  const isGoalMissing = !profile?.goal_name || 
                        profile?.goal_name?.toLowerCase() === "seu objetivo" ||
                        !profile?.goal_target_value || 
                        Number(profile.goal_target_value) <= 0;

  if (isGoalMissing) {
    return (
      <OnboardingDream 
        userId={user.id} 
        onComplete={() => window.location.reload()} 
      />
    );
  }

  // 4. Se passou em tudo, libera o Dashboard real
  return <>{children}</>;
};

export default OnboardingGate;
