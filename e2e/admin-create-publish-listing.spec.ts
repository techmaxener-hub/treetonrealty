import { test, expect } from "@playwright/test";
import { adminCreateUser, adminDeleteUser, adminSetProfile, testEmail } from "./support/supabase-admin";
import { deleteAdmin } from "./support/supabase-admin";
import { clickAndExpectUrl, loginAsAdmin } from "./support/admin-login";

const PASSWORD = "E2ETestAdmin!2026Verify";

test.describe("Admin login -> create listing -> publish -> appears on public site", () => {
  let adminId: string;
  let adminEmail: string;
  let listingId: string | null = null;

  test.beforeAll(async () => {
    adminEmail = testEmail("admin-create-listing");
    adminId = await adminCreateUser(adminEmail, PASSWORD, "E2E Test Admin");
    await adminSetProfile(adminId, { full_name: "E2E Test Admin", role: "admin", status: "Active" });
  });

  test.afterAll(async () => {
    if (listingId) await deleteAdmin("listings", listingId);
    await adminDeleteUser(adminId);
  });

  test("a newly created listing becomes visible on the public site once published", async ({ page }) => {
    await loginAsAdmin(page, adminEmail, PASSWORD);

    await page.goto("/admin/listings/new");
    const title = `E2E Admin-Created Listing ${Date.now()}`;
    await page.getByLabel(/^title$/i).fill(title);
    await page.getByLabel(/description/i).fill("E2E TEST FIXTURE -- created via admin UI, safe to delete.");
    await page.getByLabel(/locality/i).fill("Bodakdev");
    await page.getByLabel(/carpet area/i).fill("1200");
    await page.getByLabel(/^price/i).fill("5000000");

    await clickAndExpectUrl(
      page,
      page.getByRole("button", { name: /create listing/i }),
      /\/admin\/listings\/[0-9a-f-]+\/edit/
    );

    const url = page.url();
    listingId = url.match(/\/admin\/listings\/([0-9a-f-]+)\/edit/)?.[1] ?? null;
    expect(listingId).toBeTruthy();

    // Not published yet -- must not appear on the public site.
    const publicResBefore = await page.request.get(`/properties?locality=Bodakdev`);
    expect((await publicResBefore.text())).not.toContain(title);

    await page.getByLabel(/published \(visible on public site\)/i).check();
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page.getByText(/^saved\.?$/i)).toBeVisible();

    await page.goto(`/properties?locality=${encodeURIComponent("Bodakdev")}`);
    await expect(page.getByRole("link", { name: new RegExp(title) })).toBeVisible();
  });
});
