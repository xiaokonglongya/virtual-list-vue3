import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueTsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueTsx(),
    dts({
      include: ['src/components/VertualList/index.tsx'],
    }),
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: 'src/components/VertualList/index.tsx',
      name: 'VertualList',
      fileName: 'index',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
