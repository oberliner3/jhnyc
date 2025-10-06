import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [{
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
}, ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"), {
  ignores: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ],
  rules: {
    "react/no-danger": "error",
    "react/no-danger-with-children": "error",
    // Prevent importing server-side modules in client components
    // This prevents the critical production error where server-side environment
    // variables are accessed on the client. See PRODUCTION_ERROR_FIX_V2.md
    "no-restricted-imports": ["error", {
      patterns: [{
        group: ["**/lib/api/*", "**/lib/utils/*-server-utils*"],
        message: "Server-side modules cannot be imported in client components. Use API routes (e.g., /api/products) instead. See docs/MIGRATION_GUIDE.md for details."
      }]
    }],
  },
}, {
  // Allow server-side files to import server-side modules
  files: [
    "app/api/**/*.ts",
    "app/api/**/*.tsx",
    "lib/api/**/*.ts",
    "lib/utils/*-server-utils.ts",
    "lib/data/**/*.ts",
  ],
  rules: {
    "no-restricted-imports": "off",
  },
}, {
  files: [
    "components/common/product-schema.tsx",
    "components/common/website-schema.tsx",
    "components/common/safe-html.tsx",
  ],
  rules: {
    "react/no-danger": "off",
    "react/no-danger-with-children": "off",
  },
}];

export default eslintConfig;
