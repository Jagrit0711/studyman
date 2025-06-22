-- Create a table for subjects
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a table for tags
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add a subject_id foreign key to study_rooms
ALTER TABLE public.study_rooms
ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id);

-- Create a join table for the many-to-many relationship between rooms and tags
CREATE TABLE IF NOT EXISTS public.study_room_tags (
    room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (room_id, tag_id)
);

-- (Optional) Insert some default subjects if they don't exist
INSERT INTO public.subjects (name)
VALUES
    ('Mathematics'),
    ('Computer Science'),
    ('Physics'),
    ('Chemistry'),
    ('Biology'),
    ('Medicine'),
    ('Engineering'),
    ('Literature'),
    ('History'),
    ('Other')
ON CONFLICT (name) DO NOTHING;

-- Remove old text-based columns if they exist and you have migrated the data
-- ALTER TABLE public.study_rooms DROP COLUMN IF EXISTS subject;
-- ALTER TABLE public.study_rooms DROP COLUMN IF EXISTS tags; 