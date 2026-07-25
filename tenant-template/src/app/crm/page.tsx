import { createClient } from "@/lib/supabase/server";
import {
  getLeadFunnel,
  getLeadSources,
  getLeadsOverTime,
  getDealSummary,
  getDealsClosedOverTime,
  getListingStatusBreakdown,
  getListingSegmentBreakdown,
  getTopViewedListings,
  getTeamPerformance,
  getAutomationSummary,
} from "@/lib/data/crm/reports";
import { ReportKpiCard } from "@/components/crm/report-kpi-card";
import { ReportBarList } from "@/components/crm/report-bar-list";
import { ReportTimeSeries } from "@/components/crm/report-time-series";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  LEAD_STAGES,
  LEAD_SOURCE_LABELS,
  DEAL_STAGES,
  LISTING_STATUS_LABELS,
  SEGMENT_LABELS,
  ROLE_LABELS,
  AUTOMATION_TRIGGER_LABELS,
} from "@/lib/constants";
import { formatCurrencyINR, localizedText } from "@/lib/utils";

export const dynamic = "force-dynamic";

// A dashboard, not a report generator: every widget here is a thin
// re-shaping of the report_* RPCs (migration 0011), which are plain SQL
// functions run as the calling user -- the same leads/deals/listings RLS
// that scopes the rest of the CRM scopes what shows up here too. A leaf
// advisor sees their own numbers; a master_advisor sees their downline
// roll up; broker/employee see everything. No separate access-control
// decision was made for this page.
export default async function CrmDashboardPage() {
  const supabase = await createClient();

  const [funnel, sources, leadsOverTime, dealSummary, dealsOverTime, listingStatus, listingSegment, topViewed, team, automation] =
    await Promise.all([
      getLeadFunnel(supabase),
      getLeadSources(supabase),
      getLeadsOverTime(supabase, 30),
      getDealSummary(supabase),
      getDealsClosedOverTime(supabase, 6),
      getListingStatusBreakdown(supabase),
      getListingSegmentBreakdown(supabase),
      getTopViewedListings(supabase, 5),
      getTeamPerformance(supabase),
      getAutomationSummary(supabase, 30),
    ]);

  const openLeads = funnel.filter((f) => f.stage !== "closed_won" && f.stage !== "closed_lost").reduce((sum, f) => sum + f.total, 0);
  const wonLeads = funnel.find((f) => f.stage === "closed_won")?.total ?? 0;

  const pipelineStages = dealSummary.filter((d) => d.stage !== "closed");
  const pipelineValue = pipelineStages.reduce((sum, d) => sum + d.total_value, 0);
  const pipelineCount = pipelineStages.reduce((sum, d) => sum + d.total, 0);
  const closedStage = dealSummary.find((d) => d.stage === "closed");

  const activeListings = listingStatus.find((s) => s.status === "available")?.total ?? 0;
  const totalListings = listingStatus.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">An overview of leads, deals, listings, and team performance in your scope.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <ReportKpiCard label="Open leads" value={String(openLeads)} />
          <ReportKpiCard label="Leads won" value={String(wonLeads)} />
          <ReportKpiCard label="Deals in pipeline" value={String(pipelineCount)} sublabel={formatCurrencyINR(pipelineValue)} />
          <ReportKpiCard
            label="Closed deals"
            value={String(closedStage?.total ?? 0)}
            sublabel={`${formatCurrencyINR(closedStage?.total_value ?? 0)} · commission ${formatCurrencyINR(closedStage?.total_commission ?? 0)}`}
          />
          <ReportKpiCard label="Active listings" value={String(activeListings)} sublabel={`${totalListings} total`} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lead funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportBarList
                items={LEAD_STAGES.map((s) => ({
                  label: s.label,
                  value: funnel.find((f) => f.stage === s.value)?.total ?? 0,
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lead sources</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportBarList
                items={sources.map((s) => ({
                  label: LEAD_SOURCE_LABELS[s.source],
                  value: s.total,
                  sublabel: s.won > 0 ? `${s.won} won` : undefined,
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leads, last 30 days</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportTimeSeries
                points={leadsOverTime.map((d) => ({
                  label: new Date(d.day).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
                  value: d.total,
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deals closed, last 6 months</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportTimeSeries
                points={dealsOverTime.map((d) => ({
                  label: new Date(d.month).toLocaleDateString("en-IN", { month: "short" }),
                  value: d.total,
                }))}
                valueFormatter={(n) => `${n} deal${n === 1 ? "" : "s"}`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deal pipeline by stage</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportBarList
                items={DEAL_STAGES.map((s) => ({
                  label: s.label,
                  value: dealSummary.find((d) => d.stage === s.value)?.total ?? 0,
                  sublabel: formatCurrencyINR(dealSummary.find((d) => d.stage === s.value)?.total_value ?? 0),
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Listings by status</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportBarList items={listingStatus.map((s) => ({ label: LISTING_STATUS_LABELS[s.status], value: s.total }))} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Listings by segment</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportBarList items={listingSegment.map((s) => ({ label: SEGMENT_LABELS[s.segment], value: s.total }))} />
            </CardContent>
          </Card>

          {topViewed.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Most viewed listings</CardTitle>
              </CardHeader>
              <CardContent>
                <ReportBarList
                  items={topViewed.map((l) => ({ label: localizedText(l.title), value: l.views }))}
                  valueFormatter={(n) => `${n} view${n === 1 ? "" : "s"}`}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Team performance</CardTitle>
          </CardHeader>
          <CardContent>
            {team.length === 0 ? (
              <p className="text-sm text-muted-foreground">No advisors in scope yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Leads assigned</TableHead>
                    <TableHead className="text-right">Leads won</TableHead>
                    <TableHead className="text-right">Deals closed</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.map((member) => (
                    <TableRow key={member.profile_id}>
                      <TableCell className="font-medium">{member.full_name}</TableCell>
                      <TableCell>{ROLE_LABELS[member.role]}</TableCell>
                      <TableCell className="text-right tabular-nums">{member.leads_assigned}</TableCell>
                      <TableCell className="text-right tabular-nums">{member.leads_won}</TableCell>
                      <TableCell className="text-right tabular-nums">{member.deals_closed}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrencyINR(member.revenue)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrencyINR(member.commission)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {automation.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Automation activity, last 30 days</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trigger</TableHead>
                    <TableHead className="text-right">Sent</TableHead>
                    <TableHead className="text-right">Failed</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {automation.map((row) => (
                    <TableRow key={row.trigger_type}>
                      <TableCell className="font-medium">{AUTOMATION_TRIGGER_LABELS[row.trigger_type]}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.sent}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.failed}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.pending}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
