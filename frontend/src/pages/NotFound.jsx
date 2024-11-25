// File path: code_tutor2/frontend/src/pages/NotFound.jsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logger from "@/services/frontendLogger";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Log the page access for analytics or debugging purposes
    logger.info("NotFound", "Page accessed");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center p-8 max-w-md">
        <h2 className="text-2xl font-bold mb-4">Page non trouvée</h2>
        <p className="text-muted-foreground mb-4">
          La page que vous recherchez n&apos;existe pas.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    </div>
  );
};

export default NotFound;
