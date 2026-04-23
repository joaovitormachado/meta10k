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

const signupSchema = z
  .object({
    name: z.string().trim().min(2, { message: "Nome muito curto" }).max(100),
    email: z.string().trim().email({ message: "Email inválido" }).max(255),
    password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }).max(100),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

const Signup = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ name, email, password, confirm });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { name: parsed.data.name },
      },
    });
    setLoading(false);
    if (error) {
      if (error.message.includes("already registered") || error.message.includes("already")) {
        toast.error("Este email já está cadastrado");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Conta criada! Bem-vindo 🎉");
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
            <p className="text-sm text-muted-foreground">Comece sua jornada hoje</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Criar minha conta</CardTitle>
            <CardDescription>É grátis e leva menos de 1 minuto</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
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
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmar senha</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Repita a senha"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar minha conta"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Já tem conta?{" "}
                <Link to="/auth" className="text-primary hover:underline">
                  Entrar
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
