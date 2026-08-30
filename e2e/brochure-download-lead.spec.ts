import { test, expect } from "@playwright/test";
import {
  attachTestBrochure,
  createTestListing,
  deleteTestBrochure,
  deleteTestListing,
  type TestListing,
} from "./support/fixtures";
import { deleteAdmin, selectAdmin } from "./support/supabase-admin";

test.describe("Brochure download creates a lead", () => {
  let listing: TestListing;
  let brochurePath: string;
  const createdLeadIds: string[] = [];

  test.beforeAll(async () => {
    listing = await createTestListing();
    brochurePath = await attachTestBrochure(listing);
  });

  test.afterAll(async () => {
    for (const leadId of createdLeadIds) await deleteAdmin("leads", leadId);
    await deleteTestBrochure(brochurePath);
    await deleteTestListing(listing.id);
  });

  test("submitting the brochure form creates a lead and returns a signed URL", async ({ page }) => {
    await page.goto(`/properties/${listing.slug}`);

    await page.getByRole("button", { name: /download brochure/i }).first().click();

    const dialog = page.getByRole("dialog", { name: /download brochure/i });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel(/full name/i).fill("E2E Test Verify");
    await dialog.getByLabel(/phone number/i).fill("+91 90000 00099");

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/brochure-download")),
      dialog.getByRole("button", { name: /get brochure/i }).click(),
    ]);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.url).toContain("brochures");

    const leads = await selectAdmin(
      "leads",
      `select=id&listing_id=eq.${listing.id}&source=eq.brochure_download`
    );
    expect(leads.length).toBeGreaterThan(0);
    createdLeadIds.push(...leads.map((l) => l.id as string));
  });
});
