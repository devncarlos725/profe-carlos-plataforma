'use client';

import { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Search, 
  Table as TableIcon, 
  LayoutGrid, 
  Tag, 
  FileText, 
  Filter,
  Pencil
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { DAYS_NAMES } from '@/lib/initialData';
import AddEventModal from '@/components/AddEventModal';
import PostulationModal from '@/components/PostulationModal';
import EditBlockModal, { EditableBlock } from '@/components/EditBlockModal';

export default function CalendarPage() {
  const { 
    calendarEvents, 
    addCalendarEvent, 
    removeCalendarEvent, 
    updateCalendarEvent 
  } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPostulationModalOpen, setIsPostulationModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<EditableBlock | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterDay, setFilterDay] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'tabla' | 'tarjetas'>('tabla');

  const todayIndex = new Date().getDay();

  // Filtrado y ordenamiento de eventos por día y hora
  const filteredEvents = calendarEvents
    .filter(ev => {
      const matchType = filterType === 'todos' || ev.event_type === filterType;
      const matchDay = filterDay === 'todos' || String(ev.day_of_week) === filterDay;
      const matchSearch = 
        ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.description && ev.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ev.location && ev.location.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchType && matchDay && matchSearch;
    })
    .sort((a, b) => {
      const dayA = a.day_of_week ?? 99;
      const dayB = b.day_of_week ?? 99;
      if (dayA !== dayB) return dayA - dayB;
      return a.start_time.localeCompare(b.start_time);
    });

  const handleEditEvent = (ev: any) => {
    setEditingBlock({
      id: ev.id,
      type: ev.event_type || 'clase',
      day: ev.day_of_week || 1,
      timeStart: ev.start_time,
      timeEnd: ev.end_time,
      title: ev.title,
      sub: ev.description || ev.location || '',
      raw: ev,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveBlock = (id: string, type: string, updates: any) => {
    updateCalendarEvent(id, {
      title: updates.title,
      description: updates.sub,
      day_of_week: updates.day,
      start_time: updates.start_time,
      end_time: updates.end_time,
      event_type: updates.event_type || 'clase',
    });
  };

  const handleDeleteBlock = (id: string) => {
    removeCalendarEvent(id);
  };

  const getBadgeInfo = (type: string) => {
    switch (type) {
      case 'personal':
        return { label: '🩺 Personal / Dentista', bg: 'bg-[#a78bfa]/20 text-[#a78bfa] border-[#a78bfa]/40' };
      case 'tramite':
        return { label: '📋 Trámite / Junta', bg: 'bg-[#ffd166]/20 text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] border-[#ffd166]/40' };
      case 'clase':
        return { label: '🏫 Escuela / Clase', bg: 'bg-[#5eead4]/20 text-[#5eead4] [data-tema=dia]_&:text-[#0f3a35] border-[#5eead4]/40' };
      case 'ordonez':
        return { label: '💼 Ordoñez Vidrios', bg: 'bg-[#ff6b8b]/20 text-[#ff6b8b] border-[#ff6b8b]/40' };
      case 'viaje':
        return { label: '🚗 Viaje en Auto', bg: 'bg-[#5ab0ff]/20 text-[#5ab0ff] border-[#5ab0ff]/40' };
      case 'libre':
        return { label: '🛋️ Libre', bg: 'bg-slate-700/20 text-slate-400 border-slate-600/40' };
      default:
        return { label: type, bg: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera Principal */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-fredoka font-bold text-2xl sm:text-3xl text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-[#ffd166]" /> Calendario & Citas del Profe
          </h1>
          <p className="text-sm text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mt-1">
            Agendá compromisos personales (ej: Martes 07:00 dentista), trámites y nuevas escuelas con persistencia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de Vista: Tabla / Tarjetas */}
          <div className="flex items-center bg-[#151c3d] [data-tema=dia]_&:bg-slate-100 p-1 rounded-xl border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] text-xs">
            <button
              onClick={() => setViewMode('tabla')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                viewMode === 'tabla'
                  ? 'bg-[#ffd166] text-[#241a00] shadow'
                  : 'text-[#9aa4d6] hover:text-white [data-tema=dia]_&:text-[#5a638f]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
            <button
              onClick={() => setViewMode('tarjetas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                viewMode === 'tarjetas'
                  ? 'bg-[#ffd166] text-[#241a00] shadow'
                  : 'text-[#9aa4d6] hover:text-white [data-tema=dia]_&:text-[#5a638f]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tarjetas</span>
            </button>
          </div>

          <button
            onClick={() => setIsPostulationModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#06d6a0] hover:bg-[#05b386] text-[#0d122b] font-bold text-xs sm:text-sm transition shadow-md shadow-[#06d6a0]/20"
          >
            <span>🎯 Verificar Postulación</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ffd166] text-[#241a00] font-bold text-sm hover:bg-[#ffc83d] transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Cita o Evento</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="p-4 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Buscar texto */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por dentista, escuela, trámite..."
            className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl pl-9 pr-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] focus:outline-none focus:border-[#ffd166]"
          />
          <Search className="w-4 h-4 text-[#9aa4d6] absolute left-3 top-2.5" />
        </div>

        {/* Filtrar por tipo */}
        <div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs font-semibold text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
          >
            <option value="todos">Todos los tipos de compromiso</option>
            <option value="personal">🩺 Citas médicas / Dentista / Personal</option>
            <option value="tramite">📋 Trámites / Junta</option>
            <option value="clase">🏫 Clases / Nuevas escuelas</option>
            <option value="ordonez">💼 Ordoñez Vidrios</option>
            <option value="viaje">🚗 Viajes en auto</option>
            <option value="libre">🛋️ Tiempo libre</option>
          </select>
        </div>

        {/* Filtrar por día */}
        <div>
          <select
            value={filterDay}
            onChange={e => setFilterDay(e.target.value)}
            className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs font-semibold text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
          >
            <option value="todos">Todos los días de la semana</option>
            <option value="1">Lunes</option>
            <option value="2">Martes</option>
            <option value="3">Miércoles</option>
            <option value="4">Jueves</option>
            <option value="5">Viernes</option>
          </select>
        </div>
      </div>

      {/* VISTA 1: TABLA DE CITAS Y COMPROMISOS (SOLICITADA POR EL USUARIO) */}
      {viewMode === 'tabla' ? (
        <div className="rounded-2xl border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] bg-[#151c3d] [data-tema=dia]_&:bg-white shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] bg-[#0b1026]/70 [data-tema=dia]_&:bg-slate-100/80 text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3 px-4">Día / Fecha</th>
                  <th className="py-3 px-4">Horario</th>
                  <th className="py-3 px-4">Tipo / Categoría</th>
                  <th className="py-3 px-4">Compromiso / Título</th>
                  <th className="py-3 px-4">Lugar / Ubicación</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a3568]/40 [data-tema=dia]_&:divide-[#d3d9ef]">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((ev, index) => {
                    const badge = getBadgeInfo(ev.event_type);
                    const isToday = ev.day_of_week === todayIndex;

                    return (
                      <tr 
                        key={ev.id}
                        className={`transition hover:bg-[#1b2559]/30 [data-tema=dia]_&:hover:bg-slate-50 ${
                          isToday ? 'bg-[#ffd166]/5 [data-tema=dia]_&:bg-amber-50/40' : ''
                        }`}
                      >
                        {/* Día y Fecha */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
                              {ev.day_of_week ? DAYS_NAMES[ev.day_of_week] : 'Fecha fija'}
                            </span>
                            {isToday && (
                              <span className="text-[10px] bg-[#ffd166]/20 text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] px-2 py-0.5 rounded-full font-bold">
                                ¡Hoy! ⭐
                              </span>
                            )}
                          </div>
                          {ev.specific_date && (
                            <span className="text-[11px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] block">
                              📅 {ev.specific_date}
                            </span>
                          )}
                        </td>

                        {/* Horario */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-xs text-[#5eead4] [data-tema=dia]_&:text-[#0a5fb4] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#ffd166]" />
                            {ev.start_time} – {ev.end_time} hs
                          </span>
                        </td>

                        {/* Categoría / Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>

                        {/* Título / Nota */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <span className="font-bold text-sm text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] block">
                            {ev.title}
                          </span>
                          {ev.description && (
                            <span className="text-[11px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] block mt-0.5">
                              {ev.description}
                            </span>
                          )}
                        </td>

                        {/* Ubicación */}
                        <td className="py-3.5 px-4 text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                          {ev.location ? (
                            <span className="flex items-center gap-1 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-[#5eead4] shrink-0" />
                              <span>{ev.location}</span>
                            </span>
                          ) : (
                            <span className="italic text-slate-500">–</span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEditEvent(ev)}
                              className="p-1.5 rounded-lg text-[#ffd166] hover:bg-[#ffd166]/20 transition"
                              title="Editar horario y datos"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar "${ev.title}" del calendario?`)) {
                                  removeCalendarEvent(ev.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition"
                              title="Eliminar este compromiso"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                      <CalendarIcon className="w-8 h-8 text-[#ffd166] mx-auto mb-2 opacity-50" />
                      <p className="font-bold text-sm">No se encontraron eventos con los filtros seleccionados.</p>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-3 px-4 py-1.5 bg-[#ffd166] text-[#241a00] font-bold text-xs rounded-xl hover:bg-[#ffc83d]"
                      >
                        ➕ Agregar un nuevo evento
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pie de tabla con total */}
          <div className="px-4 py-3 bg-[#0b1026]/70 [data-tema=dia]_&:bg-slate-50 border-t border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] flex items-center justify-between text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
            <span>Total: <b>{filteredEvents.length}</b> compromisos listados</span>
            <span>💡 Haz clic en ➕ para agendar citas como Dentista o Trámites en Junta</span>
          </div>
        </div>
      ) : (
        /* VISTA 2: TARJETAS (OPCIONAL) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map(ev => {
            const badge = getBadgeInfo(ev.event_type);
            return (
              <div
                key={ev.id}
                className="p-4 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] shadow-sm flex flex-col justify-between gap-3 relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditEvent(ev)}
                        className="p-1 text-[#ffd166] hover:bg-[#ffd166]/20 rounded-md transition"
                        title="Editar evento"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeCalendarEvent(ev.id)}
                        className="p-1 text-[#9aa4d6] hover:text-red-400 opacity-60 group-hover:opacity-100 transition"
                        title="Eliminar evento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-fredoka font-bold text-base text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] mt-2">
                    {ev.title}
                  </h3>

                  {ev.description && (
                    <p className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mt-1">
                      {ev.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#2a3568]/50 [data-tema=dia]_&:border-[#d3d9ef]/60 flex items-center justify-between text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                  <div className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[#ffd166]" />
                    <span>
                      {ev.day_of_week ? `${DAYS_NAMES[ev.day_of_week]} · ` : ''}
                      {ev.start_time} - {ev.end_time} hs
                    </span>
                  </div>

                  {ev.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#5eead4]" />
                      <span className="truncate max-w-[120px]">{ev.location}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para agregar citas o eventos */}
      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addCalendarEvent}
      />

      {/* Modal de simulación y verificación de postulación a horas */}
      <PostulationModal
        isOpen={isPostulationModalOpen}
        onClose={() => setIsPostulationModalOpen(false)}
      />

      {/* Modal para editar horas y minutos de eventos */}
      <EditBlockModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        block={editingBlock}
        onSave={handleSaveBlock}
        onDelete={(id) => handleDeleteBlock(id)}
      />
    </div>
  );
}
