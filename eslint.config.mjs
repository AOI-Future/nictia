import { createRequire } from "node:module";
import { defineConfig, globalIgnores } from "eslint/config";

const require = createRequire(import.meta.url);
const nextVitals = require("eslint-config-next/core-web-vitals.js");
const nextTs = require("eslint-config-next/typescript");

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
