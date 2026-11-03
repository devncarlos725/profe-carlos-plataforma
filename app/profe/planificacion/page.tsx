'use client';

import { useState } from 'react';
import { 
  ClipboardList, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Filter, 
  Layers, 
  Calendar,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { SCHOOLS_COURSES } from '@/lib/initialData';
import { CurriculumTopic } from '@/lib/types';

export default function PlanificacionAnualPage() {
  const { 
    curriculumTopics, 
    addCurriculumTopic, 
    updateCurriculumTopicStatus, 
    deleteCurriculumTopic 
  } = useAppStore();

  const [selectedCourse, setSelectedCourse] = useState<string>('2° Año');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulario nuevo tema
  const [unitName, setUnitName] = useState('Eje 1: Los Procesos Tecnológicos');
  const [topicTitle, setTopicTitle] = useState('');
  const [term, setTerm] = useState('1° Trimestre');
  const [hoursAllocated, setHoursAllocated] = useState('4');
  const [initialStatus, setInitialStatus] = useState<'pendiente' | 'en_curso' | 'completado'>('pendiente');
  const [notes, setNotes] = useState('');

  // Filtrar temas por curso seleccionado
  const courseTopics = curriculumTopics.filter(t => t.course === selectedCourse);

  const filteredTopics = courseTopics.filter(t => {
    if (filterStatus === 'todos') return true;
    return t.status === filterStatus;
  });

  // Métricas de avance
  const totalTopics = courseTopics.length;
  const completedTopics = courseTopics.filter(t => t.status === 'completado').length;
  const inProgressTopics = courseTopics.filter(t => t.status === 'en_curso').length;
  const pendingTopics = courseTopics.filter(t => t.status === 'pendiente').length;

  const percentCompleted = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle) return;

    addCurriculumTopic({
      course: selectedCourse,
      school: 'Todas',
      unit_name: unitName,
      topic_title: topicTitle,
      term,
      status: initialStatus,
      hours_allocated: parseInt(hoursAllocated) || 4,
      notes,
    });

    setTopicTitle('');
    setNotes('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-fredoka font-bold text-2xl sm:text-3xl text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-[#ffd166]" /> Planificación Anual & Control de Contenidos
          </h1>
          <p className="text-sm text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mt-1">
            Cargá los temas reales que estás dando y llevá el control exacto de lo que te está faltando dar.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ffd166] text-[#241a00] font-bold text-sm hover:bg-[#ffc83d] transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Tema a la Planificación</span>
        </button>
      </div>

      {/* Selector de Curso y Filtro de Estado */}
      <div className="p-4 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
            Curso:
          </span>
          <div className="flex gap-1.5">
            {['2° Año', '3° Año'].map(c => (
              <button
                key={c}
                onClick={() => setSelectedCourse(c)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                  selectedCourse === c
                    ? 'bg-[#ffd166] text-[#241a00] border-[#ffd166]'
                    : 'bg-[#0b1026] text-[#9aa4d6] border-[#2a3568] hover:text-white [data-tema=dia]_&:bg-[#f3f5fd] [data-tema=dia]_&:border-[#d3d9ef]'
                }`}
              >
                ⚙️ {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] hidden sm:inline">Mostrar:</span>
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'pendiente', label: '🔴 Falta dar' },
            { id: 'en_curso', label: '🟡 En curso' },
            { id: 'completado', label: '🟢 Ya dado' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-2.5 py-1 rounded-lg border transition ${
                filterStatus === f.id
                  ? 'bg-[#5eead4] text-[#0f3a35] border-[#5eead4] font-bold'
                  : 'bg-[#0b1026] text-[#9aa4d6] border-[#2a3568] [data-tema=dia]_&:bg-[#f3f5fd] [data-tema=dia]_&:border-[#d3d9ef]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Indicadores de Avance Anual */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
          <span className="font-fredoka font-bold text-2xl text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] block">
            {totalTopics}
          </span>
          <span className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] font-semibold">
            Temas planificados en {selectedCourse}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
          <span className="font-fredoka font-bold text-2xl text-[#5eead4] [data-tema=dia]_&:text-[#0f3a35] block">
            {completedTopics} ✅
          </span>
          <span className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] font-semibold">
            Contenidos ya dictados
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
          <span className="font-fredoka font-bold text-2xl text-[#ff6b8b] block">
            {pendingTopics} 🎯
          </span>
          <span className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] font-semibold">
            Contenidos que faltan dar
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
          <span className="font-fredoka font-bold text-2xl text-[#a78bfa] block">
            {percentCompleted}%
          </span>
          <span className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] font-semibold">
            Avance curricular del año
          </span>
        </div>
      </div>

      {/* Barra visual de avance anual */}
      <div className="p-5 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#5eead4]" /> Estado del Plan Anual para {selectedCourse}
          </span>
          <span className="text-[#5eead4] [data-tema=dia]_&:text-[#0a5fb4]">
            {completedTopics} de {totalTopics} temas completados
          </span>
        </div>
        <div className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-slate-200 h-3.5 rounded-full overflow-hidden p-0.5 border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
          <div
            className="bg-gradient-to-r from-[#5eead4] to-[#ffd166] h-full rounded-full transition-all duration-500"
            style={{ width: `${percentCompleted}%` }}
          />
        </div>
      </div>

      {/* Tabla de Contenidos y Temas de la Planificación */}
      <div className="rounded-2xl border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] bg-[#151c3d] [data-tema=dia]_&:bg-white shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] bg-[#0b1026]/70 [data-tema=dia]_&:bg-slate-100/80 text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4">Eje / Unidad</th>
                <th className="py-3 px-4">Tema / Contenido Específico</th>
                <th className="py-3 px-4">Trimestre</th>
                <th className="py-3 px-4">Horas</th>
                <th className="py-3 px-4">Estado Actual</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3568]/40 [data-tema=dia]_&:divide-[#d3d9ef]">
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => {
                  let badge = { label: '🔴 Falta dar', bg: 'bg-red-500/20 text-red-300 border-red-500/40' };
                  if (topic.status === 'en_curso') {
                    badge = { label: '🟡 En curso', bg: 'bg-[#ffd166]/20 text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] border-[#ffd166]/40' };
                  } else if (topic.status === 'completado') {
                    badge = { label: '🟢 Ya dictado', bg: 'bg-[#5eead4]/20 text-[#5eead4] [data-tema=dia]_&:text-[#0f3a35] border-[#5eead4]/40' };
                  }

                  return (
                    <tr 
                      key={topic.id}
                      className="transition hover:bg-[#1b2559]/30 [data-tema=dia]_&:hover:bg-slate-50"
                    >
                      <td className="py-3.5 px-4 font-bold text-xs text-[#5eead4] [data-tema=dia]_&:text-[#0a5fb4] whitespace-nowrap">
                        {topic.unit_name}
                      </td>

                      <td className="py-3.5 px-4 max-w-md">
                        <span className="font-bold text-sm text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] block">
                          {topic.topic_title}
                        </span>
                        {topic.notes && (
                          <span className="text-[11px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] block mt-0.5">
                            {topic.notes}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] font-semibold">
                        {topic.term || '1° Trimestre'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                        {topic.hours_allocated || 4} hs cátedra
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {/* Selector de estado interactivo con 1 clic */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              const next = topic.status === 'pendiente' 
                                ? 'en_curso' 
                                : topic.status === 'en_curso' 
                                  ? 'completado' 
                                  : 'pendiente';
                              updateCurriculumTopicStatus(topic.id, next);
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition hover:scale-105 ${badge.bg}`}
                            title="Haz clic para cambiar el estado de este tema"
                          >
                            {badge.label}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar "${topic.topic_title}" de la planificación?`)) {
                              deleteCurriculumTopic(topic.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition"
                          title="Eliminar tema"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                    <ClipboardList className="w-8 h-8 text-[#ffd166] mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-sm">No hay temas para el filtro seleccionado.</p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-3 px-4 py-1.5 bg-[#ffd166] text-[#241a00] font-bold text-xs rounded-xl hover:bg-[#ffc83d]"
                    >
                      ➕ Cargar un tema nuevo
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para agregar tema a la planificación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#151c3d] [data-tema=dia]_&:bg-white rounded-3xl border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] shadow-2xl p-6">
            <h3 className="font-fredoka font-bold text-lg text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#ffd166]" /> Agregar Tema a la Planificación Anual
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                  Eje Temático / Unidad
                </label>
                <input
                  type="text"
                  required
                  value={unitName}
                  onChange={e => setUnitName(e.target.value)}
                  placeholder="Ej: Eje 1: Los Procesos Tecnológicos"
                  className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                  Contenido o Tema Específico a dar
                </label>
                <input
                  type="text"
                  required
                  value={topicTitle}
                  onChange={e => setTopicTitle(e.target.value)}
                  placeholder="Ej: Transformación de materiales y normas de seguridad en el taller"
                  className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                    Trimestre
                  </label>
                  <select
                    value={term}
                    onChange={e => setTerm(e.target.value)}
                    className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
                  >
                    <option value="1° Trimestre">1° Trimestre</option>
                    <option value="2° Trimestre">2° Trimestre</option>
                    <option value="3° Trimestre">3° Trimestre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                    Hs Cátedra
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={hoursAllocated}
                    onChange={e => setHoursAllocated(e.target.value)}
                    className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                    Estado inicial
                  </label>
                  <select
                    value={initialStatus}
                    onChange={e => setInitialStatus(e.target.value as any)}
                    className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
                  >
                    <option value="pendiente">🔴 Falta dar</option>
                    <option value="en_curso">🟡 En curso</option>
                    <option value="completado">🟢 Ya dictado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                  Observaciones / Notas (opcional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ej: Requiere material impreso o práctica en taller..."
                  className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#9aa4d6] hover:bg-slate-800/40 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ffd166] text-[#241a00] text-xs font-bold rounded-xl hover:bg-[#ffc83d] transition shadow"
                >
                  Guardar en Planificación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
