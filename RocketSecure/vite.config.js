import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { viteSingleFile } from "vite-plugin-singlefile";

const isInline = process.env.VITE_BUILD_INLINE !== "false";

export default defineConfig({
  plugins: [vue(), isInline && viteSingleFile()].filter(Boolean),
  base: "./",
  build: {
    manifest: true,
  },
});
