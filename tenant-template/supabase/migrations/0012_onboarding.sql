-- Broker onboarding (Step 10): a first-run flag so the CRM can tell "no
-- broker_profile row yet, or one that was never finished" apart from a
-- broker who genuinely has nothing more to fill in. broker_profile itself
-- needs no new RPC -- broker_profile_manage (0002) already lets a broker
-- insert/update it directly, since it's their own row to own.

alter table broker_profile add column onboarding_completed boolean not null default false;
