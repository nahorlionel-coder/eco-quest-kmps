
ALTER TABLE public.missions ADD COLUMN is_sponsored BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.missions ADD COLUMN sponsor_name TEXT;
ALTER TABLE public.missions ADD COLUMN redirect_url TEXT;
ALTER TABLE public.missions ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
