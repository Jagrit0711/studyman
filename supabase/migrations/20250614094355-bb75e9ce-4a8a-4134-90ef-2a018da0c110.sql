
-- Create table for user profile details
CREATE TABLE public.user_profile_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  college TEXT,
  school_year TEXT,
  major TEXT,
  enable_mom_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.user_profile_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile details" 
  ON public.user_profile_details 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile details" 
  ON public.user_profile_details 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile details" 
  ON public.user_profile_details 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create table for colleges/universities
CREATE TABLE public.colleges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT DEFAULT 'university', -- university, college, school
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some default colleges/universities
INSERT INTO public.colleges (name, type) VALUES
  ('Harvard University', 'university'),
  ('Stanford University', 'university'),
  ('MIT', 'university'),
  ('Yale University', 'university'),
  ('Princeton University', 'university'),
  ('Columbia University', 'university'),
  ('University of California, Berkeley', 'university'),
  ('UCLA', 'university'),
  ('University of Chicago', 'university'),
  ('New York University', 'university'),
  ('Boston University', 'university'),
  ('Carnegie Mellon University', 'university'),
  ('Cornell University', 'university'),
  ('Duke University', 'university'),
  ('Georgetown University', 'university'),
  ('Northwestern University', 'university'),
  ('University of Pennsylvania', 'university'),
  ('Vanderbilt University', 'university'),
  ('Washington University', 'university'),
  ('Emory University', 'university'),
  ('Harvard High School', 'school'),
  ('Stuyvesant High School', 'school'),
  ('Phillips Exeter Academy', 'school'),
  ('Phillips Academy Andover', 'school'),
  ('The Bronx High School of Science', 'school');

-- Create table for majors/fields of study
CREATE TABLE public.majors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some default majors
INSERT INTO public.majors (name) VALUES
  ('Computer Science'),
  ('Engineering'),
  ('Business Administration'),
  ('Psychology'),
  ('Biology'),
  ('Chemistry'),
  ('Physics'),
  ('Mathematics'),
  ('Economics'),
  ('Political Science'),
  ('English Literature'),
  ('History'),
  ('Philosophy'),
  ('Art'),
  ('Music'),
  ('Pre-Med'),
  ('Pre-Law'),
  ('Environmental Science'),
  ('Sociology'),
  ('Anthropology'),
  ('Communications'),
  ('Marketing'),
  ('Finance'),
  ('Accounting'),
  ('Mechanical Engineering'),
  ('Electrical Engineering'),
  ('Civil Engineering'),
  ('Biomedical Engineering'),
  ('Data Science'),
  ('Graphic Design');

-- Make colleges and majors publicly readable so users can see all options
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.majors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view colleges" 
  ON public.colleges 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view majors" 
  ON public.majors 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow authenticated users to add new colleges and majors
CREATE POLICY "Authenticated users can add colleges" 
  ON public.colleges 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can add majors" 
  ON public.majors 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);
