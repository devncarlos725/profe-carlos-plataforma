'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  MapPin, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Trash2, 
  Calendar as CalendarIcon,
  CheckCircle2,
  Car
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { DAYS_NAMES } from '@/lib/initialData';
import AddEventModal from '@/components/AddEventModal';
import PostulationModal from '@/components/PostulationModal';

export default function HomePage() {
  const { 
    currentUser, 
    classes, 
    calendarEvents, 
    addCalendarEvent, 
    removeCalendarEvent 
  } = useAppStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPostulationModalOpen, setIsPostulationModalOpen] = useState(false);

  const isTeacher = currentUser?.role === 'teacher';

  // Cálculo de minutos en Ordoñez Vidrios
  const ordonezMinutes = calendarEvents
    .filter(e => e.event_type === 'ordonez')
    .reduce((total, ev) => {
      const [sh, sm] = ev.start_time.split(':').map(Number);
      const [eh, em] = ev.end_time.split(':').map(Number);
      return total + (eh * 60 + em) - (sh * 60 + sm);
    }, 0);

  const ordHours = Math.floor(ordonezMinutes / 60);
  const ordMins = ordonezMinutes % 60;

  const todayIndex = new Date().getDay(); // 1=Lun, 2=Mar, etc.

  // Estadísticas dinámicas de clases
  const totalCatedraHours = classes.reduce((acc, c) => {
    if (c.school === 'Timbó Nuevo') return acc + 3;
    if (c.school === 'Mancopa' && c.day === 4) return acc + 2;
    if (c.school === 'Mancopa' && c.day === 3) return acc + 1;
    const [sh, sm] = c.start_time.split(':').map(Number);
    const [eh, em] = c.end_time.split(':').map(Number);
    const durationMin = (eh * 60 + em) - (sh * 60 + sm);
    return acc + Math.round(durationMin / 40);
  }, 0);

  const distinctSchoolsCount = new Set(classes.map(c => c.school)).size;
  const takenClassesCount = classes.filter(c => c.status === 'firm').length;
  const planClassesCount = classes.filter(c => c.status === 'plan').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Mensaje de bienvenida para alumnos */}
      {!isTeacher && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1b2559] to-[#151c3d] border border-[#a78bfa]/40 text-[#eef1ff] shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#5eead4] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> ¡Hola {currentUser?.full_name}!
            </span>
            <h2 className="font-fredoka font-bold text-lg sm:text-xl">
              Tu portal de estudio de Educación Tecnológica está listo
            </h2>
            <p className="text-xs sm:text-sm text-[#9aa4d6]">
              {currentUser?.school 
                ? `Estás inscripto en: ${currentUser.school} · ${currentUser.course}` 
                : 'Seleccioná tu escuela para ver tus guías, videos y tareas.'}
            </p>
          </div>
          <Link
            href="/alumno"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ffd166] text-[#241a00] font-fredoka font-bold text-sm hover:scale-105 transition shadow-lg"
          >
            <span>Ir a Mi Campus</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-fredoka font-bold text-2xl sm:text-4xl text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
            🗓️ Mi Semana y Horarios
          </h1>
          <p className="text-sm text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mt-1">
            Cronograma semanal actualizado · Alderetes & Escuelas de Tucumán · 18 hs cátedra tomadas
          </p>
        </div>

        {isTeacher && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsPostulationModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#06d6a0] hover:bg-[#05b386] text-[#0d122b] font-bold text-xs sm:text-sm transition shadow-lg shadow-[#06d6a0]/20"
            >
              <span>🎯 Postularme a Horas / Verificar Choque</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#ffd166] text-[#241a00] font-bold text-xs sm:text-sm hover:bg-[#ffc83d] transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Cita / Dentista</span>
            </button>
          </div>
        )}
      </div>

      {/* Indicadores / Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 sm:p-4 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
          <span className="font-fredoka font-bold text-xl sm:text-2xl text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] block">
            {totalCatedraHours}
          </span>
          <span className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] font-semibold">
            hs cátedra totales
          </span>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
          <span className="font-fredoka font-bold text-xl sm:text-2xl text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] block">
            {distinctSchoolsCount}
          </span>
          <span className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] font-semibold">
            escuelas asignadas
          </span>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
          <span className="font-fredoka font-bold text-xl sm:text-2xl text-[#5eead4] [data-tema=dia]_&:text-[#0f3a35] block">
            {takenClassesCount} ✅
          </span>
          <span className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] font-semibold">
            ya tomadas (acta firmada)
          </span>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
          <span className="font-fredoka font-bold text-xl sm:text-2xl text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] block">
            {planClassesCount} 🎯
          </span>
          <span className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] font-semibold">
            a buscar en Junta
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 sm:p-4 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
          <span className="font-fredoka font-bold text-xl sm:text-2xl text-[#ff6b8b] block">
            {ordHours}h {ordMins > 0 ? `${ordMins}m` : ''}
          </span>
          <span className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] font-semibold">
            Ordoñez (Mar, Mié, Vie · Lun y Jue 0h)
          </span>
        </div>
      </div>

      {/* Referencias / Leyenda */}
      <div className="flex flex-wrap gap-3 text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] font-medium pt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#5eead4]"></span> 🟢 Ya tomada (acta firmada)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#ffd166]"></span> 🟡 PLaNEA (Junta)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#ff6b8b]"></span> 🔴 Ordoñez Vidrios
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#5ab0ff]"></span> 🔵 🚗 Viajes
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#a78bfa]"></span> 🟣 Citas / Dentista / Personal
        </span>
      </div>

      {/* Grilla Semanal Columnar Interactiva */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((dayNum) => {
          const isToday = todayIndex === dayNum;
          const dayName = DAYS_NAMES[dayNum];

          // Clases del día
          const dayClasses = classes.filter(c => c.day === dayNum);
          
          // Eventos del día (recurrentes o específicos)
          const dayEvents = calendarEvents.filter(e => e.day_of_week === dayNum);

          // Combinar y ordenar cronológicamente
          const allBlocks = [
            ...dayClasses.map(c => ({
              id: c.id,
              type: 'class',
              timeStart: c.start_time,
              timeEnd: c.end_time,
              title: c.school,
              sub: `${c.course} · ${c.subject}`,
              status: c.status,
              raw: c,
            })),
            ...dayEvents.map(e => ({
              id: e.id,
              type: e.event_type,
              timeStart: e.start_time,
              timeEnd: e.end_time,
              title: e.title,
              sub: e.description || e.location || '',
              status: 'custom',
              raw: e,
            })),
          ].sort((a, b) => a.timeStart.localeCompare(b.timeStart));

          return (
            <div
              key={dayNum}
              className={`flex flex-col rounded-2xl border transition-all ${
                isToday 
                  ? 'border-[#ffd166] bg-[#151c3d]/90 [data-tema=dia]_&:bg-amber-50/50 shadow-lg' 
                  : 'border-[#2a3568] bg-[#151c3d]/40 [data-tema=dia]_&:bg-white [data-tema=dia]_&:border-[#d3d9ef]'
              }`}
            >
              {/* Encabezado del día */}
              <div className={`p-3 border-b text-center font-fredoka font-bold flex items-center justify-between ${
                isToday
                  ? 'border-[#ffd166]/50 text-[#ffd166] [data-tema=dia]_&:text-[#9a6400]'
                  : 'border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]'
              }`}>
                <span className="text-base">{dayName}</span>
                {isToday && (
                  <span className="text-[10px] bg-[#ffd166]/20 px-2 py-0.5 rounded-full font-bold">
                    ¡HOY! ⭐
                  </span>
                )}
              </div>

              {/* Lista de bloques */}
              <div className="p-2 space-y-2 flex-1">
                {allBlocks.map(block => {
                  let badgeBg = 'bg-[#1b2559] text-white';
                  let borderLeft = 'border-l-4 border-slate-400';

                  if (block.type === 'class') {
                    if (block.status === 'firm') {
                      badgeBg = 'bg-[#5eead4] text-[#0f3a35]';
                      borderLeft = 'border-l-4 border-[#5eead4]';
                    } else {
                      badgeBg = 'bg-[#ffd166] text-[#241a00]';
                      borderLeft = 'border-l-4 border-[#ffd166]';
                    }
                  } else if (block.type === 'ordonez') {
                    badgeBg = 'bg-[#ff6b8b] text-[#25000d]';
                    borderLeft = 'border-l-4 border-[#ff6b8b]';
                  } else if (block.type === 'viaje') {
                    badgeBg = 'bg-[#5ab0ff] text-[#062444]';
                    borderLeft = 'border-l-4 border-[#5ab0ff]';
                  } else if (block.type === 'personal' || block.type === 'tramite') {
                    badgeBg = 'bg-[#a78bfa] text-[#1e1145]';
                    borderLeft = 'border-l-4 border-[#a78bfa]';
                  } else if (block.type === 'libre') {
                    badgeBg = 'bg-slate-700/40 text-slate-300';
                    borderLeft = 'border-l-2 border-dashed border-slate-600';
                  }

                  return (
                    <div
                      key={block.id}
                      className={`p-2.5 rounded-xl ${badgeBg} ${borderLeft} shadow-sm text-xs relative group transition-all hover:scale-[1.01]`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold leading-tight line-clamp-2">
                          {block.title}
                        </span>
                        {/* Botón borrar si es evento personalizado */}
                        {isTeacher && block.type !== 'class' && block.id.startsWith('ev-') && (
                          <button
                            onClick={() => removeCalendarEvent(block.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-600 transition"
                            title="Eliminar evento"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mt-1 font-semibold opacity-90">
                        <Clock className="w-3 h-3" />
                        <span>{block.timeStart} – {block.timeEnd}</span>
                      </div>

                      {block.sub && (
                        <p className="mt-1 opacity-80 text-[11px] leading-tight">
                          {block.sub}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sección: A qué hora salir de casa (Alderetes) */}
      <div className="p-5 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] space-y-4">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-[#ffd166]" />
          <div>
            <h3 className="font-fredoka font-bold text-lg text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
              🚗 A qué hora salir de casa (Alderetes)
            </h3>
            <p className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
              Cálculo estimado con 10 min de anticipación antes de entrar a clases.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {classes.map(cl => (
            <div
              key={cl.id}
              className="p-3.5 rounded-xl bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
                    {cl.school}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    cl.status === 'firm' 
                      ? 'bg-[#5eead4]/20 text-[#5eead4] [data-tema=dia]_&:text-[#0f3a35]' 
                      : 'bg-[#ffd166]/20 text-[#ffd166] [data-tema=dia]_&:text-[#9a6400]'
                  }`}>
                    {cl.status === 'firm' ? '✅ Tomada' : '🎯 En Junta'}
                  </span>
                </div>
                <span className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] block">
                  {DAYS_NAMES[cl.day]} · {cl.start_time} a {cl.end_time} hs ({cl.course})
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-[#5ab0ff] block">
                  Salí a las {cl.departure_time || '–'} hs
                </span>
                <span className="text-[11px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                  Desde {cl.departure_from || 'Casa'} · {cl.min} min · {cl.km} km
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para agregar citas o eventos */}
      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addCalendarEvent}
      />

      {/* Modal de simulación y verificación de postulación a horas */}
      <PostulationModal
        isOpen={isPostulationModalOpen}
        onClose={() => setIsPostulationModalOpen(false)}
      />
    </div>
  );
}
