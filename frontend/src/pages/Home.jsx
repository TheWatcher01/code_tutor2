// File path: code_tutor2/frontend/src/pages/Home.jsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/common";
import { AuthForm } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Code, ArrowRight, Brain, Rocket } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import logger from "@/services/frontendLogger";

const features = [
  {
    icon: Code,
    title: "Apprentissage Interactif",
    description: "Pratiquez avec des exercices de code en temps réel",
  },
  {
    icon: Brain,
    title: "IA Intelligente",
    description: "Un tuteur IA qui s'adapte à votre niveau",
  },
  {
    icon: Rocket,
    title: "Progression Personnalisée",
    description: "Suivez votre progression à votre rythme",
  },
];

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Handle authentication and redirection
  useEffect(() => {
    logger.info("Home", "Page accessed", {
      isAuthenticated: !!user,
      userId: user?.id,
    });

    if (user && !loading) {
      logger.debug("Home", "Redirecting authenticated user", {
        userId: user.id,
      });
      navigate("/playground");
    }
  }, [user, loading, navigate]);

  // Performance monitoring
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      logger.debug("Home", "Page render completed", {
        renderTime: `${duration.toFixed(2)}ms`,
      });
    };
  }, []);

  if (loading || user) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-10rem)] flex flex-col">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              {/* Hero Content */}
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Devenez développeur avec Code Tutor
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Un tuteur intelligent qui vous accompagne dans votre
                    apprentissage de la programmation. Apprenez à votre rythme
                    avec un feedback personnalisé.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    size="lg"
                    onClick={() =>
                      document
                        .querySelector("#auth-form")
                        .scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Commencer maintenant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Auth Form */}
              <div id="auth-form" className="mx-auto w-full max-w-md">
                <AuthForm />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 bg-secondary/20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-4 text-center"
                >
                  <div className="p-4 bg-primary/10 rounded-full">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

// Component display name for DevTools
Home.displayName = "HomePage";

export default Home;
