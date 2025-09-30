import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
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
    },
  },
  {
    files: [
      "components/common/product-schema.tsx",
      "components/common/website-schema.tsx",
      "components/common/safe-html.tsx",
    ],
    rules: {
      "react/no-danger": "off",
      "react/no-danger-with-children": "off",
    },
  },
];

export default eslintConfig;
