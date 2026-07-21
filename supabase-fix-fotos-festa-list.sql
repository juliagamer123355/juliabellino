-- A foto foi enviada com sucesso pro bucket, mas a página /fotos não
-- conseguia listar os arquivos: bucket "público" só libera o download
-- direto por link, a listagem (list()) ainda exige uma política de SELECT.
create policy "Permitir listar fotos-festa publicamente"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'fotos-festa');
