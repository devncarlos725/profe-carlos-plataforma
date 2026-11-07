'use client';

import { useState, useMemo } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Building2, 
  BookOpen, 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { DAYS_NAMES } from '@/lib/initialData';

interface PostulationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostulationModal({ isOpen, onClose }: PostulationModalProps) {
  const { 
    classes, 
    postulations, 
    addPostulation, 
    deletePostulation, 
    confirmPostulationAsClass,
    checkScheduleConflict 
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'verificar' | 'guardadas'>('verificar');

  // Formulario de nueva postulación
  const [school, setSchool] = useState('');
  const [subject, setSubject] = useState('Educación Tecnológica');
  const [course, setCourse] = useState('2° Año');
  const [day, setDay] = useState<number>(1);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:20');
  const [hoursCount, setHoursCount] = useState<number>(2);
  const [callNumber, setCallNumber] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Análisis de choque en tiempo real
  const conflictAnalysis = useMemo(() => {
    if (!startTime || !endTime || !day) {
      return { hasConflict: false, conflicts: [], warnings: [] };
    }
    return checkScheduleConflict(day, startTime, endTime);
  }, [day, startTime, endTime, checkScheduleConflict]);

  if (!isOpen) return null;

  const handleSavePostulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!school.trim()) return;

    addPostulation({
      school: school.trim(),
      subject: subject.trim(),
      course: course.trim(),
      day,
      start_time: startTime,
      end_time: endTime,
      hours_count: Number(hoursCount) || 2,
      status: 'postulado',
      call_number: callNumber ? Number(callNumber) : undefined,
      notes: notes.trim() || undefined,
    });

    setSuccessMessage(`¡Postulación a "${school}" guardada con éxito!`);
    setTimeout(() => {
      setSuccessMessage(null);
      setActiveTab('guardadas');
    }, 1200);

    // Reset campos base
    setSchool('');
    setNotes('');
    setCallNumber('');
  };

  const handleConfirmTaken = (postId: string, schoolName: string) => {
    if (confirm(`¿Confirmás la toma de horas en "${schoolName}"? Se añadirá automáticamente a tus clases oficiales tomadas con acta firmada.`)) {
      confirmPostulationAsClass(postId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white rounded-3xl border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] shadow-2xl overflow-hidden my-auto">
        
        {/* Encabezado */}
        <div className="p-5 sm:p-6 border-b border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] flex items-center justify-between bg-[#19224d] [data-tema=dia]_&:bg-[#f5f7fd]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ffbe0b] to-[#ffd166] text-[#0d122b] flex items-center justify-center shadow-lg shadow-[#ffbe0b]/20 font-bold">
              🎯
            </div>
            <div>
              <h2 className="font-fredoka text-lg sm:text-xl font-bold text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b]">
                Simulador de Postulación a Horas
              </h2>
              <p className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                Verificá en tiempo real choques de horario con tus 18 hs tomadas y Ordoñez Vidrios
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#9aa4d6] hover:text-white [data-tema=dia]_&:text-[#5a638f] [data-tema=dia]_&:hover:text-black hover:bg-white/10 transition-colors"
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Pestañas */}
        <div className="flex border-b border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] px-6 bg-[#121835] [data-tema=dia]_&:bg-[#f0f3fa]">
          <button
            type="button"
            onClick={() => setActiveTab('verificar')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'verificar'
                ? 'border-[#ffd166] text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] [data-tema=dia]_&:border-[#9a6400]'
                : 'border-transparent text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] hover:text-white [data-tema=dia]_&:hover:text-black'
            }`}
          >
            <Sparkles size={16} />
            Verificar Nueva Postulación
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guardadas')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'guardadas'
                ? 'border-[#ffd166] text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] [data-tema=dia]_&:border-[#9a6400]'
                : 'border-transparent text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] hover:text-white [data-tema=dia]_&:hover:text-black'
            }`}
          >
            <ShieldCheck size={16} />
            Mis Postulaciones ({postulations.length})
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {successMessage && (
            <div className="mb-4 p-4 rounded-2xl bg-[#06d6a0]/20 border border-[#06d6a0]/40 text-[#5eead4] flex items-center gap-3 animate-fade-in text-sm font-semibold">
              <CheckCircle2 size={20} className="text-[#06d6a0]" />
              {successMessage}
            </div>
          )}

          {activeTab === 'verificar' ? (
            <form onSubmit={handleSavePostulation} className="space-y-4">
              {/* Escuela y Curso */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1.5 flex items-center gap-1.5">
                    <Building2 size={14} /> Escuela / Destino
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Col. Secundario San José"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f142e] [data-tema=dia]_&:bg-[#f4f6fc] border border-[#2a3568] [data-tema=dia]_&:border-[#c7d0eb] text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b] text-sm focus:outline-none focus:border-[#ffd166] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1.5 flex items-center gap-1.5">
                    <BookOpen size={14} /> Curso / División
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 2° Año 1° Div."
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f142e] [data-tema=dia]_&:bg-[#f4f6fc] border border-[#2a3568] [data-tema=dia]_&:border-[#c7d0eb] text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b] text-sm focus:outline-none focus:border-[#ffd166] transition-colors"
                  />
                </div>
              </div>

              {/* Materia y Hs Cátedra */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1.5">
                    Materia
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Educación Tecnológica I"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f142e] [data-tema=dia]_&:bg-[#f4f6fc] border border-[#2a3568] [data-tema=dia]_&:border-[#c7d0eb] text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b] text-sm focus:outline-none focus:border-[#ffd166] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1.5">
                    Hs Cátedra
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={hoursCount}
                    onChange={(e) => setHoursCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f142e] [data-tema=dia]_&:bg-[#f4f6fc] border border-[#2a3568] [data-tema=dia]_&:border-[#c7d0eb] text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b] text-sm focus:outline-none focus:border-[#ffd166] transition-colors"
                  />
                </div>
              </div>

              {/* Día y Rango Horario */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#0f142e] [data-tema=dia]_&:bg-[#f4f6fc] border border-[#2a3568] [data-tema=dia]_&:border-[#c7d0eb]">
                <div>
                  <label className="block text-xs font-semibold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1.5 flex items-center gap-1.5">
                    <CalendarIcon size={14} /> Día
                  </label>
                  <select
                    value={day}
                    onChange={(e) => setDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#c7d0eb] text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b] text-sm focus:outline-none focus:border-[#ffd166]"
                  >
                    <option value={1}>Lunes</option>
                    <option value={2}>Martes</option>
                    <option value={3}>Miércoles</option>
                    <option value={4}>Jueves</option>
                    <option value={5}>Viernes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1.5 flex items-center gap-1.5">
                    <Clock size={14} /> Hora Inicio
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#c7d0eb] text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b] text-sm focus:outline-none focus:border-[#ffd166]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1.5 flex items-center gap-1.5">
                    <Clock size={14} /> Hora Fin
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#c7d0eb] text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b] text-sm focus:outline-none focus:border-[#ffd166]"
                  />
                </div>
              </div>

              {/* N° de llamado y Notas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1.5">
                    N° de Llamado (opcional)
                  </label>
                  <input
                    type="number"
                    placeholder="Ej: 21"
                    value={callNumber}
                    onChange={(e) => setCallNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f142e] [data-tema=dia]_&:bg-[#f4f6fc] border border-[#2a3568] [data-tema=dia]_&:border-[#c7d0eb] text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b] text-sm focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1.5">
                    Observaciones / Notas
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Suplencia corta, llevar declaración jurada"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f142e] [data-tema=dia]_&:bg-[#f4f6fc] border border-[#2a3568] [data-tema=dia]_&:border-[#c7d0eb] text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b] text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* PANEL DE RESULTADOS DE CHOQUE EN TIEMPO REAL */}
              <div className="pt-2">
                <span className="text-xs uppercase tracking-wider font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] block mb-2">
                  Resultado del detector de choques ({DAYS_NAMES[day]} {startTime} - {endTime})
                </span>

                {conflictAnalysis.hasConflict ? (
                  <div className="p-4 rounded-2xl bg-[#ff6b8b]/15 border-2 border-[#ff6b8b] text-[#ff8fa3] space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2 font-bold text-sm text-[#ff6b8b]">
                      <AlertTriangle size={18} className="shrink-0" />
                      ⚠️ ¡ATENCIÓN! HAY CHOQUE DE HORARIOS
                    </div>
                    <ul className="text-xs space-y-1.5 pl-6 list-disc text-[#fecdd3]">
                      {conflictAnalysis.conflicts.map((c, i) => (
                        <li key={i}>
                          <strong className="text-white">{c.title}</strong>: {c.reason}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-[#ffb3c1] italic">
                      No podés tomar estas horas sin renunciar o ajustar el horario que choca.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#06d6a0]/15 border border-[#06d6a0]/40 text-[#5eead4] space-y-1.5 animate-fade-in">
                    <div className="flex items-center gap-2 font-bold text-sm text-[#06d6a0]">
                      <CheckCircle2 size={18} className="shrink-0" />
                      ✅ ¡TOTALMENTE COMPATIBLE! HORARIO DISPONIBLE
                    </div>
                    <p className="text-xs text-[#a7f3d0]">
                      No choca con ninguna de tus 18 horas tomadas, ni con Ordoñez Vidrios, ni con tus citas del calendario.
                    </p>
                  </div>
                )}

                {conflictAnalysis.warnings.length > 0 && (
                  <div className="mt-2.5 p-3 rounded-xl bg-[#ffd166]/15 border border-[#ffd166]/40 text-[#ffd166] text-xs flex items-start gap-2">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <div>
                      {conflictAnalysis.warnings.map((w, i) => (
                        <p key={i}>{w}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de Guardar */}
              <div className="pt-3 flex gap-3 justify-end border-t border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-[#2a3568] text-xs font-semibold text-[#9aa4d6] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!school.trim() || conflictAnalysis.hasConflict}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
                    conflictAnalysis.hasConflict
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-60'
                      : 'bg-[#ffd166] hover:bg-[#ffbe0b] text-[#0d122b] shadow-[#ffd166]/20'
                  }`}
                >
                  <Plus size={16} />
                  Guardar en Mis Postulaciones
                </button>
              </div>
            </form>
          ) : (
            /* LISTA DE POSTULACIONES GUARDADAS */
            <div className="space-y-3">
              {postulations.length === 0 ? (
                <div className="p-8 text-center text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] space-y-2">
                  <div className="text-4xl">📂</div>
                  <h4 className="font-bold text-sm text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b]">
                    No tenés postulaciones guardadas
                  </h4>
                  <p className="text-xs">
                    Cambiá a la pestaña de arriba para verificar un nuevo curso/escuela y guardarlo.
                  </p>
                </div>
              ) : (
                postulations.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#0f142e] [data-tema=dia]_&:bg-[#f4f6fc] border border-[#2a3568] [data-tema=dia]_&:border-[#c7d0eb] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all hover:border-[#ffd166]/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b]">
                          {item.school}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#ffd166]/20 text-[#ffd166]">
                          {item.course}
                        </span>
                        {item.status === 'tomada' ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#06d6a0]/20 text-[#5eead4]">
                            ✅ Ya Tomada (Firme)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#5ab0ff]/20 text-[#5ab0ff]">
                            🎯 Postulado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                        {item.subject} · {DAYS_NAMES[item.day]} de {item.start_time} a {item.end_time} ({item.hours_count} hs cátedra)
                        {item.call_number ? ` · Llamado N° ${item.call_number}` : ''}
                      </p>
                      {item.notes && (
                        <p className="text-[11px] text-[#ffd166]/80 italic">
                          📝 {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                      {item.status !== 'tomada' && (
                        <button
                          type="button"
                          onClick={() => handleConfirmTaken(item.id, item.school)}
                          className="px-3 py-1.5 rounded-xl bg-[#06d6a0] hover:bg-[#05b386] text-[#0d122b] text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-[#06d6a0]/20"
                          title="Hiciste la toma de horas en Junta y tenés el acta firmada"
                        >
                          <CheckCircle2 size={14} />
                          Confirmar Toma
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deletePostulation(item.id)}
                        className="p-1.5 rounded-xl text-[#9aa4d6] hover:text-[#ff6b8b] hover:bg-white/5 transition-colors"
                        title="Eliminar postulación"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
