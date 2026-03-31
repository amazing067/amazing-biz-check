-- Supabase SQL Editor에서 실행
-- 1) managers 테이블 생성
create table if not exists public.managers (
  id text primary key,
  company text not null,
  name text not null,
  suffix text null,
  phone text not null,
  logo text not null,
  category text not null,
  color text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_managers_updated_at on public.managers;
create trigger trg_managers_updated_at
before update on public.managers
for each row execute function public.set_updated_at();

-- 3) 초기 데이터 업서트 (현재 managers.json 기준)
insert into public.managers (id, company, name, suffix, phone, logo, category, color)
values
  ('1', 'KB손해보험', '배선우', null, '010-2229-7535', 'KB손해보험.png', '손해보험', '#FCAF16'),
  ('2', '메리츠화재', '조전미', null, '010-7234-1488', '메리츠화재.png', '손해보험', '#E60012'),
  ('3', '롯데손해보험', '송승경', null, '010-7924-4125', '롯데손해보험.png', '손해보험', '#ed1c24'),
  ('4', '현대해상', '권유정', null, '010-5282-9034', '현대해상.png', '손해보험', '#002c5f'),
  ('5', '삼성화재', '조민정', null, '010-3298-5238', '삼성화재.png', '손해보험', '#003CDC'),
  ('6', 'DB손해보험', '오미선', null, '010-2532-7802', 'DB손해보험.png', '손해보험', '#0080c6'),
  ('7', '농협손해보험', '김정연', null, '010-7674-9193', '농협손해보험.png', '손해보험', '#00a650'),
  ('8', '흥국화재', '김영주', null, '010-4551-8245', '흥국화재.png', '손해보험', '#E91E8C'),
  ('9', 'MG손해보험', '박은희', null, '010-3272-8661', 'MG손해보험.png', '손해보험', '#00a651'),
  ('10', '한화손해보험', '허광범', null, '010-3864-0622', '한화손해보험.png', '손해보험', '#f37321'),
  ('11', '하나손해보험', '김명신', null, '010-3685-6377', '하나손해보험.png', '손해보험', '#009591'),
  ('12', 'AIG손해보험', '이영민', null, '010-8191-0258', 'AIG손해보험.png', '손해보험', '#000066'),
  ('13', '라이나손해보험', '최형미', null, '010-8671-4240', '라이나손해보험.png', '손해보험', '#0066b3'),
  ('14', '미래에셋', '전혜진', null, '010-9814-9404', '미래에셋생명.png', '생명보험', '#043B72'),
  ('15', '한화생명', '김원숙', null, '010-5093-9635', '한화생명.png', '생명보험', '#f37321'),
  ('16', 'ABL생명', '하수정', null, '010-8442-9343', 'ABL생명.png', '생명보험', '#c41e3a'),
  ('17', '삼성생명', '설동인', null, '010-5338-7434', '삼성생명.png', '생명보험', '#003CDC'),
  ('18', '신한생명', '배수영', null, '010-7931-8116', '신한라이프.png', '생명보험', '#0046ff'),
  ('19', 'KB생명', '한채원', null, '010-8988-8976', 'KB라이프생명.png', '생명보험', '#FCAF16'),
  ('20', 'DB생명', '김세진', '부지점장', '010-6560-0130', 'DB생명.png', '생명보험', '#0080c6'),
  ('21', '흥국생명', '김지영', null, '010-8128-8959', '흥국생명.png', '생명보험', '#E91E8C'),
  ('22', '동양생명', '최서현', null, '010-3140-5713', '동양생명.png', '생명보험', '#e30613'),
  ('23', '교보생명', '박미령', null, '010-5843-5123', '교보생명.png', '생명보험', '#00a650'),
  ('24', '메트라이프', '박나영', null, '010-8962-3283', '메트라이프.png', '생명보험', '#0077c8'),
  ('25', '라이나생명', '강은혜', null, '010-5563-1810', '라이나생명.png', '생명보험', '#0066b3'),
  ('26', '하나생명', '김명아', null, '010-8422-9096', '하나생명.png', '생명보험', '#009591'),
  ('27', '농협생명', '박효진', null, '010-3417-5958', '농협생명.png', '생명보험', '#00a650'),
  ('28', 'KDB생명', '정혜정', null, '010-4389-6325', 'KDB생명.png', '생명보험', '#006eb8')
on conflict (id) do update
set
  company = excluded.company,
  name = excluded.name,
  suffix = excluded.suffix,
  phone = excluded.phone,
  logo = excluded.logo,
  category = excluded.category,
  color = excluded.color;
