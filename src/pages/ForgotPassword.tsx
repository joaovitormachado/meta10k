import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255),
});

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Link enviado! Veja seu email 📧");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-3 rounded-2xl gradient-primary text-primary-foreground shadow-soft">
            <PiggyBank className="w-7 h-7" />
          </div>
          <h1 className="font-display text-2xl font-extrabold">Recuperar senha</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Esqueci minha senha</CardTitle>
            <CardDescription>
              {sent
                ? "Confira seu email para redefinir a senha."
                : "Enviaremos um link para você criar uma nova senha."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!sent && (
              <form onSubmit={handleReset} className="space-y-4">
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar link de recuperação"}
                </Button>
              </form>
            )}
            <Link
              to="/auth"
              className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para login
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
