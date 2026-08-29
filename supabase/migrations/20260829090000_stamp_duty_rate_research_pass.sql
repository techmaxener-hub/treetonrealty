-- Research pass on the placeholder stamp_duty_rates seeded in
-- 20260828121300_stamp_duty_rates.sql. Every figure below was cross-checked
-- against multiple named 2026 secondary sources (real-estate finance sites,
-- IGR/Revenue Department portal references) on 2026-08-29 -- see each row's
-- source_notes for specifics. This is still NOT a primary government
-- notification confirmation (no .gov.in text was fetched directly), so
-- is_verified stays false throughout. A local legal advisor must confirm
-- against the live state notification before this calculator is presented to
-- buyers as authoritative -- same standing caveat as the original migration
-- and the project README.

-- Gujarat: rate itself (4.9%) was already correct. What was missing is the
-- real women's concession, which this schema cannot represent -- Gujarat's
-- concession is a 100% REGISTRATION FEE WAIVER for sole female ownership
-- (women pay 0% registration vs 1% for men), not a stamp-duty-percent
-- discount. women_discount_percent/women_discount_amount in lib/stamp-duty.ts
-- only models a cut off stamp_duty_percent, so this concession is left
-- unmodeled here rather than mis-represented as a stamp duty discount --
-- flagged in source_notes for whoever extends the schema.
update public.stamp_duty_rates
set
  women_discount_notes = 'Gujarat''s women''s concession is a 100% REGISTRATION FEE waiver for sole female ownership (women pay 0% registration vs 1% for men) -- NOT a stamp duty percentage discount. The current schema only models a cut off stamp_duty_percent, so this concession cannot be represented by women_discount_percent without a schema change (e.g. a women_registration_discount_percent column). Left unmodeled here rather than mis-represented.',
  source_notes = 'Researched 2026-08-29 against multiple secondary sources (homefirstindia.com, bajajhousingfinance.in, cleartax.in, propertysdeal.in), all agreeing on 4.9% = 3.5% basic stamp duty + 1.4% surcharge (40% of basic), administered under the Gujarat Stamp Act, 1958 via the GARVI portal (garvi.gujarat.gov.in). Rate is charged on the higher of Jantri (government-notified minimum valuation) or actual transaction value. Still not a primary government-notification confirmation -- a local advisor should verify against GARVI/Gujarat Stamp Act text before launch.'
where state = 'Gujarat';

-- Maharashtra: the flat 5.0%/1.0% placeholder didn't reflect the real
-- area-tiered structure, and never modeled the women's discount at all. This
-- update switches to the Mumbai/major-municipal-corporation rate (the most
-- common case for a metro property) with the real 1-point women's discount,
-- while keeping the area-variance caveat prominent -- a full fix needs a
-- locality-aware rate lookup, out of scope for this data-only pass.
update public.stamp_duty_rates
set
  stamp_duty_percent = 6.0,
  registration_percent = 1.0,
  women_discount_percent = 1.0,
  women_discount_notes = 'Confirmed real concession (not "historically offered" as the prior placeholder note suggested): women buyers registering residential property in SOLE name get a 1-point stamp duty discount (6% to 5% at the Mumbai/major-corporation rate). Joint ownership with a male co-owner gets the blended rate, not the full discount. Commercial properties do not qualify.',
  source_notes = 'Researched 2026-08-29 against multiple secondary sources (kalpataru.com, squareyards.com, stampdutycalc.in, 1acre.in, propertybutler.in). Rates are AREA-TIERED, not a single state rate: Mumbai/major municipal corporations 6% (M) / 5% (F), Pune/Thane/Nagpur 7% (M) / 6% (F), other municipal corporations 6% (M) / 5% (F), Municipal Councils 4% (M) / 3% (F), Gram Panchayat areas 3% (M) / 2% (F) -- plus a 1% metro cess in Mumbai/MMR on top. This row uses the Mumbai/major-corporation figures as the most representative single value; a real fix needs per-area rows or a locality lookup, not a flat state rate. Registration is 1% capped around Rs 30,000 in practice. Confirm against igrmaharashtra.gov.in (e-ASR) before launch.'
where state = 'Maharashtra';

-- Karnataka: registration_percent genuinely changed (1% -> 2%, effective
-- 31 Aug 2025) -- this is a real correction, not just a note update. Slabs
-- below remain unmodeled (schema has no value-tier columns); this row keeps
-- using the >Rs 45L slab rate since that's what applies to this business's
-- actual (luxury-segment) listings.
update public.stamp_duty_rates
set
  stamp_duty_percent = 5.0,
  registration_percent = 2.0,
  source_notes = 'Researched 2026-08-29 against multiple secondary sources (homefirstindia.com, sobha.com, 1acre.in, deedsure.in). Confirmed slab structure: 2% up to Rs 20L, 3% for Rs 20-45L, 5% above Rs 45L (this row uses the >Rs 45L slab, the relevant one for this business''s listings -- all currently well above that threshold). Registration fee increased from 1% to 2% effective 31 Aug 2025 (a real change from the original placeholder, not just better sourcing). On top of stamp duty: a 10%-of-stamp-duty cess, plus a 2% (urban) or 3% (rural) surcharge -- neither modeled in this row''s stamp_duty_percent. Lower slabs (<=Rs 45L) still need separate rows once the schema supports value tiers. Confirm against the Karnataka Stamps Act / Kaveri portal before launch.'
where state = 'Karnataka';

-- Delhi: figures were already accurate (6% M / 4% F / 5% joint, 1%
-- registration). Source_notes upgraded from "unverified placeholder" to
-- cite the actual research pass and note the NDMC-area exception found.
update public.stamp_duty_rates
set
  source_notes = 'Researched 2026-08-29 against multiple secondary sources (cleartax.in, godrejcapital.com, nobroker.in, willjini.com), all agreeing: 6% (male, any property value), 4% (female sole owner), 5% (joint male+female, regardless of ownership split), 1% registration. NDMC areas (a small subset of Delhi) use different rates: 5.5% (M) / 3.5% (F) / 4.5% (joint) -- not modeled in this row, which uses the general-Delhi rates applicable to the vast majority of properties. Confirm against the Delhi Revenue Department current notification before launch.'
where state = 'Delhi';

-- Uttar Pradesh: the flat-rupee-rebate caveat was correct as far as it went,
-- but the placeholder never modeled the real 1-point female-sole-owner
-- discount that exists alongside it. Adding that now; the value-capped extra
-- rebate and the flat Rs 10,000 discount remain unmodeled (schema only
-- supports a flat percentage discount, not a value-bracket-conditional one).
update public.stamp_duty_rates
set
  women_discount_percent = 1.0,
  women_discount_notes = 'Confirmed 1-point discount for sole female ownership (7% male to 6% female), on top of which UP offers an ADDITIONAL rebate of up to 1% for properties valued <= Rs 1 crore (potentially 5% effective for female buyers in that bracket) plus a flat Rs 10,000 rebate on the final payable amount -- neither the value-bracket condition nor the flat rupee rebate is modeled by this schema (percent-only, no value tiers). Joint male-female ownership is reported at 6.5%, also unmodeled (schema has no joint-ownership rate).',
  source_notes = 'Researched 2026-08-29 against multiple secondary sources (homefirstindia.com, kotak.bank.in, cleartax.in, godrejcapital.com, 1acre.in, 2bigha.ai). Registration remains flat 1% for all buyer categories, confirmed. Blood-relative transfers (spouse/children/parents/siblings/grandparents) get a flat Rs 5,000 stamp duty + Rs 1,000 processing fee, registration capped at Rs 20,000 -- entirely separate from the percentage model here, not applicable to arm''s-length listings. Confirm against the UP Stamp & Registration Department current notification before launch.'
where state = 'Uttar Pradesh';
