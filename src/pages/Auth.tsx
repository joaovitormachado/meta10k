import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, Loader2 } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }).max(100),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signInAsAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.id === "00000000-0000-0000-0000-000000000000") {
        navigate("/", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "admin@admin" && password === "Abacaxi123") {
      setLoading(true);
      signInAsAdmin(email);
      toast.success("Bem-vindo, Administrador! 🔐");
      navigate("/", { replace: true });
      setLoading(false);
      return;
    }

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) {
      if (error.message.includes("Invalid login")) {
        toast.error("Email ou senha incorretos");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Bem-vindo de volta! 🚀");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-3 rounded-2xl gradient-primary text-primary-foreground shadow-soft">
            <PiggyBank className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold">Sistema Primeiros 10K</h1>
            <p className="text-sm text-muted-foreground">Sua jornada até R$ 10.000</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Acessar o Sistema Primeiros 10K</CardTitle>
            <CardDescription>Entre com seu email e senha</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <Link to="/forgot-password" className="text-primary hover:underline">
                  Esqueci minha senha
                </Link>
                <Link to="/signup" className="text-muted-foreground hover:text-foreground">
                  Criar conta
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
