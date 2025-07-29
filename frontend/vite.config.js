import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import packageJson from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: false,
  plugins: [react()],
  build: {
    lib: {
      entry: "./src/index.js",
      name: "ResourceManager",
      fileName: (format) => `resource-manager.${format}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
