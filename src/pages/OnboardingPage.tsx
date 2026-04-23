import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import OnboardingDream from "@/components/OnboardingDream";

const OnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("goal_name, goal_target_value")
          .eq("id", user.id)
          .single();
        
        if (error && error.code !== "PGRST116") {
          throw error;
        }
        
        const hasGoal = !!(data?.goal_name && data?.goal_target_value && Number(data.goal_target_value) > 0);

        if (!hasGoal) {
          setNeedsOnboarding(true);
        } else {
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("Error checking onboarding:", err);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [user, navigate]);

  const handleComplete = () => {
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (needsOnboarding && user) {
    return <OnboardingDream userId={user.id} onComplete={handleComplete} />;
  }

  return null;
};

export default OnboardingPage;