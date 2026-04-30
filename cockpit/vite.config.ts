import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "charts",
              test: /node_modules[\\/](recharts|d3-|victory-vendor|es-toolkit)/,
            },
          ],
        },
      },
    },
  },
});
