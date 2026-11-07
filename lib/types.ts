export type UserRole = 'teacher' | 'student';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  school?: string;
  course?: string;
  points: number;
}

export interface SchoolCourse {
  id: string;
  school_name: string;
  course_name: string;
  subject_name: string;
  days_schedule: string;
}

export interface ClassScheduleItem {
  id: string;
  day: number; // 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes
  start_time: string; // "09:10"
  end_time: string; // "11:10"
  school: string;
  subject: string;
  course: string;
  status: 'firm' | 'plan'; // firm = tomada ✅, plan = buscar en Junta 🎯
  call_number?: number;
  km?: number;
  min?: number;
  departure_time?: string;
  departure_from?: string;
  is_stay?: boolean;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  description?: string;
  day_of_week?: number;
  specific_date?: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  event_type: 'clase' | 'personal' | 'tramite' | 'viaje' | 'ordonez' | 'libre';
  school?: string;
  location?: string;
}

export interface LearningMaterial {
  id: string;
  title: string;
  description?: string;
  material_type: 'pdf' | 'video' | 'guia' | 'tarea';
  url: string;
  file_name?: string;
  school: string; // e.g. "Mons. Conrero" or "Todas"
  course: string; // e.g. "2° Año"
  unit_number: number;
  order_index: number;
  is_required: boolean;
  due_date?: string;
}

export interface StudentProgress {
  material_id: string;
  student_id: string;
  completed: boolean;
  completed_at?: string;
}

export interface TaskSubmission {
  id: string;
  material_id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  submission_url?: string;
  submission_text?: string;
  submitted_at: string;
  grade?: number; // 1 to 10
  feedback?: string;
  rubric_evaluation?: Record<string, boolean | number>;
  graded_at?: string;
}

export interface QuizQuestion {
  icon: string;
  category: string;
  question: string;
  options: string[];
  correct_index: number;
}

export interface CurriculumTopic {
  id: string;
  course: string; // e.g. "2° Año" or "3° Año"
  school?: string; // "Todas" or specific school
  unit_name: string; // e.g. "Unidad 1: Procesos Técnicos y Materiales"
  topic_title: string; // e.g. "Transformación de insumos y normas de seguridad"
  term?: string; // "1° Trimestre" | "2° Trimestre" | "3° Trimestre"
  status: 'pendiente' | 'en_curso' | 'completado';
  hours_allocated?: number;
  notes?: string;
  created_at?: string;
}

export interface StudentRecord {
  id: string;
  full_name: string;
  email?: string; // opcional para alumnos sin cuenta/correo
  school: string;
  course: string;
  is_manual?: boolean; // cargado manualmente por el profe en el aula
  points: number; // puntos de trivia
  average_grade: number; // promedio (1 al 10)
  quartile: 'Q1' | 'Q2' | 'Q3' | 'Q4'; // Q1: 1-3 (apoyo), Q2: 4-6 (en proceso), Q3: 7-8 (satisfactorio), Q4: 9-10 (avanzado)
  attendance_percent: number; // % asistencia
  skills: {
    concepts: number; // 0-10
    diagrams: number; // 0-10
    participation: number; // 0-10
    attitude: number; // 0-10
  };
  notes?: string;
  last_submission_grade?: number;
  last_submission_feedback?: string;
}

export interface PostulationItem {
  id: string;
  school: string;
  subject: string;
  course: string;
  day: number; // 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  hours_count: number; // hs cátedra (e.g. 2, 3, 4)
  status: 'postulado' | 'rechazado' | 'tomada';
  call_number?: number;
  notes?: string;
  created_at: string;
}

export interface ConflictDetail {
  title: string;
  day: number;
  start_time: string;
  end_time: string;
  type: 'clase' | 'personal' | 'tramite' | 'ordonez' | 'viaje';
  reason: string;
}

export interface ScheduleConflictResult {
  hasConflict: boolean;
  conflicts: ConflictDetail[];
  warnings: string[];
}



