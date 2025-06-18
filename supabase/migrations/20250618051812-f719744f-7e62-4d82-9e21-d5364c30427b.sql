
-- Create table for focus sessions to track user study time and sync with Google Calendar
CREATE TABLE public.focus_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('work', 'shortBreak', 'longBreak')),
  duration_minutes INTEGER NOT NULL,
  task_title TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  google_calendar_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for focus sessions
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own focus sessions" 
  ON public.focus_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own focus sessions" 
  ON public.focus_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own focus sessions" 
  ON public.focus_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create table for storing user activities for dashboard recent activity
CREATE TABLE public.user_recent_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('task_completed', 'exam_attended', 'meeting_attended', 'focus_session', 'assignment_submitted')),
  title TEXT NOT NULL,
  description TEXT,
  related_id UUID, -- Can reference todos, focus_sessions, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for recent activities
ALTER TABLE public.user_recent_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recent activities" 
  ON public.user_recent_activities 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recent activities" 
  ON public.user_recent_activities 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to automatically create recent activity when tasks are completed
CREATE OR REPLACE FUNCTION public.create_task_completion_activity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only create activity when task is being marked as completed
  IF NEW.completed = true AND OLD.completed = false THEN
    INSERT INTO public.user_recent_activities (
      user_id,
      activity_type,
      title,
      description,
      related_id
    ) VALUES (
      NEW.user_id,
      'task_completed',
      'Completed: ' || NEW.title,
      NEW.description,
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_todo_completed
  AFTER UPDATE ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION public.create_task_completion_activity();

-- Create trigger to automatically create activity when focus sessions are completed
CREATE OR REPLACE FUNCTION public.create_focus_session_activity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only create activity when session is completed
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    INSERT INTO public.user_recent_activities (
      user_id,
      activity_type,
      title,
      description,
      related_id
    ) VALUES (
      NEW.user_id,
      'focus_session',
      CASE 
        WHEN NEW.task_title IS NOT NULL THEN 'Focus Session: ' || NEW.task_title
        ELSE 'Focus Session (' || NEW.duration_minutes || ' min)'
      END,
      'Completed ' || NEW.session_type || ' session',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_focus_session_completed
  AFTER UPDATE ON public.focus_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_focus_session_activity();

-- Update user_stats table to track focus session data
CREATE OR REPLACE FUNCTION public.update_user_stats_focus()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update study hours when focus session is completed
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL AND NEW.session_type = 'work' THEN
    INSERT INTO public.user_stats (user_id, study_hours)
    VALUES (NEW.user_id, NEW.duration_minutes)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      study_hours = user_stats.study_hours + NEW.duration_minutes,
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_focus_session_stats_update
  AFTER UPDATE ON public.focus_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_stats_focus();
