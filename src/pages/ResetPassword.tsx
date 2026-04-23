import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, Loader2 } from "lucide-react";
import { toast } from "sonner";

const schema = z
  .object({
    password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }).max(100),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Senha atualizada! 🎉");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-3 rounded-2xl gradient-primary text-primary-foreground shadow-soft">
            <PiggyBank className="w-7 h-7" />
          </div>
          <h1 className="font-display text-2xl font-extrabold">Nova senha</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Redefinir senha</CardTitle>
            <CardDescription>Crie uma nova senha segura.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
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
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Atualizar senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
