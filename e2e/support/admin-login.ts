import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Clicks a button expected to trigger navigation, retrying once if the URL
 * doesn't change in time. Several forms in this app submit via a client
 * component's onSubmit/useActionState handler -- Playwright's click can
 * land before React finishes attaching that handler (same hydration race
 * as the login button below), making the first click a no-op.
 */
export async function clickAndExpectUrl(page: Page, button: Locator, urlPattern: RegExp) {
  await button.click();
  try {
    await expect(page).toHaveURL(urlPattern, { timeout: 6000 });
  } catch (err) {
    // Only retry if the click genuinely had no effect (button still there,
    // meaning no navigation started) -- if the button has already detached,
    // navigation IS happening, just slower than the timeout above, and a
    // second click would hit a stale/gone element instead of helping.
    if (!(await button.isVisible().catch(() => false))) throw err;
    await button.click();
    await expect(page).toHaveURL(urlPattern, { timeout: 8000 });
  }
}

/**
 * Logs in via the admin login form. The "Sign in" button is a React Server
 * Action bound through useActionState -- Playwright's click can land before
 * React finishes attaching the action handler to the form, in which case the
 * first click is a no-op (observed both here and manually during earlier
 * live-run testing). Waiting for network idle before clicking, plus a
 * single retry, makes this reliable without weakening what's being tested.
 */
export async function loginAsAdmin(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);

  await clickAndExpectUrl(page, page.getByRole("button", { name: /sign in/i }), /\/admin$/);
}
