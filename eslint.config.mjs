import { defineConfig, globalIgnores } from "eslint/config";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

async function loadNextConfig(moduleName) {
  try {
    // Next 16+ (ESM with exports map)
    const mod = await import(moduleName);
    return mod.default || mod;
  } catch (err) {
    // Next 15 (ESM without exports map requires .js extension)
    if (err.code === "ERR_PACKAGE_PATH_NOT_EXPORTED") {
      try {
        const mod = await import(`${moduleName}.js`);
        return mod.default || mod;
      } catch {
        // Fallback to CJS require
        return require(moduleName);
      }
    }
    // Fallback to CJS require
    return require(moduleName);
  }
}

const nextVitals = await loadNextConfig("eslint-config-next/core-web-vitals");
const nextTs = await loadNextConfig("eslint-config-next/typescript");

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
