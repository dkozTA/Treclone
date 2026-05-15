import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    plugins: [react({ jsxRuntime: 'automatic' })],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/tests/setup.ts'],
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        exclude: ['node_modules', 'dist'],
        testTimeout: 10000,
        hookTimeout: 10000,
        teardownTimeout: 5000,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'node_modules/',
                'dist/',
                '**/*.d.ts',
                '**/*.stories.{ts,tsx}',
                '**/index.ts',
            ],
            thresholds: {
                lines: 70,
                functions: 70,
                branches: 60,
                statements: 70,
            },
        },
        reporters: ['default', 'html', 'json'],
        outputFile: {
            html: './coverage/index.html',
            json: './coverage/coverage.json',
        },
    },
})