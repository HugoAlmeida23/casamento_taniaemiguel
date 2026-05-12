import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  define: {
    'import.meta.env.PUBLIC_SUPABASE_URL': JSON.stringify('https://test-project.supabase.co'),
  },
});
