const esbuild = require('esbuild');
const esbuildPluginTsc = require('esbuild-plugin-tsc')

esbuild
    .build({
        entryPoints: ['./src/main.ts'],
        outdir: './dist',
        bundle: true,
        sourcemap: true,
        platform: 'node',
        target: ['es2022'],
        tsconfig: './tsconfig.json',
        plugins: [esbuildPluginTsc()],
        })
.catch(() => process.exit(1));
