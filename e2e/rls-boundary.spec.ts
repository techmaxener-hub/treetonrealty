// RLS boundary tests -- API-only (no browser needed), hitting PostgREST
// directly as different signed-in users to prove RLS actually blocks
// cross-boundary reads. See supabase/migrations/20260828160200_leads_assignment.sql
// (leads/site_visits "own or downline") and 20260828120200_profiles.sql
// (profiles "self or admin") for the policies under test.
import { test, expect } from "@playwright/test";
import {
  adminCreateUser,
  adminDeleteUser,
  adminSetProfile,
  deleteAdmin,
  insertAdmin,
  selectAs,
  signInAs,
  testEmail,
} from "./support/supabase-admin";

const PASSWORD = "E2ETestBroker!2026Verify";

test.describe("RLS boundary: a Broker cannot read another Broker's lead", () => {
  let brokerAId: string;
  let brokerAEmail: string;
  let brokerBId: string;
  let brokerBEmail: string;
  let leadId: string;

  test.beforeAll(async () => {
    brokerAEmail = testEmail("broker-a");
    brokerAId = await adminCreateUser(brokerAEmail, PASSWORD, "E2E Broker A");
    await adminSetProfile(brokerAId, { full_name: "E2E Broker A", role: "broker", status: "Active" });

    brokerBEmail = testEmail("broker-b");
    brokerBId = await adminCreateUser(brokerBEmail, PASSWORD, "E2E Broker B");
    await adminSetProfile(brokerBId, { full_name: "E2E Broker B", role: "broker", status: "Active" });

    const lead = await insertAdmin<{ id: string }>("leads", {
      name: "E2E RLS Test Lead",
      phone: "+91 90000 00096",
      source: "contact_page",
      status: "New",
      assigned_to: brokerAId,
    });
    leadId = lead.id;
  });

  test.afterAll(async () => {
    await deleteAdmin("leads", leadId);
    await adminDeleteUser(brokerAId);
    await adminDeleteUser(brokerBId);
  });

  test("Broker A (the owner) can see their own assigned lead", async () => {
    const token = await signInAs(brokerAEmail, PASSWORD);
    const rows = await selectAs(token, "leads", `select=id&id=eq.${leadId}`);
    expect(rows).toHaveLength(1);
  });

  test("Broker B (unrelated) cannot see Broker A's assigned lead via direct API call", async () => {
    const token = await signInAs(brokerBEmail, PASSWORD);
    const rows = await selectAs(token, "leads", `select=id&id=eq.${leadId}`);
    expect(rows).toHaveLength(0);
  });
});

test.describe("RLS boundary: a Sub-Broker's commission data is not firm-wide readable", () => {
  let subBrokerId: string;
  let subBrokerEmail: string;
  let unrelatedBrokerId: string;
  let unrelatedBrokerEmail: string;

  test.beforeAll(async () => {
    subBrokerEmail = testEmail("sub-broker");
    subBrokerId = await adminCreateUser(subBrokerEmail, PASSWORD, "E2E Sub Broker");
    await adminSetProfile(subBrokerId, {
      full_name: "E2E Sub Broker",
      role: "sub_broker",
      status: "Active",
      commission_percent: 2.5,
    });

    unrelatedBrokerEmail = testEmail("unrelated-broker");
    unrelatedBrokerId = await adminCreateUser(unrelatedBrokerEmail, PASSWORD, "E2E Unrelated Broker");
    await adminSetProfile(unrelatedBrokerId, {
      full_name: "E2E Unrelated Broker",
      role: "broker",
      status: "Active",
      // Deliberately NOT reports_to the sub-broker's manager -- an unrelated
      // peer, so is_self_or_downline(subBrokerId) must be false for them.
    });
  });

  test.afterAll(async () => {
    await adminDeleteUser(subBrokerId);
    await adminDeleteUser(unrelatedBrokerId);
  });

  test("an unrelated Broker cannot read the Sub-Broker's commission_percent via direct API call", async () => {
    const token = await signInAs(unrelatedBrokerEmail, PASSWORD);
    const rows = await selectAs(token, "profiles", `select=commission_percent&id=eq.${subBrokerId}`);
    expect(rows).toHaveLength(0);
  });

  test("the Sub-Broker can read their own commission_percent", async () => {
    const token = await signInAs(subBrokerEmail, PASSWORD);
    const rows = await selectAs(token, "profiles", `select=commission_percent&id=eq.${subBrokerId}`);
    expect(rows).toHaveLength(1);
    expect(rows[0].commission_percent).toBe(2.5);
  });

  // NOTE: the natural third case here -- "a Team Lead CAN see their own
  // downline Sub-Broker's commission_percent" -- needs the
  // profiles_select_self_or_downline_or_admin policy from
  // 20260829100000_profiles_select_self_or_downline.sql, which as of this
  // writing has NOT been applied to the live project (no CLI/DB access to
  // it from this environment -- see PR/commit notes). Once that migration is
  // applied, add: create a Team Lead with subBrokerId.reports_to pointing at
  // them (directly or via an intermediate Broker), sign in as the Team Lead,
  // and assert the row IS visible.
});
