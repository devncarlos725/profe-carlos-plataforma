'use client';

import { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, Tag, MapPin, Plus } from 'lucide-react';
import { CalendarEventItem } from '@/lib/types';
import { DAYS_NAMES } from '@/lib/initialData';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEventItem, 'id'>) => void;
}

export default function AddEventModal({ isOpen, onClose, onSave }: AddEventModalProps) {
  const [title, setTitle] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number>(2); // Martes por defecto
  const [specificDate, setSpecificDate] = useState('');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('08:00');
  const [eventType, setEventType] = useState<'personal' | 'tramite' | 'clase' | 'viaje' | 'libre'>('personal');
  const [location, setLocation] = useState('San Miguel / Consultorio');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onSave({
      title,
      description,
      day_of_week: dayOfWeek,
      specific_date: specificDate || undefined,
      start_time: startTime,
      end_time: endTime,
      event_type: eventType,
      location: location || undefined,
    });

    // Reset & close
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#151c3d] [data-tema=dia]_&:bg-white rounded-2xl border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#ffd166]" />
            <h3 className="font-fredoka font-bold text-lg text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
              Agregar Evento o Cita al Calendario
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9aa4d6] hover:text-white [data-tema=dia]_&:text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
              Título del evento o compromiso
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Ir al dentista / Tomar horas en nueva escuela"
              className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-sm text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] focus:outline-none focus:border-[#ffd166]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                Día de la semana
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-sm text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
              >
                {DAYS_NAMES.slice(1).map((name, i) => (
                  <option key={name} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                Fecha puntual (opcional)
              </label>
              <input
                type="date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-sm text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                Hora de Inicio
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-sm text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                Hora de Fin
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-sm text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                Tipo de evento
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as any)}
                className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-sm text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
              >
                <option value="personal">🩺 Cita médica / Dentista / Personal</option>
                <option value="tramite">📋 Trámite / Junta</option>
                <option value="clase">🏫 Clase / Nueva Escuela</option>
                <option value="viaje">🚗 Viaje en auto</option>
                <option value="libre">🛋️ Tiempo Libre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                Lugar / Nota corta
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Barrio Sur / Junta / Alderetes"
                className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-sm text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-bold text-[#9aa4d6] hover:bg-slate-800/40"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#ffd166] text-[#241a00] text-sm font-bold hover:bg-[#ffc83d] transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar en Calendario</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
