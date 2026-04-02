create table if not exists public.dashboard_notices (
  notice_key text primary key,
  content text not null,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_dashboard_notices_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists trg_dashboard_notices_updated_at on public.dashboard_notices;
create trigger trg_dashboard_notices_updated_at
before update on public.dashboard_notices
for each row
execute function public.touch_dashboard_notices_updated_at();

insert into public.dashboard_notices (notice_key, content)
values
(
  'gj2',
  '<div class="notice-text"><div class="notice-top">4월부터 전체보험사 모니터링이 변경되었습니다</div><div>질문 복잡해지고 <span class="notice-yn">예/아니오</span> 섞여서 나오니</div><div>끝까지 확인 한 후 답변해주세요!!</div><div class="notice-strong">청약 후 3시간 후에만 해피콜 진행가능</div><div class="notice-sub">(3시간 전에는 해피콜 진행이 불가능합니다)</div></div>'
),
(
  'public',
  '<div class="notice-text"><div class="notice-top">4월부터 전체보험사 모니터링이 변경되었습니다</div><div>질문 복잡해지고 <span class="notice-yn">예/아니오</span> 섞여서 나오니</div><div>끝까지 확인 한 후 답변해주세요!!</div><div class="notice-strong">청약 후 3시간 후에만 해피콜 진행가능</div><div class="notice-sub">(3시간 전에는 해피콜 진행이 불가능합니다)</div></div>'
)
on conflict (notice_key) do update
set content = excluded.content,
    updated_at = now();
