/* v8 ignore next 10 -- @preserve */

import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  platform: "neutral",
  dts: {
    oxc: true,
  },
});
