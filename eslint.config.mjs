import { defineConfig, globalIgnores } from "eslint/config";

const nextVitals = (await import("eslint-config-next/core-web-vitals")).default;
const nextTs = (await import("eslint-config-next/typescript")).default;

const reactRuleOverrides = Object.fromEntries(
  [...nextVitals, ...nextTs]
    .flatMap((config) => Object.keys(config.rules ?? {}))
    .filter((rule) => rule.startsWith("react/"))
    .map((rule) => [rule, "off"]),
);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
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

