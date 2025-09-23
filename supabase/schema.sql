-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');
CREATE TYPE evaluation_status AS ENUM ('draft', 'in_progress', 'completed', 'reviewed');
CREATE TYPE skill_category AS ENUM ('conhecimento', 'habilidade', 'atitude');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'employee',
  department_id UUID,
  position TEXT,
  admission_date DATE,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  manager_id UUID REFERENCES public.profiles(id),
  parent_department_id UUID REFERENCES public.departments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for department in profiles
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_department 
FOREIGN KEY (department_id) 
REFERENCES public.departments(id);

-- Skills table (CHA - Conhecimentos, Habilidades, Atitudes)
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category skill_category NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  is_global BOOLEAN DEFAULT false,
  weight DECIMAL(3,2) DEFAULT 1.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evaluation cycles
CREATE TABLE public.evaluation_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evaluations table
CREATE TABLE public.evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID REFERENCES public.evaluation_cycles(id),
  employee_id UUID REFERENCES public.profiles(id),
  evaluator_id UUID REFERENCES public.profiles(id),
  status evaluation_status DEFAULT 'draft',
  overall_score DECIMAL(3,2),
  comments TEXT,
  strengths TEXT,
  improvements TEXT,
  goals TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evaluation skills (individual skill ratings)
CREATE TABLE public.evaluation_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID REFERENCES public.evaluations(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id),
  score DECIMAL(3,2) CHECK (score >= 0 AND score <= 10),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- External feedback/votes
CREATE TABLE public.external_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES public.profiles(id),
  evaluator_name TEXT NOT NULL,
  evaluator_email TEXT,
  evaluator_id UUID REFERENCES public.profiles(id),
  cycle_id UUID REFERENCES public.evaluation_cycles(id),
  feedback TEXT,
  score DECIMAL(3,2) CHECK (score >= 0 AND score <= 10),
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals and objectives
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  progress DECIMAL(5,2) DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance history
CREATE TABLE public.performance_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES public.profiles(id),
  cycle_id UUID REFERENCES public.evaluation_cycles(id),
  overall_score DECIMAL(3,2),
  ranking INTEGER,
  percentile DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_department ON public.profiles(department_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_evaluations_employee ON public.evaluations(employee_id);
CREATE INDEX idx_evaluations_cycle ON public.evaluations(cycle_id);
CREATE INDEX idx_evaluations_status ON public.evaluations(status);
CREATE INDEX idx_external_feedback_employee ON public.external_feedback(employee_id);
CREATE INDEX idx_goals_employee ON public.goals(employee_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for evaluations (admins and managers can see all, employees only their own)
CREATE POLICY "Employees can view own evaluations" ON public.evaluations
  FOR SELECT USING (
    employee_id = auth.uid() OR
    evaluator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON public.skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_evaluation_cycles_updated_at BEFORE UPDATE ON public.evaluation_cycles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
