import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The demo runs the wrapper's own source, so the live site always shows the code of the
// release it was built from. `dedupe` makes that source use the demo's React and 3d-spinner
// instead of any copy installed one folder up.
export default defineConfig({
  base: "/3d-spinner-react/",
  plugins: [react()],
  resolve: {
    alias: {
      "3d-spinner-react": fileURLToPath(new URL("../src/index.ts", import.meta.url)),
    },
    dedupe: ["react", "react-dom", "3d-spinner"],
  },
  server: {
    fs: { allow: [".."] },
  },
});
