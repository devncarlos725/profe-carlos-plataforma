'use client';

import { useState, useEffect } from 'react';
import { 
  UserProfile, 
  CalendarEventItem, 
  ClassScheduleItem, 
  LearningMaterial, 
  StudentProgress, 
  TaskSubmission,
  CurriculumTopic,
  StudentRecord,
  PostulationItem,
  ScheduleConflictResult,
  ConflictDetail
} from './types';
import { 
  INITIAL_CLASSES, 
  INITIAL_CALENDAR_EVENTS, 
  INITIAL_MATERIALS,
  INITIAL_CURRICULUM_TOPICS,
  INITIAL_STUDENTS
} from './initialData';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { savePdfToIndexedDB, getPdfFromIndexedDB, deletePdfFromIndexedDB } from './pdfStorage';

const STORAGE_KEYS = {
  USER: 'profe_active_user',
  CALENDAR: 'profe_calendar_events_v3',
  MATERIALS: 'profe_materials',
  PROGRESS: 'profe_student_progress',
  SUBMISSIONS: 'profe_submissions',
  CURRICULUM: 'profe_curriculum_topics',
  STUDENTS: 'profe_students_list',
  CLASSES: 'profe_classes_list_v3',
  POSTULATIONS: 'profe_postulations_list',
  THEME: 'profe_theme',
};

// Guardado seguro que previene QuotaExceededError en localStorage
function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (err: any) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      console.warn(`[Storage] QuotaExceededError al guardar '${key}'. Se mantiene en memoria e IndexedDB.`);
    } else {
      console.error(`[Storage] Error guardando '${key}':`, err);
    }
  }
}

// Usuario docente por defecto (Profe Núñez)
export const DEFAULT_TEACHER: UserProfile = {
  id: 'teacher-carlos',
  email: 'profe.carlos.nunez@gmail.com',
  full_name: 'Prof. Carlos Núñez',
  role: 'teacher',
  points: 100,
};

// Usuario alumno de prueba para demostración
export const DEFAULT_STUDENT: UserProfile = {
  id: 'student-demo',
  email: 'alumno.demo@gmail.com',
  full_name: 'Santiago López',
  role: 'student',
  school: 'Mons. Conrero',
  course: '2° Año',
  points: 25,
};

export function useAppStore() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>(INITIAL_CALENDAR_EVENTS);
  const [classes, setClasses] = useState<ClassScheduleItem[]>(INITIAL_CLASSES);
  const [postulations, setPostulations] = useState<PostulationItem[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>(INITIAL_MATERIALS);
  const [curriculumTopics, setCurriculumTopics] = useState<CurriculumTopic[]>(INITIAL_CURRICULUM_TOPICS);
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [theme, setTheme] = useState<'noche' | 'dia'>('noche');
  const [isReady, setIsReady] = useState(false);

  // Inicializar desde localStorage / IndexedDB / Supabase
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as 'noche' | 'dia' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.dataset.tema = savedTheme;
      } else {
        document.documentElement.dataset.tema = 'noche';
      }

      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
        setCurrentUser(DEFAULT_TEACHER);
        safeSetItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_TEACHER));
      }

      const savedClasses = localStorage.getItem(STORAGE_KEYS.CLASSES);
      if (savedClasses) {
        setClasses(JSON.parse(savedClasses));
      } else {
        setClasses(INITIAL_CLASSES);
        safeSetItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
      }

      const savedPostulations = localStorage.getItem(STORAGE_KEYS.POSTULATIONS);
      if (savedPostulations) {
        setPostulations(JSON.parse(savedPostulations));
      }

      const savedEvents = localStorage.getItem(STORAGE_KEYS.CALENDAR);
      if (savedEvents) {
        setCalendarEvents(JSON.parse(savedEvents));
      }

      const savedMaterials = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      if (savedMaterials) {
        const parsed: LearningMaterial[] = JSON.parse(savedMaterials);
        // Si algún PDF fue guardado en IndexedDB, restaurar su dataUrl
        Promise.all(
          parsed.map(async (m) => {
            if (m.url && m.url.startsWith('indexeddb://')) {
              const fullUrl = await getPdfFromIndexedDB(m.id);
              return { ...m, url: fullUrl || m.url };
            }
            return m;
          })
        ).then(resolved => setMaterials(resolved));
      }

      const savedCurriculum = localStorage.getItem(STORAGE_KEYS.CURRICULUM);
      if (savedCurriculum) {
        setCurriculumTopics(JSON.parse(savedCurriculum));
      }

      const savedStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      }

      const savedProgress = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }

      const savedSubmissions = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      if (savedSubmissions) {
        setSubmissions(JSON.parse(savedSubmissions));
      }
    } catch (e) {
      console.error('Error cargando datos locales:', e);
    } finally {
      setIsReady(true);
    }

    // Cargar datos reales desde Supabase si está configurado
    if (isSupabaseConfigured && supabase) {
      // 1. Cargar materiales de Supabase
      supabase.from('learning_materials').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
        if (data && data.length > 0 && !error) {
          setMaterials(data as LearningMaterial[]);
          // Guardar versión ligera sin saturar localStorage
          const lightweight = data.map((d: any) => ({
            ...d,
            url: d.url?.startsWith('data:') ? 'indexeddb://' + d.id : d.url
          }));
          safeSetItem(STORAGE_KEYS.MATERIALS, JSON.stringify(lightweight));
        }
      });

      // 2. Cargar eventos de calendario de Supabase
      supabase.from('calendar_events').select('*').then(({ data, error }) => {
        if (data && data.length > 0 && !error) {
          setCalendarEvents(data as CalendarEventItem[]);
          safeSetItem(STORAGE_KEYS.CALENDAR, JSON.stringify(data));
        }
      });

      // 3. Escuchar sesión de usuario
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          syncSupabaseProfile(session.user);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          syncSupabaseProfile(session.user);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const syncSupabaseProfile = async (user: any) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data && !error) {
        const profile: UserProfile = {
          id: data.id,
          email: data.email,
          full_name: data.full_name || user.email?.split('@')[0],
          avatar_url: data.avatar_url,
          role: data.role as 'teacher' | 'student',
          school: data.school,
          course: data.course,
          points: data.points || 0,
        };
        setCurrentUser(profile);
        safeSetItem(STORAGE_KEYS.USER, JSON.stringify(profile));
      }
    } catch (err) {
      console.warn('Sync Supabase profile error:', err);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'noche' ? 'dia' : 'noche';
    setTheme(nextTheme);
    document.documentElement.dataset.tema = nextTheme;
    safeSetItem(STORAGE_KEYS.THEME, nextTheme);
  };

  const signInWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } else {
      const mockGoogleUser: UserProfile = {
        id: 'google-user-' + Date.now(),
        email: 'alumno.nuevo@gmail.com',
        full_name: 'Estudiante Google',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=estudiante',
        role: 'student',
        points: 0,
      };
      setCurrentUser(mockGoogleUser);
      safeSetItem(STORAGE_KEYS.USER, JSON.stringify(mockGoogleUser));
    }
  };

  const setRole = (role: 'teacher' | 'student') => {
    const user = role === 'teacher' ? DEFAULT_TEACHER : DEFAULT_STUDENT;
    setCurrentUser(user);
    safeSetItem(STORAGE_KEYS.USER, JSON.stringify(user));
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  const completeStudentOnboarding = (school: string, course: string, name?: string) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      school,
      course,
      full_name: name || currentUser.full_name,
    };
    setCurrentUser(updated);
    safeSetItem(STORAGE_KEYS.USER, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').upsert({
        id: updated.id,
        email: updated.email,
        full_name: updated.full_name,
        role: updated.role,
        school: updated.school,
        course: updated.course,
        points: updated.points,
      }).then();
    }
  };

  const addCalendarEvent = async (event: Omit<CalendarEventItem, 'id'>) => {
    const newEvent: CalendarEventItem = {
      ...event,
      id: 'ev-' + Date.now(),
    };
    const updated = [newEvent, ...calendarEvents];
    setCalendarEvents(updated);
    safeSetItem(STORAGE_KEYS.CALENDAR, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('calendar_events').insert({
          title: newEvent.title,
          description: newEvent.description,
          day_of_week: newEvent.day_of_week,
          specific_date: newEvent.specific_date,
          start_time: newEvent.start_time,
          end_time: newEvent.end_time,
          event_type: newEvent.event_type,
          school: newEvent.school,
          location: newEvent.location,
        });
      } catch (err) {
        console.error('Error insertando evento en Supabase:', err);
      }
    }
    return newEvent;
  };

  const removeCalendarEvent = async (id: string) => {
    const updated = calendarEvents.filter(e => e.id !== id);
    setCalendarEvents(updated);
    safeSetItem(STORAGE_KEYS.CALENDAR, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('calendar_events').delete().eq('id', id);
      } catch (err) {
        console.error('Error eliminando evento en Supabase:', err);
      }
    }
  };

  const toggleMaterialProgress = (materialId: string) => {
    const nextVal = !progress[materialId];
    const updated = { ...progress, [materialId]: nextVal };
    setProgress(updated);
    safeSetItem(STORAGE_KEYS.PROGRESS, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase && currentUser) {
      supabase.from('student_progress').upsert({
        student_id: currentUser.id,
        material_id: materialId,
        completed: nextVal,
        completed_at: nextVal ? new Date().toISOString() : null,
      }).then();
    }
  };

  const addQuizPoints = (points: number) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      points: (currentUser.points || 0) + points,
    };
    setCurrentUser(updated);
    safeSetItem(STORAGE_KEYS.USER, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      supabase.from('quiz_scores').insert({
        student_id: currentUser.id,
        points_won: points,
        correct_answers: points / 5,
        total_questions: 5,
      }).then();
    }
  };

  const submitAssignment = (materialId: string, text: string, url?: string) => {
    if (!currentUser) return;
    const newSubmission: TaskSubmission = {
      id: 'sub-' + Date.now(),
      material_id: materialId,
      student_id: currentUser.id,
      student_name: currentUser.full_name,
      student_email: currentUser.email,
      submission_text: text,
      submission_url: url,
      submitted_at: new Date().toISOString(),
    };
    const updated = [newSubmission, ...submissions.filter(s => !(s.material_id === materialId && s.student_id === currentUser.id))];
    setSubmissions(updated);
    safeSetItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updated));
    toggleMaterialProgress(materialId);
  };

  const gradeSubmission = (
    submissionId: string, 
    grade: number, 
    feedback: string, 
    rubricEvaluation: Record<string, boolean | number>
  ) => {
    const updated = submissions.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          grade,
          feedback,
          rubric_evaluation: rubricEvaluation,
          graded_at: new Date().toISOString(),
        };
      }
      return s;
    });
    setSubmissions(updated);
    safeSetItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updated));
  };

  // Cargar nuevo material (Profe) - Guarda con IndexedDB y sin saturar localStorage
  const addMaterial = async (newMat: Omit<LearningMaterial, 'id'>) => {
    const id = 'mat-' + Date.now();
    const isBase64 = newMat.url && newMat.url.startsWith('data:');

    // 1. Si es base64 pesado, guardarlo en IndexedDB (soporta cientos de MB sin límite de 5MB)
    if (isBase64) {
      await savePdfToIndexedDB(id, newMat.url, newMat.file_name || 'documento.pdf');
    }

    const fullItem: LearningMaterial = {
      ...newMat,
      id,
    };

    const updated = [fullItem, ...materials];
    setMaterials(updated);

    // 2. Para localStorage, guardamos una versión ligera sin el base64 gigante
    const lightweightList = updated.map(m => {
      if (m.url && m.url.startsWith('data:')) {
        return { ...m, url: 'indexeddb://' + m.id };
      }
      return m;
    });
    safeSetItem(STORAGE_KEYS.MATERIALS, JSON.stringify(lightweightList));

    // 3. Si Supabase está disponible, subir metadatos
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('learning_materials').insert({
          title: fullItem.title,
          description: fullItem.description,
          material_type: fullItem.material_type,
          url: isBase64 ? 'indexeddb://' + id : fullItem.url,
          file_name: fullItem.file_name,
          school: fullItem.school,
          course: fullItem.course,
          unit_number: fullItem.unit_number,
          order_index: fullItem.order_index,
          is_required: fullItem.is_required,
        });
      } catch (err) {
        console.error('Error insertando material en Supabase:', err);
      }
    }
    return fullItem;
  };

  // Eliminar material (Profe)
  const deleteMaterial = async (id: string) => {
    const updated = materials.filter(m => m.id !== id);
    setMaterials(updated);

    await deletePdfFromIndexedDB(id);

    const lightweightList = updated.map(m => {
      if (m.url && m.url.startsWith('data:')) {
        return { ...m, url: 'indexeddb://' + m.id };
      }
      return m;
    });
    safeSetItem(STORAGE_KEYS.MATERIALS, JSON.stringify(lightweightList));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('learning_materials').delete().eq('id', id);
      } catch (err) {
        console.error('Error eliminando material en Supabase:', err);
      }
    }
  };

  // PLANIFICACIÓN ANUAL
  const addCurriculumTopic = (topic: Omit<CurriculumTopic, 'id'>) => {
    const newTopic: CurriculumTopic = {
      ...topic,
      id: 'top-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    const updated = [newTopic, ...curriculumTopics];
    setCurriculumTopics(updated);
    safeSetItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(updated));
    return newTopic;
  };

  const updateCurriculumTopicStatus = (id: string, status: 'pendiente' | 'en_curso' | 'completado') => {
    const updated = curriculumTopics.map(t => t.id === id ? { ...t, status } : t);
    setCurriculumTopics(updated);
    safeSetItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(updated));
  };

  const deleteCurriculumTopic = (id: string) => {
    const updated = curriculumTopics.filter(t => t.id !== id);
    setCurriculumTopics(updated);
    safeSetItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(updated));
  };

  // GESTIÓN DINÁMICA DE ESTUDIANTES (TABLA DINÁMICA & ALUMNOS MANUALES)
  const addManualStudent = (studentData: {
    full_name: string;
    school: string;
    course: string;
    email?: string;
    notes?: string;
    initial_grade?: number;
  }) => {
    const grade = studentData.initial_grade ?? 7.0;
    const quartile: 'Q1' | 'Q2' | 'Q3' | 'Q4' = 
      grade >= 8.5 ? 'Q4' : grade >= 7.0 ? 'Q3' : grade >= 4.0 ? 'Q2' : 'Q1';

    const newStudent: StudentRecord = {
      id: 'alu-manual-' + Date.now(),
      full_name: studentData.full_name,
      email: studentData.email || undefined,
      school: studentData.school,
      course: studentData.course,
      is_manual: !studentData.email,
      points: 0,
      average_grade: grade,
      quartile,
      attendance_percent: 100,
      skills: {
        concepts: Math.min(10, Math.round(grade)),
        diagrams: Math.min(10, Math.round(grade)),
        participation: 7,
        attitude: 8,
      },
      notes: studentData.notes || 'Alumno cargado manualmente en el aula.',
    };

    const updated = [newStudent, ...students];
    setStudents(updated);
    safeSetItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
    return newStudent;
  };

  const updateStudentGrade = (
    studentId: string, 
    newGrade: number, 
    feedback?: string, 
    skills?: { concepts: number; diagrams: number; participation: number; attitude: number }
  ) => {
    const quartile: 'Q1' | 'Q2' | 'Q3' | 'Q4' = 
      newGrade >= 8.5 ? 'Q4' : newGrade >= 7.0 ? 'Q3' : newGrade >= 4.0 ? 'Q2' : 'Q1';

    const updated = students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          average_grade: newGrade,
          quartile,
          last_submission_grade: newGrade,
          last_submission_feedback: feedback || s.last_submission_feedback,
          skills: skills || s.skills,
        };
      }
      return s;
    });

    setStudents(updated);
    safeSetItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
  };

  const deleteStudent = (studentId: string) => {
    const updated = students.filter(s => s.id !== studentId);
    setStudents(updated);
    safeSetItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
  };

  // Conversión HH:MM a minutos para cálculo de choques
  const toMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Verificador en tiempo real de choques de horario
  const checkScheduleConflict = (
    day: number,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): ScheduleConflictResult => {
    const newStart = toMinutes(startTime);
    const newEnd = toMinutes(endTime);
    const conflicts: ConflictDetail[] = [];
    const warnings: string[] = [];

    if (newEnd <= newStart) {
      return {
        hasConflict: true,
        conflicts: [
          {
            title: 'Horario no válido',
            day,
            start_time: startTime,
            end_time: endTime,
            type: 'personal',
            reason: 'La hora de finalización debe ser posterior a la hora de inicio.',
          },
        ],
        warnings: [],
      };
    }

    // 1. Verificar contra Clases tomadas en ese día
    classes.forEach(c => {
      if (c.day === day && c.id !== excludeId) {
        const cStart = toMinutes(c.start_time);
        const cEnd = toMinutes(c.end_time);
        if (Math.max(newStart, cStart) < Math.min(newEnd, cEnd)) {
          conflicts.push({
            title: `Clase en ${c.school} (${c.course} · ${c.subject})`,
            day,
            start_time: c.start_time,
            end_time: c.end_time,
            type: 'clase',
            reason: `Choque directo con tu clase tomada de ${c.school} (${c.start_time} a ${c.end_time}).`,
          });
        } else {
          const gap = Math.min(Math.abs(newStart - cEnd), Math.abs(cStart - newEnd));
          if (gap < 20) {
            warnings.push(
              `Margen muy ajustado de ${gap} min con tu clase en ${c.school} (${c.start_time} - ${c.end_time}). Verificá el tiempo de viaje.`
            );
          }
        }
      }
    });

    // 2. Verificar contra Eventos de Calendario (Ordoñez Vidrios, Viajes, Turnos médicos, etc.)
    calendarEvents.forEach(ev => {
      if (ev.day_of_week === day && ev.id !== excludeId) {
        const evStart = toMinutes(ev.start_time);
        const evEnd = toMinutes(ev.end_time);

        if (Math.max(newStart, evStart) < Math.min(newEnd, evEnd)) {
          if (ev.event_type !== 'libre') {
            conflicts.push({
              title: ev.title,
              day,
              start_time: ev.start_time,
              end_time: ev.end_time,
              type: ev.event_type,
              reason: `Choque con: ${ev.title} programado de ${ev.start_time} a ${ev.end_time}.`,
            });
          }
        }
      }
    });

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
      warnings,
    };
  };

  const addPostulation = (postulation: Omit<PostulationItem, 'id' | 'created_at'>) => {
    const newItem: PostulationItem = {
      ...postulation,
      id: `post-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...postulations];
    setPostulations(updated);
    safeSetItem(STORAGE_KEYS.POSTULATIONS, JSON.stringify(updated));
    return newItem;
  };

  const deletePostulation = (id: string) => {
    const updated = postulations.filter(p => p.id !== id);
    setPostulations(updated);
    safeSetItem(STORAGE_KEYS.POSTULATIONS, JSON.stringify(updated));
  };

  const confirmPostulationAsClass = (postulationId: string) => {
    const post = postulations.find(p => p.id === postulationId);
    if (!post) return;

    // Actualizar estado de la postulación
    const updatedPosts = postulations.map(p =>
      p.id === postulationId ? { ...p, status: 'tomada' as const } : p
    );
    setPostulations(updatedPosts);
    safeSetItem(STORAGE_KEYS.POSTULATIONS, JSON.stringify(updatedPosts));

    // Agregar a clases oficiales
    const newClass: ClassScheduleItem = {
      id: `cl-${Date.now()}`,
      day: post.day,
      start_time: post.start_time,
      end_time: post.end_time,
      school: post.school,
      subject: post.subject,
      course: post.course,
      status: 'firm',
      call_number: post.call_number,
    };
    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);
    safeSetItem(STORAGE_KEYS.CLASSES, JSON.stringify(updatedClasses));

    // Agregar al calendario
    const newEvent: CalendarEventItem = {
      id: `ev-class-${newClass.id}`,
      title: `🏫 ${post.school} (${post.course})`,
      day_of_week: post.day,
      start_time: post.start_time,
      end_time: post.end_time,
      event_type: 'clase',
      school: post.school,
    };
    const updatedEvents = [...calendarEvents, newEvent];
    setCalendarEvents(updatedEvents);
    safeSetItem(STORAGE_KEYS.CALENDAR, JSON.stringify(updatedEvents));
  };

  const addClassItem = (item: Omit<ClassScheduleItem, 'id'>) => {
    const newClass: ClassScheduleItem = {
      ...item,
      id: `cl-${Date.now()}`,
    };
    const updated = [...classes, newClass];
    setClasses(updated);
    safeSetItem(STORAGE_KEYS.CLASSES, JSON.stringify(updated));
    return newClass;
  };

  const removeClassItem = (id: string) => {
    const updated = classes.filter(c => c.id !== id);
    setClasses(updated);
    safeSetItem(STORAGE_KEYS.CLASSES, JSON.stringify(updated));
  };

  const resetClassesToOfficial = () => {
    setClasses(INITIAL_CLASSES);
    safeSetItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  };

  return {
    isReady,
    theme,
    toggleTheme,
    currentUser,
    setRole,
    signInWithGoogle,
    logout,
    completeStudentOnboarding,
    calendarEvents,
    addCalendarEvent,
    removeCalendarEvent,
    classes,
    addClassItem,
    removeClassItem,
    resetClassesToOfficial,
    postulations,
    addPostulation,
    deletePostulation,
    confirmPostulationAsClass,
    checkScheduleConflict,
    materials,
    addMaterial,
    deleteMaterial,
    progress,
    toggleMaterialProgress,
    submissions,
    submitAssignment,
    gradeSubmission,
    addQuizPoints,
    curriculumTopics,
    addCurriculumTopic,
    updateCurriculumTopicStatus,
    deleteCurriculumTopic,
    students,
    addManualStudent,
    updateStudentGrade,
    deleteStudent,
  };
}
