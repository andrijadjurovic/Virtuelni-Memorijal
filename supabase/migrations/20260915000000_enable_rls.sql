-- Apply after `npx prisma migrate deploy` has created the quoted Prisma tables.
-- Public browsing is allowed only for PUBLIC memorials; writes stay server/admin-only.

alter table "Memorial" enable row level security;
alter table "TimelineEvent" enable row level security;
alter table "GiftTransaction" enable row level security;
alter table "Condolence" enable row level security;
alter table "FamilyRelation" enable row level security;
alter table "Family" enable row level security;
alter table "User" enable row level security;

create policy "public memorials are readable"
  on "Memorial" for select to anon, authenticated
  using (privacy = 'PUBLIC');

create policy "public memorial timeline is readable"
  on "TimelineEvent" for select to anon, authenticated
  using (exists (select 1 from "Memorial" m where m.id = "TimelineEvent"."memorialId" and m.privacy = 'PUBLIC'));

create policy "active gifts on public memorials are readable"
  on "GiftTransaction" for select to anon, authenticated
  using ("activeUntil" > now() and exists (select 1 from "Memorial" m where m.id = "GiftTransaction"."memorialId" and m.privacy = 'PUBLIC'));

create policy "approved condolences are readable"
  on "Condolence" for select to anon, authenticated
  using (status = 'APPROVED' and exists (select 1 from "Memorial" m where m.id = "Condolence"."memorialId" and m.privacy = 'PUBLIC'));

create policy "visitors can submit pending condolences"
  on "Condolence" for insert to anon, authenticated
  with check (status = 'PENDING');

create policy "family relations on public memorials are readable"
  on "FamilyRelation" for select to anon, authenticated
  using (
    exists (select 1 from "Memorial" m where m.id = "FamilyRelation"."fromMemorialId" and m.privacy = 'PUBLIC')
    and exists (select 1 from "Memorial" m where m.id = "FamilyRelation"."toMemorialId" and m.privacy = 'PUBLIC')
  );