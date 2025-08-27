import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: false,
  plugins: [
    react(),
    {
      name: "create-types-declaration",
      async writeBundle() {
        const fs = await import("fs");
        const path = await import("path");

        const srcDeclaration = path.resolve(
          import.meta.dirname,
          "src/index.d.ts"
        );
        const distDeclaration = path.resolve(
          import.meta.dirname,
          "dist/index.d.ts"
        );

        try {
          if (fs.existsSync(srcDeclaration)) {
            fs.copyFileSync(srcDeclaration, distDeclaration);
          }
        } catch (error) {
          console.warn(
            "Failed to create types declaration file:",
            error.message
          );
        }
      },
    },
    {
      name: "inline-css",
      apply: "build",
      enforce: "post",
      generateBundle(_, bundle) {
        const cssAssets = Object.keys(bundle).filter((name) =>
          name.endsWith(".css")
        );
        const jsAssets = Object.keys(bundle).filter((name) =>
          name.endsWith(".js")
        );

        cssAssets.forEach((cssName) => {
          const cssAsset = bundle[cssName];
          const cssCode = cssAsset.source;

          jsAssets.forEach((jsName) => {
            const jsAsset = bundle[jsName];
            const cssInlineCode = `
            (function() {
              if (typeof document !== 'undefined') {
                var style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = ${JSON.stringify(cssCode)};
                document.getElementsByTagName('head')[0].appendChild(style);
              }
            })();
            `;
            jsAsset.code = cssInlineCode + "\n" + jsAsset.code;
          });

          delete bundle[cssName];
        });
      },
    },
  ],
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
