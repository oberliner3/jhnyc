// .eslintrc.js
module.exports = {
  extends: ["next/core-web-vitals", "next/typescript", "prettier"],
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
  overrides: [
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
  ],
  ignorePatterns: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "*.config.js",
  ],
};