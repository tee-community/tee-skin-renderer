import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        copyPublicDir: false,
        emptyOutDir: true,
        minify: false,
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'TeeSkinRenderer',
            fileName: 'tee-skin-renderer',
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    plugins: [
        {
            name: 'emit-index',
            generateBundle() {
                this.emitFile({
                    type: 'asset',
                    fileName: 'index.html',
                    source: fs.readFileSync(resolve(__dirname, 'index.dist.html'), 'utf-8'),
                });
            },
        },
        dts({
            include: ['src'],
            outDir: ['dist'],
            // staticImport: true,
            rollupTypes: true,
            // declarationOnly: true,
        }),
    ],
});
