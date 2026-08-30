import { test, expect } from "@playwright/test";
import { createTestListing, deleteTestListing, type TestListing } from "./support/fixtures";
import { deleteAdmin, selectAdmin } from "./support/supabase-admin";

test.describe("Site visit booking -> confirmation", () => {
  let listing: TestListing;
  const createdLeadIds: string[] = [];
  const createdSiteVisitIds: string[] = [];

  test.beforeAll(async () => {
    listing = await createTestListing();
  });

  test.afterAll(async () => {
    for (const id of createdSiteVisitIds) await deleteAdmin("site_visits", id);
    for (const id of createdLeadIds) await deleteAdmin("leads", id);
    await deleteTestListing(listing.id);
  });

  test("booking a site visit shows a confirmation and creates lead + site_visit rows", async ({ page }) => {
    await page.goto(`/properties/${listing.slug}`);

    await page.getByRole("button", { name: /book a site visit/i }).first().click();

    const dialog = page.getByRole("dialog", { name: /book a site visit/i });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel(/full name/i).fill("E2E Test Verify");
    await dialog.getByLabel(/phone number/i).fill("+91 90000 00098");

    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    await dialog.locator('input[type="date"]').fill(futureDate);
    await dialog.locator('input[type="time"]').fill("11:00");

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/site-visits")),
      dialog.getByRole("button", { name: /confirm site visit/i }).click(),
    ]);
    expect(response.status()).toBe(200);

    await expect(page.getByText(/site visit requested/i)).toBeVisible();

    const visits = await selectAdmin("site_visits", `select=id,lead_id&listing_id=eq.${listing.id}`);
    expect(visits.length).toBeGreaterThan(0);
    createdSiteVisitIds.push(...visits.map((v) => v.id as string));
    createdLeadIds.push(...visits.map((v) => v.lead_id as string).filter(Boolean));
  });
});
