
-- Add more diverse subjects to the database
INSERT INTO public.subjects (name, icon, color) VALUES
('Photography', '📸', '#8B5CF6'),
('Cooking', '👨‍🍳', '#F59E0B'),
('Music Theory', '🎵', '#10B981'),
('Digital Marketing', '📱', '#3B82F6'),
('Graphic Design', '🎨', '#EC4899'),
('Web Development', '💻', '#6366F1'),
('Psychology', '🧠', '#84CC16'),
('Creative Writing', '✍️', '#F97316'),
('Foreign Languages', '🌍', '#06B6D4'),
('Fitness & Health', '💪', '#EF4444'),
('Business Management', '📊', '#8B5CF6'),
('Data Science', '📈', '#10B981'),
('Video Editing', '🎬', '#F59E0B'),
('Public Speaking', '🎤', '#EC4899'),
('Philosophy', '🤔', '#6B7280'),
('Astronomy', '🌟', '#3B82F6'),
('Nutrition', '🥗', '#84CC16'),
('Interior Design', '🏠', '#F97316'),
('Podcasting', '🎙️', '#8B5CF6'),
('Financial Planning', '💰', '#10B981')
ON CONFLICT (name) DO NOTHING;
