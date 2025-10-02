import type { NextConfig } from "next";
import createNextJsObfuscator from "nextjs-obfuscator";

// Configure obfuscator options
const obfuscatorOptions = {
  // Basic options
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: process.env.NODE_ENV === "production",
  debugProtectionInterval: 0,
  disableConsoleOutput: false, // Keep false to detect React errors
  domainLock: [],
  domainLockRedirectUrl: "about:blank",
  forceTransformStrings: [],
  identifierNamesCache: null,
  identifierNamesGenerator: "hexadecimal",
  identifiersDictionary: [],
  identifiersPrefix: "",
  ignoreImports: false,
  log: false,
  numbersToExpressions: true,
  optionsPreset: "default",
  renameGlobals: false,
  renameProperties: false,
  renamePropertiesMode: "safe",
  reservedNames: [],
  reservedStrings: [],
  seed: 0,
  selfDefending: process.env.NODE_ENV === "production",
  simplify: true,
  sourceMap: false,
  sourceMapBaseUrl: "",
  sourceMapFileName: "",
  sourceMapMode: "separate",
  sourceMapSourcesMode: "sources-content",
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayCallsTransformThreshold: 0.5,
  stringArrayEncoding: ["base64"],
  stringArrayIndexesType: ["hexadecimal-number"],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 1,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 2,
  stringArrayWrappersType: "variable",
  stringArrayThreshold: 0.75,
  target: "browser",
  transformObjectKeys: true,
  unicodeEscapeSequence: false,
};

// Configure plugin options
const pluginOptions = {
  enabled: process.env.NODE_ENV === "production" ? true : ("detect" as const),
  patterns: [
    "**/*.js",
    "**/*.jsx",
    "**/*.ts",
    "**/*.tsx",
  ],
  obfuscateFiles: {
    buildManifest: true,
    ssgManifest: true,
    webpack: true,
    additionalModules: [
      "lib/**/*",
      "utils/**/*",
      "contexts/**/*",
      "hooks/**/*",
    ],
  },
  log: process.env.NODE_ENV !== "production",
};

// Create obfuscator wrapper
const withNextJsObfuscator = createNextJsObfuscator(
  obfuscatorOptions,
  pluginOptions
);

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  // IMAGES
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "placeholdit.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "moritotabi.com",
      },
      {
        hostname: "localhost",
      },
    ],
  },
  // REDIRECTS
  async redirects() {
    return [
      {
        source: '/products',
        destination: '/collections/all',
        permanent: true,
      },
      {
        source: '/collections',
        destination: '/collections/all',
        permanent: true,
      },
    ]
  },
  // HEADERS
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

// Export with obfuscator wrapper
export default process.env.DISABLE_OBFUSCATION === "true" 
  ? nextConfig 
  : withNextJsObfuscator(nextConfig);
