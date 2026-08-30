import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PLAYWRIGHT_PORT ?? "3010";
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;

// E2E tests hit a real Supabase project (see .env.local) -- never run these
// against production. webServer is left unmanaged (not auto-started) since
// this repo's Windows/Supabase DNS quirk (see README) needs the dev server
// started manually via `npm run dev`; point PLAYWRIGHT_BASE_URL/PORT at it.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
