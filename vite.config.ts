import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const getBasePath = (mode: string) => {
  if (mode === "development") {
    return "/";
  }

  const explicitBasePath = process.env.VITE_BASE_PATH;
  if (explicitBasePath) {
    return explicitBasePath.endsWith("/") ? explicitBasePath : `${explicitBasePath}/`;
  }

  const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];
  return repository ? `/${repository}/` : "/";
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: getBasePath(mode),
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
