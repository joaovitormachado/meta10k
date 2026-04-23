import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, LogOut, ShieldCheck, Users, TrendingUp, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Sessão encerrada com sucesso");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl gradient-primary text-primary-foreground shadow-soft">
              <PiggyBank className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-lg hidden sm:inline-block">Primeiros 10K</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-medium">Administrador</span>
              <span className="text-xs text-muted-foreground">{user?.email}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Painel Administrativo</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight">Bem-vindo de volta!</h1>
          <p className="text-muted-foreground">Gerencie o sistema e acompanhe o progresso geral.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Usuários Totais</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-green-500 mt-1">+12% desde o último mês</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversão</CardTitle>
              <TrendingUp className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5.2%</div>
              <p className="text-xs text-green-500 mt-1">+0.4% desde a última semana</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Estimada</CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 45.289,00</div>
              <p className="text-xs text-green-500 mt-1">+18% vs período anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder for more complex admin features */}
        <Card className="border-dashed bg-muted/20">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-bold text-xl">Acesso Master Ativado</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Você está logado com credenciais fixas de administrador. Este ambiente é seguro e permite a visualização de todas as métricas do sistema.
              </p>
            </div>
            <Button variant="outline" className="mt-4" onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
              Ver Logs do Sistema
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
