import { test, expect } from "@playwright/test";
import {
  adminCreateUser,
  adminDeleteUser,
  adminSetProfile,
  deleteAdmin,
  insertAdmin,
  selectAdmin,
  testEmail,
} from "./support/supabase-admin";
import { loginAsAdmin } from "./support/admin-login";

const PASSWORD = "E2ETestAdmin!2026Verify";

test.describe("Lead Kanban drag persists status", () => {
  let adminId: string;
  let adminEmail: string;
  let leadId: string;
  const leadName = `E2E Kanban Lead ${Date.now()}`;

  test.beforeAll(async () => {
    adminEmail = testEmail("admin-kanban");
    adminId = await adminCreateUser(adminEmail, PASSWORD, "E2E Test Admin");
    await adminSetProfile(adminId, { full_name: "E2E Test Admin", role: "admin", status: "Active" });

    const lead = await insertAdmin<{ id: string }>("leads", {
      name: leadName,
      phone: "+91 90000 00097",
      source: "contact_page",
      status: "New",
    });
    leadId = lead.id;
  });

  test.afterAll(async () => {
    await deleteAdmin("leads", leadId);
    await adminDeleteUser(adminId);
  });

  test("dragging a card from New to Contacted persists to the database", async ({ page }) => {
    await loginAsAdmin(page, adminEmail, PASSWORD);
    await page.goto("/admin/leads");

    const card = page.getByText(leadName, { exact: true });
    await expect(card).toBeVisible();

    // dnd-kit's useDraggable listeners are wired only onto the small grip-
    // handle icon inside the card (see leads-board.tsx LeadCard), not the
    // whole card div -- starting the drag from the card's text/button area
    // has no pointer listeners attached. With one lead in this isolated
    // fixture, there's exactly one grip handle on the page.
    const gripHandle = page.locator(".cursor-grab").first();
    await expect(gripHandle).toBeVisible();

    const contactedHeading = page.getByRole("heading", { name: "Contacted", exact: true });
    await expect(contactedHeading).toBeVisible();
    // The heading's own bounding box is just its short text ("Contacted",
    // ~70px wide) -- not the ~288px-wide droppable column div it sits in
    // (StageColumn's outer div, two levels up: h2 -> header row -> column).
    // Using the heading's box directly under-measures the column, which
    // under-shoots the drop-target math below.
    const contactedColumn = contactedHeading.locator("xpath=../..");

    const cardBox = await gripHandle.boundingBox();
    const columnBox = await contactedColumn.boundingBox();
    if (!cardBox || !columnBox) throw new Error("Could not measure drag source/target.");

    const startX = cardBox.x + cardBox.width / 2;
    const startY = cardBox.y + cardBox.height / 2;
    // dnd-kit's closestCenter picks whichever droppable's rect CENTER is
    // nearest the CARD'S translated rect center (a pointer delta applied to
    // the whole card, not just wherever on it you grabbed) -- not whichever
    // element is literally under the cursor. Aiming only at the column's
    // own center under-shoots, since the grip handle already sits well
    // right of the card's own center; aim deep into the column (75% across
    // it) so the card's translated center clearly crosses the midpoint
    // between the New and Contacted columns' rect centers.
    const endX = columnBox.x + columnBox.width * 0.75;
    const endY = columnBox.y + 150;

    // dnd-kit's PointerSensor listens for native PointerEvents. Playwright's
    // page.mouse.* API drives input through CDP as synthetic mouse events;
    // Chromium's mouse-to-pointer-event translation for those doesn't
    // reliably carry the pointerId/isPrimary bookkeeping dnd-kit's internal
    // activation tracking expects, so the sensor never fires (confirmed via
    // manual browser testing: the exact same coordinates work when dragged
    // by an actual OS-level pointer). Dispatching real PointerEvents
    // ourselves sidesteps that translation layer entirely.
    async function firePointer(type: string, x: number, y: number) {
      await page.evaluate(
        ([evtType, ex, ey]) => {
          const el = document.elementFromPoint(Number(ex), Number(ey));
          el?.dispatchEvent(
            new PointerEvent(evtType as string, {
              bubbles: true,
              cancelable: true,
              composed: true,
              pointerId: 1,
              pointerType: "mouse",
              isPrimary: true,
              button: 0,
              buttons: evtType === "pointerup" ? 0 : 1,
              clientX: Number(ex),
              clientY: Number(ey),
            })
          );
        },
        [type, x, y]
      );
    }

    await firePointer("pointerdown", startX, startY);
    await page.waitForTimeout(100);

    const steps = 8;
    for (let i = 1; i <= steps; i++) {
      const x = startX + ((endX - startX) * i) / steps;
      const y = startY + ((endY - startY) * i) / steps;
      await firePointer("pointermove", x, y);
      await page.waitForTimeout(80);
    }

    await firePointer("pointerup", endX, endY);

    await expect(async () => {
      const [lead] = await selectAdmin("leads", `select=status&id=eq.${leadId}`);
      expect(lead?.status).toBe("Contacted");
    }).toPass({ timeout: 10_000 });
  });
});
