import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default [
  // ES Module build
  {
    input: 'lib/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'es'
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        declaration: true,
        outDir: 'dist'
      })
    ],
    external: ['socket.io-client', 'engine.io-client']
  },
  // CommonJS build
  {
    input: 'lib/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs'
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript()
    ],
    external: ['socket.io-client', 'engine.io-client']
  },
  // UMD build for MiniProgram
  {
    input: 'lib/index.ts',
    output: {
      file: 'dist/socket.io-mp-client.js',
      format: 'umd',
      name: 'io'
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript(),
      terser()
    ]
  }
];
