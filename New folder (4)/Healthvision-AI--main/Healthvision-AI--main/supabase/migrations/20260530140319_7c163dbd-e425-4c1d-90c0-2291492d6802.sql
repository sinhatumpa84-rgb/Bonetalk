
-- Role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('patient', 'doctor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role public.app_role NOT NULL DEFAULT 'patient',
  specialty text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User roles readable by everyone authenticated" ON public.user_roles;
CREATE POLICY "User roles readable by everyone authenticated"
ON public.user_roles FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "User roles insertable by self" ON public.user_roles;
CREATE POLICY "User roles insertable by self"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "User roles updatable by self" ON public.user_roles;
CREATE POLICY "User roles updatable by self"
ON public.user_roles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Add doctor + meeting fields to appointments
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS doctor_id uuid,
  ADD COLUMN IF NOT EXISTS meeting_room text;

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);

-- Replace appointments RLS so doctor can also access rows assigned to them
DROP POLICY IF EXISTS "Appointments by owner" ON public.appointments;

CREATE POLICY "Appointments select for patient or doctor"
ON public.appointments FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = doctor_id);

CREATE POLICY "Appointments insert by patient"
ON public.appointments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Appointments update by patient or doctor"
ON public.appointments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = doctor_id)
WITH CHECK (auth.uid() = user_id OR auth.uid() = doctor_id);

CREATE POLICY "Appointments delete by patient"
ON public.appointments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
