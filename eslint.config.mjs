// eslint.config.js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 1. Global ignores (only once)
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "coverage/**",
      "*.config.js",
    ],
  },

  // 2. Base configs + global rules combined
  {
    // Spread the configs from Next.js and Prettier
    ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),

    // Add your global rules directly to this object
    rules: {
      "react/no-danger": "error",
      "react/no-danger-with-children": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/lib/api/*", "**/lib/utils/*-server-utils*"],
              message:
                "Server-side modules cannot be imported in client components. Use API routes (e.g., /api/products) instead. See docs/MIGRATION_GUIDE.md for details.",
            },
          ],
        },
      ],
    },
  },

  // 3. Server-side file overrides
  {
    files: [
      "app/api/**/*.ts",
      "app/api/**/*.tsx",
      "app/**/route.ts",
      "app/**/route.tsx",
      "lib/api/**/*.ts",
      "lib/utils/*-server-utils.ts",
      "lib/data/**/*.ts",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },

  // 4. Special component overrides
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