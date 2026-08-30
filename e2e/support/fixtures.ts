// Throwaway listing/brochure fixtures for e2e tests -- every listing created
// here is tagged with an "E2E TEST FIXTURE" marker in its description and
// MUST be deleted by the test's cleanup step (see each spec's afterAll).
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "./env";
import { deleteAdmin, insertAdmin } from "./supabase-admin";

const ADMIN_HEADERS = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
};

export interface TestListing {
  id: string;
  slug: string;
  title: string;
  ref_code: string;
}

function uniqueSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function createTestListing(overrides: Record<string, unknown> = {}): Promise<TestListing> {
  const suffix = uniqueSuffix();
  const listing = await insertAdmin<TestListing>("listings", {
    slug: `e2e-test-listing-${suffix}`,
    ref_code: `E2E-${suffix.slice(-6).toUpperCase()}`,
    title: `E2E Test Listing ${suffix}`,
    description: "E2E TEST FIXTURE -- created by Playwright, safe to delete.",
    property_type: "Apartment",
    status: "Active",
    locality: "Bodakdev",
    city: "Ahmedabad",
    state: "Gujarat",
    carpet_area_sqft: 1200,
    price_inr: 5_000_000,
    possession_status: "Ready",
    is_published: true,
    ...overrides,
  });
  return listing;
}

export async function deleteTestListing(id: string) {
  await deleteAdmin("listings", id);
}

/** Uploads a tiny placeholder PDF to the private 'brochures' bucket and links it to the listing. */
export async function attachTestBrochure(listing: TestListing): Promise<string> {
  const storagePath = `e2e/${listing.id}/test-brochure.pdf`;
  const tinyPdf = "%PDF-1.4\n%E2E TEST FIXTURE\n%%EOF";

  const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/brochures/${storagePath}`, {
    method: "POST",
    headers: { ...ADMIN_HEADERS, "Content-Type": "application/pdf" },
    body: tinyPdf,
  });
  if (!uploadRes.ok) {
    throw new Error(`Failed to upload test brochure: ${uploadRes.status} ${await uploadRes.text()}`);
  }

  await fetch(`${SUPABASE_URL}/rest/v1/listings?id=eq.${listing.id}`, {
    method: "PATCH",
    headers: { ...ADMIN_HEADERS, "Content-Type": "application/json" },
    body: JSON.stringify({ brochure_storage_path: storagePath }),
  });

  return storagePath;
}

export async function deleteTestBrochure(storagePath: string) {
  await fetch(`${SUPABASE_URL}/storage/v1/object/brochures/${storagePath}`, {
    method: "DELETE",
    headers: ADMIN_HEADERS,
  });
}
