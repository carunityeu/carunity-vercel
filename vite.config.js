import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// The Vercel–Supabase integration creates its own variable names. Pick the public ones
// (project URL and anon/publishable key) explicitly; never expose SUPABASE_SERVICE_ROLE_KEY.
// When the integration was connected with a custom prefix (e.g. MYDB_SUPABASE_URL), match by suffix.
const first = (env, names, suffix) =>
  names.map((n) => env[n]).find(Boolean)
  || Object.keys(env).filter((k) => suffix.test(k) && !/SERVICE_ROLE|SECRET|JWT/.test(k)).map((k) => env[k]).find(Boolean)
  || '';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const supabaseUrl = first(env, ['VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'], /SUPABASE_URL$/);
  const supabaseKey = first(env, [
    'VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_PUBLISHABLE_KEY',
  ], /SUPABASE_(ANON|PUBLISHABLE)_KEY$/);
  return {
    logLevel: 'error', // Suppress warnings, only show errors
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseKey),
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    plugins: [
      base44({
        // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
        // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
        legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
        hmrNotifier: true,
        navigationNotifier: true,
        visualEditAgent: true
      }),
      react(),
    ]
  };
});
