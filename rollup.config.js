import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@wessberg/rollup-plugin-ts';
import { terser } from 'rollup-plugin-terser';

export default {
	input: `src/index.ts`,
	output: [
		{
			file: "dist/index.umd.js",
			name: "index",
			format: "umd",
		},
		{
			file: "dist/index.amd.js",
			format: "amd",
		},
		{
			file: "dist/index.cjs.js",
			format: "cjs",
		},
		{
			file: "dist/index.esm.js",
			format: "es",
		},
	],
	plugins: [typescript(), resolve(), commonjs(), terser({ output: { comments: false } })],
};
