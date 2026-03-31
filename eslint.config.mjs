import { defineConfig, globalIgnores } from "eslint/config";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

let nextVitals, nextTs;
try {
  ({ default: nextVitals } = await import("eslint-config-next/core-web-vitals.js"));
} catch {
  nextVitals = require("eslint-config-next/core-web-vitals");
}
try {
  ({ default: nextTs } = await import("eslint-config-next/typescript.js"));
} catch {
  nextTs = require("eslint-config-next/typescript");
}

const reactRuleOverrides = Object.fromEntries(
  [
    ...(Array.isArray(nextVitals) ? nextVitals : [nextVitals]),
    ...(Array.isArray(nextTs) ? nextTs : [nextTs]),
  ]
    .flatMap((config) => Object.keys(config.rules ?? {}))
    .filter((rule) => rule.startsWith("react/"))
    .map((rule) => [rule, "off"]),
);

const eslintConfig = defineConfig([
  ...(Array.isArray(nextVitals) ? nextVitals : [nextVitals]),
  ...(Array.isArray(nextTs) ? nextTs : [nextTs]),
  {
    rules: reactRuleOverrides,
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
