// File path : code_tutor2/frontend/vite.config.js

import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// Utilisation de la méthode import.meta.url pour résoudre le problème '__dirname' non défini
const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
