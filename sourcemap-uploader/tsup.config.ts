import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/lib.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  noExternal: ["glob"],
});
