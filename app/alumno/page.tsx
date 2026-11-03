'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  CheckCircle, 
  Circle, 
  FileText, 
  Video, 
  Upload, 
  Download, 
  Eye, 
  Gamepad2, 
  Sparkles, 
  Award, 
  School,
  Clock,
  Send,
  MessageCircleQuestion,
  HelpCircle
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { SCHOOLS_COURSES } from '@/lib/initialData';
import PdfViewerModal from '@/components/PdfViewerModal';

export default function AlumnoPortalPage() {
  const { 
    currentUser, 
    completeStudentOnboarding, 
    materials, 
    progress, 
    toggleMaterialProgress,
    submissions,
    submitAssignment,
    classes
  } = useAppStore();

  const [activePdf, setActivePdf] = useState<{ url: string; title: string } | null>(null);
  const [submissionTexts, setSubmissionTexts] = useState<Record<string, string>>({});
  const [submissionUrls, setSubmissionUrls] = useState<Record<string, string>>({});
  const [justSubmitted, setJustSubmitted] = useState<string | null>(null);

  // Estado para el modal de onboarding / cambio de escuela
  const [selectedSchool, setSelectedSchool] = useState(currentUser?.school || 'Mons. Conrero');
  const [studentName, setStudentName] = useState(currentUser?.full_name || '');
  const [showSchoolModal, setShowSchoolModal] = useState(!currentUser?.school);

  // Vincular escuela elegida con su curso correspondiente
  const currentSchoolCourse = SCHOOLS_COURSES.find(sc => sc.school_name === (currentUser?.school || selectedSchool)) 
    || SCHOOLS_COURSES[0];

  const handleSaveOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = SCHOOLS_COURSES.find(sc => sc.school_name === selectedSchool);
    if (matched) {
      completeStudentOnboarding(matched.school_name, matched.course_name, studentName);
      setShowSchoolModal(false);
    }
  };

  const handleTaskSubmit = (materialId: string) => {
    const text = submissionTexts[materialId] || '';
    const url = submissionUrls[materialId] || '';
    if (!text && !url) {
      alert('Por favor ingresá tu respuesta o enlace a tu trabajo antes de enviar.');
      return;
    }
    submitAssignment(materialId, text, url);
    setJustSubmitted(materialId);
    setTimeout(() => setJustSubmitted(null), 4000);
  };

  // Filtrar materiales para el curso del alumno
  const studentMaterials = materials.filter(m => {
    const userCourse = currentUser?.course || currentSchoolCourse.course_name;
    return m.course === userCourse || m.course === 'Todos' || m.school === currentUser?.school;
  });

  // Cálculo de progreso en el Roadmap
  const totalItems = studentMaterials.length;
  const completedCount = studentMaterials.filter(m => progress[m.id]).length;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  // Horarios de clase en esta escuela
  const schoolClasses = classes.filter(c => c.school === (currentUser?.school || currentSchoolCourse.school_name));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera del Alumno */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#5eead4]/20 text-[#5eead4] [data-tema=dia]_&:text-[#0f3a35] flex items-center gap-1.5">
              <School className="w-3.5 h-3.5" />
              {currentUser?.school || 'Sin escuela seleccionada'}
            </span>
            <button
              onClick={() => setShowSchoolModal(true)}
              className="text-xs text-[#ffd166] underline hover:text-[#ffc83d]"
            >
              Cambiar escuela
            </button>
          </div>

          <h1 className="font-fredoka font-bold text-2xl sm:text-3xl text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
            ¡Hola, {currentUser?.full_name || 'Estudiante'}! 👋
          </h1>
          <p className="text-sm text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
            {currentSchoolCourse.course_name} · <span className="text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] font-bold">{currentSchoolCourse.subject_name}</span>
          </p>
          <p className="text-xs text-[#5eead4] [data-tema=dia]_&:text-[#0a5fb4] font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Días de clase: {currentSchoolCourse.days_schedule}
          </p>
        </div>

        {/* Tarjeta de Puntos Extra y Minijuego */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="text-center sm:text-right p-3 rounded-2xl bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
            <span className="text-[11px] font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] block">
              Puntos Ganados
            </span>
            <span className="font-fredoka font-bold text-2xl text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] flex items-center justify-center sm:justify-end gap-1">
              <Sparkles className="w-5 h-5" /> {currentUser?.points || 0} pts
            </span>
            <span className="text-[10px] text-[#5eead4] [data-tema=dia]_&:text-[#0f3a35] font-semibold">
              ¡Suman a tu nota de concepto!
            </span>
          </div>

          <Link
            href="/alumno/desafio"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#ffd166] text-[#241a00] font-fredoka font-bold text-sm hover:scale-105 transition shadow-lg"
          >
            <Gamepad2 className="w-5 h-5" />
            <span>¡Desafía al Profe!</span>
          </Link>
        </div>
      </div>

      {/* Barra de Progreso del Roadmap */}
      <div className="p-5 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-fredoka font-bold text-sm text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#ffd166]" /> Tu Avance en el Roadmap de Estudio
          </span>
          <span className="text-xs font-bold text-[#5eead4] [data-tema=dia]_&:text-[#0a5fb4]">
            {completedCount} de {totalItems} completados ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
          <div
            className="bg-gradient-to-r from-[#5eead4] to-[#ffd166] h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Secciones de Estudio */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-fredoka font-bold text-xl text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#ffd166]" /> Materiales de Estudio, Clases y Actividades
          </h2>
          <span className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
            Tildá lo que vayas leyendo o viendo
          </span>
        </div>

        <div className="space-y-4">
          {studentMaterials.map((mat, index) => {
            const isDone = Boolean(progress[mat.id]);
            const isPdf = mat.material_type === 'pdf' || mat.material_type === 'guia';
            const isVideo = mat.material_type === 'video';
            const isTask = mat.material_type === 'tarea';

            const userSub = submissions.find(s => s.material_id === mat.id && s.student_id === currentUser?.id);

            return (
              <div
                key={mat.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isDone 
                    ? 'bg-[#151c3d]/90 border-[#5eead4]/60 [data-tema=dia]_&:bg-emerald-50/40 [data-tema=dia]_&:border-emerald-300' 
                    : 'bg-[#151c3d] border-[#2a3568] [data-tema=dia]_&:bg-white [data-tema=dia]_&:border-[#d3d9ef]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Checkbox y Título */}
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleMaterialProgress(mat.id)}
                      className="mt-1 transition hover:scale-110"
                      title={isDone ? 'Marcar como pendiente' : 'Marcar como completado'}
                    >
                      {isDone ? (
                        <CheckCircle className="w-6 h-6 text-[#5eead4] fill-[#5eead4]/20" />
                      ) : (
                        <Circle className="w-6 h-6 text-[#9aa4d6] [data-tema=dia]_&:text-slate-400" />
                      )}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isPdf 
                            ? 'bg-red-500/20 text-red-300' 
                            : isVideo 
                              ? 'bg-blue-500/20 text-blue-300' 
                              : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {mat.material_type}
                        </span>
                        <span className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] font-semibold">
                          Paso {index + 1}
                        </span>
                      </div>

                      <h3 className={`font-fredoka font-bold text-base sm:text-lg mt-1 ${
                        isDone ? 'line-through text-[#9aa4d6]' : 'text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]'
                      }`}>
                        {mat.title}
                      </h3>

                      {mat.description && (
                        <p className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mt-1 max-w-2xl">
                          {mat.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción según el tipo de material */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-start">
                    {isPdf && mat.url && (
                      <>
                        <button
                          onClick={() => setActivePdf({ url: mat.url, title: mat.title })}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ffd166] text-[#241a00] text-xs font-bold hover:bg-[#ffc83d] transition shadow"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Leer PDF aquí</span>
                        </button>

                        <a
                          href={mat.url}
                          download={mat.file_name || 'guia.pdf'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1b2559] [data-tema=dia]_&:bg-slate-100 text-[#eef1ff] [data-tema=dia]_&:text-slate-800 text-xs font-bold hover:scale-105 transition"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Descargar</span>
                        </a>
                      </>
                    )}

                    {isVideo && mat.url && (
                      <button
                        onClick={() => toggleMaterialProgress(mat.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow ${
                          isDone 
                            ? 'bg-[#5eead4]/20 text-[#5eead4]' 
                            : 'bg-blue-600 text-white hover:bg-blue-500'
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        <span>{isDone ? 'Video Visto ✅' : 'Marcar como Visto'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Si es video, reproductor embebido */}
                {isVideo && mat.url && (
                  <div className="mt-4 rounded-xl overflow-hidden aspect-video max-w-xl bg-black border border-[#2a3568]">
                    <iframe
                      src={mat.url}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={mat.title}
                    />
                  </div>
                )}

                {/* Si es tarea, caja para enviar entrega y ver calificaciones */}
                {isTask && (
                  <div className="mt-4 p-4 rounded-xl bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" /> Entrega de Trabajo Práctico
                      </span>
                      {userSub?.grade !== undefined && (
                        <span className="text-xs font-bold bg-[#5eead4]/20 text-[#5eead4] [data-tema=dia]_&:text-[#0f3a35] px-2.5 py-1 rounded-lg">
                          Nota del Profe: {userSub.grade} / 10 🎓
                        </span>
                      )}
                    </div>

                    {userSub?.feedback && (
                      <div className="p-3 rounded-lg bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#5eead4]/40 text-xs">
                        <span className="font-bold text-[#5eead4] [data-tema=dia]_&:text-[#0a5fb4] block mb-1">
                          Devolución del Profe Núñez:
                        </span>
                        <p className="text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
                          {userSub.feedback}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={submissionTexts[mat.id] || (userSub?.submission_text ?? '')}
                        onChange={e => setSubmissionTexts({ ...submissionTexts, [mat.id]: e.target.value })}
                        placeholder="Escribí aquí tu respuesta, explicación del mecanismo o conclusiones..."
                        className="w-full bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl p-2.5 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] focus:outline-none focus:border-[#ffd166]"
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="url"
                          value={submissionUrls[mat.id] || (userSub?.submission_url ?? '')}
                          onChange={e => setSubmissionUrls({ ...submissionUrls, [mat.id]: e.target.value })}
                          placeholder="Enlace a tu documento de Google Drive, foto o archivo..."
                          className="flex-1 bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] focus:outline-none focus:border-[#ffd166]"
                        />

                        <button
                          onClick={() => handleTaskSubmit(mat.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5eead4] text-[#0f3a35] text-xs font-bold hover:bg-[#4fd8c2] transition shadow"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{userSub ? 'Reenviar Entrega' : 'Enviar Tarea'}</span>
                        </button>
                      </div>

                      {justSubmitted === mat.id && (
                        <p className="text-xs text-[#5eead4] font-bold">
                          ✅ ¡Tarea enviada al Profe Núñez con éxito!
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Onboarding / Selección de Escuela para Alumnos */}
      {showSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#151c3d] [data-tema=dia]_&:bg-white rounded-3xl border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] shadow-2xl p-6">
            <div className="text-center space-y-2 mb-5">
              <span className="text-3xl">🎒</span>
              <h2 className="font-fredoka font-bold text-xl text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
                ¡Bienvenido al Campus del Profe Núñez!
              </h2>
              <p className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                Para que veas únicamente tus materiales, guías y horarios, seleccioná tu escuela:
              </p>
            </div>

            <form onSubmit={handleSaveOnboarding} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                  Tu Nombre y Apellido
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="Ej: Santiago López"
                  className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-sm text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                  Seleccioná tu Escuela
                </label>
                <select
                  value={selectedSchool}
                  onChange={e => setSelectedSchool(e.target.value)}
                  className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-sm text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
                >
                  {SCHOOLS_COURSES.map(sc => (
                    <option key={sc.id} value={sc.school_name}>
                      {sc.school_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vista previa automática del curso asignado */}
              {(() => {
                const preview = SCHOOLS_COURSES.find(sc => sc.school_name === selectedSchool);
                if (!preview) return null;
                return (
                  <div className="p-3.5 rounded-xl bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#ffd166]/40 text-xs space-y-1">
                    <span className="font-bold text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] block">
                      Curso y Materia asignados:
                    </span>
                    <p className="font-bold text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
                      ⚙️ {preview.course_name} · {preview.subject_name}
                    </p>
                    <p className="text-[11px] text-[#5eead4] [data-tema=dia]_&:text-[#0a5fb4]">
                      📅 {preview.days_schedule}
                    </p>
                  </div>
                );
              })()}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#ffd166] text-[#241a00] font-fredoka font-bold text-sm hover:bg-[#ffc83d] transition shadow-md mt-2"
              >
                Entrar a mi Curso 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Visor PDF integrado */}
      <PdfViewerModal
        isOpen={Boolean(activePdf)}
        onClose={() => setActivePdf(null)}
        title={activePdf?.title || ''}
        pdfUrl={activePdf?.url || ''}
      />
    </div>
  );
}
