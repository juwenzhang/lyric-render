import { defineConfig } from 'rollup'
import typescript from 'rollup-plugin-typescript2'
import dts from 'rollup-plugin-dts'
import terser from '@rollup/plugin-terser'

export default defineConfig([
  {
    input: 'src/index.ts',
    plugins: [typescript()],
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        name: 'LyricRendererCore',
        plugins: [terser()],
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        name: 'LyricRendererCore',
        plugins: [terser()],
      },
    ],
  },
  {
    input: 'src/index.ts',
    plugins: [dts()],
    output: [
      {
        file: 'dist/index.d.ts',
        format: 'esm',
      },
    ],
  },
])
