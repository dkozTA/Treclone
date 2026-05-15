import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.integration.test.ts', 'src/**/*.integration.test.tsx'],
        exclude: ['node_modules', 'dist'],
        testTimeout: 30000,
        hookTimeout: 30000,
        setupFiles: ['./src/tests/integration-setup.ts'],
        reporters: ['default'],
    },
})