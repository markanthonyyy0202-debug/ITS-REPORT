-- Run this in Supabase: SQL Editor > New query > Run. Safe to run again.
create table if not exists action_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  sort int not null default 0,
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

alter table action_categories enable row level security;
alter table rcas enable row level security;
alter table reports enable row level security;

-- No login: anyone with the app link can use the data
drop policy if exists "cats all" on action_categories;
drop policy if exists "rcas all" on rcas;
drop policy if exists "reports read" on reports;
drop policy if exists "reports insert" on reports;
create policy "cats all" on action_categories for all to anon, authenticated using (true) with check (true);
create policy "rcas all" on rcas for all to anon, authenticated using (true) with check (true);
create policy "reports read" on reports for select to anon, authenticated using (true);
create policy "reports insert" on reports for insert to anon, authenticated with check (true);

insert into action_categories (name, sort, actions) values
('AESYS', 1, array[
'Check the message currently displayed onsite',
'Check ventilation and cabinet temperature',
'Check RGB/data output and LED module configuration',
'Check DMS controller communication and alarm status',
'Check switch port status and link/activity LEDs',
'Check relevant cables, connectors and communication/network links',
'Check LED module status',
'Check and inspect RS485 cable connection from controller',
'Check and test PMV 1&2 loop connection',
'Check and inspect service board',
'Check and inspect CONV Board',
'Check and inspect V1044 row controller',
'Check and inspect 0511 CPU Board',
'Check and inspect 0428 CPU Board',
'Check and inspect temperature sensor',
'Check and inspect light sensor',
'Check and inspect 1907 board hub',
'Check and inspect Axial Fan',
'Check and inspect DC power supply',
'Check and test RS485 connection between NTCIP controller to DMS terminal blocks',
'Check and test RS485 connection between NTCIP controller to LCS terminal blocks',
'Check module power cable supply and voltage',
'Confirm the asset returns online and remains stable',
'Check controller/data output to the module',
'Reterminate RS485 Cable wire',
'Reterminate CAT6 data cable going to NTCIP Controller',
'Replace defective LED module and install new unit',
'Replace defective NTCIP Controller and install new unit',
'Replace defective LCD Screen Controller and install new unit',
'Replace defective service board and install new unit',
'Replace defective LAN cable and install new unit',
'Replace defective Fan sensor and install new unit',
'Replace defective CONV Board and install new unit',
'Replace defective V1044 row controller and install new unit',
'Replace defective 0511 CPU Board and install new unit',
'Replace defective 0428 CPU Board and install new unit',
'Replace defective temperature sensor and install new unit',
'Replace defective light sensor and install new unit',
'Replace defective Axial Fan and install new unit',
'Replace defective DC Power supply and install new unit',
'Reseat/reconnect the cable or restart the affected equipment if required',
'Reseat the module and connectors',
'Run display test and verify module operation',
'Reconfigure NTCIP controller',
'Review alarms, logs or diagnostic indications for the reported fault',
'Identify the affected LED module/section from the display or controller diagnostics',
'Inspect module power/data cables and connectors',
'Inspect LED modules, power connections, and data/ribbon cables',
'Inspect equipment status, power supply and physical condition',
'Inspect connectors for loose, damaged, or oxidized contacts',
'Perform a restart/reboot or reseat connection where applicable',
'Perform a controlled restart/reboot or reseat connection where applicable',
'Test the equipment after corrective action and confirm normal operation',
'Test network connectivity/communication to the device',
'Test with a known-good cable/module where available to isolate the faulty component'
]),
('TELEGRA', 2, array[
'Check the message currently displayed onsite',
'Check DMS controller communication and alarm status',
'Test network connectivity/communication to the device',
'Check switch port status and link/activity LEDs',
'Check LED module status',
'Check CAN Interface status',
'Check and test block terminal',
'Reterminate CAT6 cable from CAN interface',
'Reterminate CAT6 cable from Block Terminal',
'Replace defective LED module and install new unit',
'Replace defective CAN Interface and install new unit',
'Replace defective LED Module power cable and install new unit',
'Replace defective OVPS Modular sign and install new unit',
'Replace defective LCS Controller sign and install new unit',
'Replace defective DMS Controller sign and install new unit',
'Replace defective LCD Screen Controller and install new unit',
'Replace defective photocell sensor and install new unit',
'Replace defective LAN cable and install new unit',
'Reseat/reconnect the cable or restart the affected equipment if required',
'Confirm the asset returns online and remains stable',
'Identify the affected LED module/section from the display or controller diagnostics',
'Check module power cable supply and voltage',
'Inspect module power/data cables and connectors',
'Check controller/data output to the module',
'Reseat the module and connectors',
'Test with a known-good cable/module where available to isolate the faulty component',
'Run display test and verify module operation',
'Reconfigure DMS and controller',
'Inspect LED modules, power connections, and data/ribbon cables',
'Inspect equipment status, power supply and physical condition',
'Check relevant cables, connectors and communication/network links',
'Review alarms, logs or diagnostic indications for the reported fault',
'Perform a controlled restart/reboot or reseat connection where applicable',
'Test the equipment after corrective action and confirm normal operation',
'Check ventilation and cabinet temperature',
'Check RGB/data output and LED module configuration',
'Inspect connectors for loose, damaged or oxidized contacts',
're-terminate and re-punch the power cable from the OVPS modular sign from junction box of DMS',
're-terminate and re-punch the CAT6 cable wire from the OVPS modular sign from junction box of DMS'
]),
('CCTV', 3, array[
'Check camera online/offline status and live stream',
'Check camera power, PoE injector/switch port and network link',
'Check Ethernet cable, RJ45 connectors and camera-side connection',
'Check camera live stream and response time',
'Check camera CPU/firmware or device logs for freeze/error indication',
'Check relevant cables, connectors, and communication/network links',
'Check network latency, packet loss, and bandwidth',
'Check camera power/PoE and communication status',
'Check camera live view and PTZ control response',
'Check focus, iris, exposure, white balance and image settings',
'Check incoming power supply from POE (AC & DC)',
'Check and test PTZ',
'Check and update firmware version of CCTV camera',
'Check and test cable connection from PoE to CCTV camera',
'Check and test cable connection from top junction joint connector to CCTV camera CLD',
'Check and inspect connectivity from Longspan extender B to C',
'Conduct factory reset and re-configure CCTV camera',
'Inspect and clean the camera lens',
'Check image quality before and after cleaning',
'Clean lens and external housing',
'Ping/communicate with the camera and check packet loss/latency',
'Power-cycle/reboot the camera and observe whether the fault returns',
'Verify stable live video after restart',
'Verify connectivity from NOC team',
'Verify stable stream after corrective action',
'Verify camera focus and live view',
'Test network connectivity/communication to the device',
'Reboot or restart the CCTV as initial troubleshooting',
'Inspect equipment status, power supply, and physical condition of the CCTV',
'Inspect camera lens/housing for dust or obstruction',
'Inspect for condensation, physical damage or obstruction',
'Inspect PTZ mechanism, mounting/bracket and cable connections',
'Replace defective PoE and install new unit',
'Replace defective CCTV camera and install new unit',
'Replace defective CCTV bubble lens and install new unit',
'Replace defective longspan extender and install new unit'
])
-- fills a category only while it is still empty, so later edits are never overwritten
on conflict (name) do update set actions = excluded.actions where action_categories.actions = '{}';
insert into rcas (name) values ('Communication Issue'),('RGB Issue'),('POE Not Working') on conflict (name) do nothing;
