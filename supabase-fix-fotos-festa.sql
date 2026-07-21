-- Libera o upload de fotos da festa pela página /admin.
create policy "Permitir upload publico em fotos-festa"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'fotos-festa');
