import { test, expect } from "@playwright/test";
import { createTestListing, deleteTestListing, type TestListing } from "./support/fixtures";
import { selectAdmin } from "./support/supabase-admin";
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "./support/env";

const TEST_WHATSAPP_NUMBER = "+919999900000";

async function patchSiteSettings(fields: Record<string, unknown>) {
  await fetch(`${SUPABASE_URL}/rest/v1/site_settings?id=eq.true`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fields),
  });
}

test.describe("Search -> PDP -> WhatsApp click", () => {
  let listing: TestListing;
  let originalWhatsappNumber: unknown = null;

  test.beforeAll(async () => {
    listing = await createTestListing({ locality: "Bodakdev" });

    const [settings] = await selectAdmin("site_settings", "select=whatsapp_number");
    originalWhatsappNumber = settings?.whatsapp_number ?? null;
    await patchSiteSettings({ whatsapp_number: TEST_WHATSAPP_NUMBER });
  });

  test.afterAll(async () => {
    await patchSiteSettings({ whatsapp_number: originalWhatsappNumber });
    await deleteTestListing(listing.id);
  });

  test("filtering by locality finds the listing, and its WhatsApp link is correct", async ({ page }) => {
    await page.goto(`/properties?locality=${encodeURIComponent("Bodakdev")}`);

    const card = page.getByRole("link", { name: new RegExp(listing.title) });
    await expect(card).toBeVisible();
    await card.click();

    await expect(page).toHaveURL(new RegExp(listing.slug));
    await expect(page.getByRole("heading", { name: listing.title })).toBeVisible();

    const whatsappLink = page.getByRole("link", { name: /whatsapp/i }).first();
    await expect(whatsappLink).toBeVisible();

    const href = await whatsappLink.getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).toMatch(/^https:\/\/wa\.me\/919999900000\?text=/);

    const decodedText = decodeURIComponent(href!.split("?text=")[1]);
    expect(decodedText).toContain(listing.title);
  });
});
