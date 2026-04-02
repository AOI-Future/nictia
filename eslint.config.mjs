import { defineConfig, globalIgnores } from "eslint/config";
import nextConfig from "eslint-config-next";
import nextTs from "eslint-config-next/typescript";
import nextPlugin from "@next/eslint-plugin-next";

const nextVitals = [
  ...nextConfig,
  ...nextTs,
  nextPlugin.configs["core-web-vitals"],
];

const reactRuleOverrides = Object.fromEntries(
  nextVitals
    .flatMap((config) => Object.keys(config.rules ?? {}))
    .filter((rule) => rule.startsWith("react/"))
    .map((rule) => [rule, "off"]),
);

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: reactRuleOverrides,
  },
  globalIgnores([
    ".next/",
    "out/",
    "build/",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
