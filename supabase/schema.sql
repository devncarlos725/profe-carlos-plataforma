-- ==============================================================================
-- Schema SQL para Supabase: Campus Virtual & Centro Docente - Profe Núñez
-- Proyecto: https://lrppdklvvuxqoekvrzvr.supabase.co
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PERFILES (Docente y Alumnos)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')) DEFAULT 'student',
  school TEXT,
  course TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura de perfiles propios y docente" ON public.profiles;
CREATE POLICY "Lectura de perfiles propios y docente"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Actualización de propio perfil" ON public.profiles;
CREATE POLICY "Actualización de propio perfil"
  ON public.profiles FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Inserción de perfil" ON public.profiles;
CREATE POLICY "Inserción de perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- 3. TABLA DE ESCUELAS Y CURSOS VINCULADOS
CREATE TABLE IF NOT EXISTS public.schools_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  days_schedule TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.schools_courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de escuelas y cursos" ON public.schools_courses;
CREATE POLICY "Lectura pública de escuelas y cursos" ON public.schools_courses FOR SELECT USING (true);

-- Insertar escuelas oficiales del Profe Núñez
INSERT INTO public.schools_courses (school_name, course_name, subject_name, days_schedule) VALUES
  ('Mons. Conrero', '2° Año', 'Educación Tecnológica I', 'Jueves y Viernes · 3 hs cátedra'),
  ('Reconquista', '3° Año', 'Educación Tecnológica II', 'Martes · 3 hs cátedra'),
  ('Mancopa', '2° y 3° Año', 'Educación Tecnológica', 'Miércoles (16:40-17:20) y Jueves (13:00-14:20) · 3 hs cátedra'),
  ('El Naranjo', '2° Año', 'Educación Tecnológica I', 'Lunes · 3 hs cátedra'),
  ('Tafí Viejo', '2° Año', 'Educación Tecnológica I', 'Lunes y Martes · 3 hs cátedra'),
  ('Timbó Nuevo', '3° Año', 'Educación Tecnológica II', 'Viernes · 3 hs cátedra')
ON CONFLICT DO NOTHING;

-- 4. TABLA DE EVENTOS DE CALENDARIO DEL PROFE (Horarios, Citas, Dentista, Trámites)
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  day_of_week INTEGER, -- 1=Lunes, 2=Martes, etc.
  specific_date DATE,   -- para citas puntuales (ej: 2026-11-03)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('clase', 'personal', 'tramite', 'viaje', 'ordonez', 'libre')),
  school TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestion de eventos de calendario" ON public.calendar_events;
CREATE POLICY "Gestion de eventos de calendario" ON public.calendar_events FOR ALL USING (true);

-- 5. TABLA DE MATERIALES DE ESTUDIO Y ROADMAP (PDFs, Videos, Guías)
CREATE TABLE IF NOT EXISTS public.learning_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  material_type TEXT NOT NULL CHECK (material_type IN ('pdf', 'video', 'guia', 'tarea')),
  url TEXT NOT NULL,
  file_name TEXT,
  school TEXT NOT NULL, -- o 'Todas'
  course TEXT NOT NULL, -- ej: '2° Año'
  unit_number INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura de materiales" ON public.learning_materials;
CREATE POLICY "Lectura de materiales" ON public.learning_materials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gestion de materiales docente" ON public.learning_materials;
CREATE POLICY "Gestion de materiales docente" ON public.learning_materials FOR ALL USING (true);

-- Insertar materiales iniciales
INSERT INTO public.learning_materials (title, description, material_type, url, file_name, school, course, unit_number, order_index, is_required) VALUES
  ('Guía N° 1: Introducción a los Procesos Tecnológicos y Materiales', 'Conceptos fundamentales de sistemas, insumos, transformaciones y productos tecnológicos. Lectura obligatoria.', 'pdf', 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf', 'Guia_1_Educacion_Tecnologica.pdf', 'Todas', '2° Año', 1, 1, true),
  ('Clase en Video: Estructuras y Mecanismos de Transmisión de Movimiento', 'Explicación audiovisual sobre poleas, engranajes y palancas. Mirá el video completo para desbloquear la actividad.', 'video', 'https://www.youtube.com/embed/fD33i29-060', NULL, 'Todas', '2° Año', 1, 2, true),
  ('Trabajo Práctico N° 1: Análisis de un Mecanismo Cotidiano', 'Elegí un objeto de tu casa (abrelatas, bicicleta o tijera) y completá el análisis funcional según la guía.', 'tarea', '', NULL, 'Todas', '2° Año', 1, 3, true),
  ('Guía Técnica: Diagramas de Bloques y Automatización en Fábricas', 'Estudio de sensores, actuadores y controladores lógicos programables para 3° Año.', 'pdf', 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf', 'Guia_Automatizacion_3er_Ano.pdf', 'Todas', '3° Año', 1, 1, true),
  ('Clase en Video: ¿Cómo funcionan los Sensores Industriales?', 'Sensores capacitivos, inductivos y fotoeléctricos explicados en planta real.', 'video', 'https://www.youtube.com/embed/fD33i29-060', NULL, 'Todas', '3° Año', 1, 2, true),
  ('Proyecto Integrador: Diseño de un Sistema de Control Automatizado', 'Entrega del informe técnico y esquema circuital en PDF.', 'tarea', '', NULL, 'Todas', '3° Año', 1, 3, true)
ON CONFLICT DO NOTHING;

-- 6. PROGRESO DEL ALUMNO (Roadmap checkboxes & visualización de videos)
CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT NOT NULL,
  material_id UUID NOT NULL REFERENCES public.learning_materials(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(student_id, material_id)
);

ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestion de progreso" ON public.student_progress;
CREATE POLICY "Gestion de progreso" ON public.student_progress FOR ALL USING (true);

-- 7. ENTREGAS DE TAREAS Y CALIFICACIONES (Con rúbricas y lista de cotejo)
CREATE TABLE IF NOT EXISTS public.task_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID NOT NULL REFERENCES public.learning_materials(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  student_name TEXT,
  student_email TEXT,
  submission_url TEXT,
  submission_text TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  grade NUMERIC(4, 2),
  feedback TEXT,
  rubric_evaluation JSONB DEFAULT '{}'::JSONB,
  graded_at TIMESTAMPTZ,
  UNIQUE(material_id, student_id)
);

ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestion de entregas" ON public.task_submissions;
CREATE POLICY "Gestion de entregas" ON public.task_submissions FOR ALL USING (true);

-- 8. GAMIFICACIÓN: HISTORIAL DE 'DESAFÍA AL PROFE' (Puntos extra)
CREATE TABLE IF NOT EXISTS public.quiz_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT NOT NULL,
  points_won INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestion de scores" ON public.quiz_scores;
CREATE POLICY "Gestion de scores" ON public.quiz_scores FOR ALL USING (true);
