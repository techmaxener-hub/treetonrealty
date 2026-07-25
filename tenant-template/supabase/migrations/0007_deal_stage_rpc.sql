-- Atomic deal stage change + activity_log entry + auto-stamped closed_at,
-- same pattern as update_lead_stage. security invoker: must still respect
-- the caller's own deals_update policy.

create or replace function public.update_deal_stage(p_deal_id uuid, p_new_stage deal_stage)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update deals
  set stage = p_new_stage,
      closed_at = case when p_new_stage = 'closed' then coalesce(closed_at, current_date) else closed_at end
  where id = p_deal_id;

  if not found then
    raise exception 'deal not found or not permitted';
  end if;

  insert into activity_log (deal_id, actor_profile_id, activity_type, content)
  values (p_deal_id, auth.uid(), 'status_change', 'Deal stage changed to ' || p_new_stage::text);
end;
$$;

grant execute on function public.update_deal_stage(uuid, deal_stage) to authenticated;
