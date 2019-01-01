import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import pkg from "./package.json";

const globals = {
  "prop-types": "PropTypes",
  "react-dom": "ReactDOM",
  react: "React"
};

const external = Object.keys(globals);

export default [
  // browser-friendly UMD build
  {
    input: "src/index.js",
    output: {
      file: pkg.browser,
      name: "libraryName",
      format: "umd",
      globals: globals
    },
    external: external,
    plugins: [
      // we have to remove flow types first, other plugins crash!!!
      babel({
        exclude: ["node_modules/**"]
      }),
      resolve(), // so Rollup can find imported modules from node_modules
      commonjs() // so Rollup can convert commonjs to an ES module
    ]
  },

  // ES module (for bundlers) build.
  //( seems like rollup works the same with and without externals for es build!?)
  {
    input: "src/index.js",
    output: [{ file: pkg.module, format: "es" }],
    external: [...external, "classnames"], // add other dependencies imported from node_modules
    plugins: [
      babel({
        exclude: ["node_modules/**"]
      })
    ]
  }
];
