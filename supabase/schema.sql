-- Run this in Supabase: SQL Editor > New query > Run. Safe to run again.
create table if not exists faults (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  asset text,
  actions text[] not null default '{}',
  created_at timestamptz default now()
);
create table if not exists rcas (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  created_by uuid default auth.uid(),
  location text, report_date date, work_order text, reported_by text,
  reported_fault text, finding text, actions text[], rca text,
  status text, remarks text, report_text text
);

alter table faults enable row level security;
alter table rcas enable row level security;
alter table reports enable row level security;

-- No login: anyone with the app link can use the data
drop policy if exists "faults all" on faults;
drop policy if exists "rcas all" on rcas;
drop policy if exists "reports read" on reports;
drop policy if exists "reports insert" on reports;
create policy "faults all" on faults for all to anon, authenticated using (true) with check (true);
create policy "rcas all" on rcas for all to anon, authenticated using (true) with check (true);
create policy "reports read" on reports for select to anon, authenticated using (true);
create policy "reports insert" on reports for insert to anon, authenticated with check (true);

insert into faults (name, asset, actions) values
('Camera Disconnected','CCTV',array['Check device power supply','Check power cable/connection','Check PoE connection','Check network cable','Check network switch port','Check network connectivity','Check device IP address','Check communication between device and system','Restart device if required','Restart PoE/network port if required','Check device status after restart','Verify device communication','Verify live status/video/data','Confirm device is back online','Perform final system test']),
('Message not found in the controller list','Controller',array['Check controller power supply','Check controller communication','Check controller network connection','Check controller IP address','Check network switch connection','Check communication between controller and server','Check controller configuration','Verify controller is available in the system','Refresh/synchronize controller list','Check controller status after synchronization','Verify message communication','Test message transmission','Verify message display','Confirm controller is operating normally'])
on conflict (name) do nothing;
insert into rcas (name) values ('Communication Issue'),('RGB Issue'),('POE Not Working') on conflict (name) do nothing;
