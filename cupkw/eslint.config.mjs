import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      /*
       * Reading localStorage in an effect is how this app stays
       * hydration-safe: the server has no access to it, so the first client
       * render must match the server and the stored value is applied straight
       * after mount. That is a deliberate setState-in-effect.
       */
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    // react-three-fiber drives the camera and object transforms by mutating
    // them inside useFrame, once per frame, outside React's render cycle.
    files: ["src/components/three/**/*.tsx"],
    rules: {
      "react-hooks/immutability": "off",
    },
  },
]);

export default eslintConfig;
