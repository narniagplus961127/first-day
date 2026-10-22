import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';
const status = JSON.parse(
  readFileSync(
    process.env.FIRSTDAY_TEST_SUPABASE_STATUS_FILE ||
      join(tmpdir(), 'firstday-supabase-fixture', 'status.json'),
    'utf8',
  ),
);
export default defineConfig({
  testDir: './tests/knowledge',
  globalSetup: './tests/knowledge/setup.mjs',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:3200', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
  ],
  webServer: [
    {
      command: 'node tests/knowledge/groq-fixture.mjs',
      url: 'http://127.0.0.1:19031',
      reuseExistingServer: false,
    },
    {
      command: 'node tests/knowledge/google-fixture.mjs',
      url: 'http://127.0.0.1:19030',
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev -- --hostname 127.0.0.1 --port 3200',
      url: 'http://127.0.0.1:3200/login',
      reuseExistingServer: false,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.PUBLISHABLE_KEY,
        SUPABASE_SECRET_KEY: status.SECRET_KEY,
        GOOGLE_GENERATIVE_AI_API_KEY: 'controlled-external-provider',
        GOOGLE_EMBEDDING_BASE_URL: 'http://127.0.0.1:19030',
        GROQ_API_KEY: 'controlled-external-provider',
        GROQ_BASE_URL: 'http://127.0.0.1:19031',
        DEMO_EMAIL: 'demo@firstday.example',
        DEMO_PASSWORD: 'FirstDayDemo!2026',
      },
    },
  ],
});
