import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  goal_name: string | null;
  goal_image: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signInAsAdmin: (email: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const MASTER_ADMIN_KEY = "primeiros_10k_admin_session";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem(MASTER_ADMIN_KEY) !== null;
  });

  useEffect(() => {
    if (isAdmin) {
      const adminSession = localStorage.getItem(MASTER_ADMIN_KEY);
      if (adminSession) {
        const adminData = JSON.parse(adminSession);
        setUser({
          id: "00000000-0000-0000-0000-000000000000",
          email: adminData.email,
          role: "admin",
          aud: "authenticated",
          created_at: new Date().toISOString(),
        } as User);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        supabase
          .from("profiles")
          .select("id, name, email, goal_name, goal_image")
          .eq("id", newSession.user.id)
          .maybeSingle()
          .then(({ data }) => setProfile(data));
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        supabase
          .from("profiles")
          .select("id, name, email, goal_name, goal_image")
          .eq("id", s.user.id)
          .maybeSingle()
          .then(({ data }) => setProfile(data));
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isAdmin]);

  const signInAsAdmin = (email: string) => {
    const adminUser = {
      id: "00000000-0000-0000-0000-000000000000",
      email: email,
      role: "admin",
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User;

    setIsAdmin(true);
    setUser(adminUser);
    setLoading(false);
    localStorage.setItem(MASTER_ADMIN_KEY, JSON.stringify({ email }));
  };

  const signOut = async () => {
    if (isAdmin) {
      localStorage.removeItem(MASTER_ADMIN_KEY);
      setIsAdmin(false);
      setUser(null);
    } else {
      await supabase.auth.signOut();
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isAdmin, signInAsAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
