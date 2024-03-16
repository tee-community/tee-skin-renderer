import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        copyPublicDir: true,
        emptyOutDir: true,
        minify: true,
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'TeeSkinRenderer',
            fileName: 'tee-skin-renderer',
        },
        rollupOptions: {
            output: {
                assetFileNames: "tee-skin-renderer.[ext]",
            },
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
                    fileName: 'demo.umd.html',
                    source: fs.readFileSync(resolve(__dirname, 'demo/demo.umd.html'), 'utf-8'),
                });

                this.emitFile({
                    type: 'asset',
                    fileName: 'demo.html',
                    source: fs.readFileSync(resolve(__dirname, 'demo/demo.html'), 'utf-8'),
                });

                this.emitFile({
                    type: 'asset',
                    fileName: 'demo.css',
                    source: fs.readFileSync(resolve(__dirname, 'demo/demo.css'), 'utf-8'),
                });
            },
        },
        dts({
            include: ['src'],
            outDir: ['dist'],
            rollupTypes: true,
        }),
    ],
});
