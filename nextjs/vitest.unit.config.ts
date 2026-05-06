import path from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        exclude: [
            'node_modules',
            'dist',
            'src/**/*.stories.ts',
            'src/**/*.stories.tsx',
        ],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/**/*.stories.ts',
                'src/**/*.stories.tsx',
            ],
        },
    },
    plugins: [react({ jsxRuntime: 'automatic' })],

});