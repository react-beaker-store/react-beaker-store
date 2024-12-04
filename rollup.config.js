import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

const packageJson = require("./package.json");

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
  {
    input: "./src/index.ts",
    output: [
      {
        file: packageJson.main,
        sourcemap: true
      },
      {
        file: packageJson.module,
        sourcemap: true
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      terser(),
    ],
    external: ["react", "react-dom"],
  },
  {
    input: "./src/index.ts",
    output: [{ file: packageJson.types, format: "es" }],
    plugins: [dts.default()],
  },
];