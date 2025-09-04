import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { terser } from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

const packageJson = require('./package.json');

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
      {
        name: 'MarzPay',
        file: 'dist/marzpay.umd.js',
        format: 'umd',
        sourcemap: true,
      },
      {
        name: 'MarzPay',
        file: 'dist/marzpay.min.js',
        format: 'umd',
        sourcemap: true,
        plugins: [terser()],
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
      }),
    ],
    external: ['uuid'],
  },
  {
    input: 'dist/marzpay.d.ts',
    output: [{ file: 'dist/marzpay.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];
