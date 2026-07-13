
insert into storage.buckets (id, name, public) values ('medical-scans', 'medical-scans', false)
on conflict (id) do nothing;

create policy "Users read own scans"
on storage.objects for select
using (bucket_id = 'medical-scans' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users upload own scans"
on storage.objects for insert
with check (bucket_id = 'medical-scans' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own scans"
on storage.objects for delete
using (bucket_id = 'medical-scans' and auth.uid()::text = (storage.foldername(name))[1]);
