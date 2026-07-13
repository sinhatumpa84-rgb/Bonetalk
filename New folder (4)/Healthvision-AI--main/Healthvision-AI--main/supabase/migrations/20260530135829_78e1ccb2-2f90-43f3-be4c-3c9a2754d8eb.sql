CREATE POLICY "Users can update their own medical scans"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'medical-scans' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'medical-scans' AND (auth.uid())::text = (storage.foldername(name))[1]);