'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Calendar as CalendarIcon, 
  Trash2, 
  Save, 
  Tag, 
  FileText, 
  MapPin, 
  MoveRight 
} from 'lucide-react';
import { DAYS_NAMES } from '@/lib/initialData';

export interface EditableBlock {
  id: string;
  type: string; // 'class' | 'personal' | 'tramite' | 'viaje' | 'ordonez' | 'libre' | 'clase'
  day: number;
  timeStart: string;
  timeEnd: string;
  title: string;
  sub?: string;
  raw?: any;
}

interface EditBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: EditableBlock | null;
  onSave: (id: string, type: string, updates: {
    title: string;
    sub?: string;
    day: number;
    start_time: string;
    end_time: string;
    event_type?: string;
  }) => void;
  onDelete: (id: string, type: string) => void;
}

export default function EditBlockModal({
  isOpen,
  onClose,
  block,
  onSave,
  onDelete,
}: EditBlockModalProps) {
  const [title, setTitle] = useState('');
  const [sub, setSub] = useState('');
  const [day, setDay] = useState<number>(1);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [eventType, setEventType] = useState('clase');

  useEffect(() => {
    if (block) {
      setTitle(block.title || '');
      setSub(block.sub || '');
      setDay(block.day || 1);
      setStartTime(block.timeStart || '08:00');
      setEndTime(block.timeEnd || '09:00');
      setEventType(block.type === 'class' ? 'clase' : block.type);
    }
  }, [block]);

  if (!isOpen || !block) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(block.id, block.type, {
      title: title.trim(),
      sub: sub.trim() || undefined,
      day,
      start_time: startTime,
      end_time: endTime,
      event_type: eventType,
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de que querés eliminar "${block.title}" del cronograma?`)) {
      onDelete(block.id, block.type);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#151c3d] [data-tema=dia]_&:bg-white rounded-3xl border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] shadow-2xl overflow-hidden">
        
        {/* Encabezado */}
        <div className="p-5 border-b border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] flex items-center justify-between bg-[#19224d] [data-tema=dia]_&:bg-[#f5f7fd]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ffd166]/20 text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] flex items-center justify-center font-bold">
              ✏️
            </div>
            <div>
              <h3 className="font-fredoka text-lg font-bold text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b]">
                Editar Horario / Actividad
              </h3>
              <p className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                Modificá las horas, minutos o cambialo de día
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9aa4d6] hover:text-white [data-tema=dia]_&:text-[#5a638f] [data-tema=dia]_&:hover:text-black hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1.5">
              Título (Escuela / Compromiso / Viaje)
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f142e] [data-tema=dia]_&:bg-[#f4f6fc] border border-[#2a3568] [data-tema=dia]_&:border-[#c7d0eb] text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b] text-sm focus:outline-none focus:border-[#ffd166]"
            />
          </div>

          {/* Subtítulo / Descripción */}
          <div>
            <label className="block text-xs font-semibold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1.5">
              Detalle / Curso y Materia / Ubicación
            </label>
            <input
              type="text"
              value={sub}
              onChange={(e) => setSub(e.target.value)}
              placeholder="Ej: 2° Año · Educ. Tecnológica I"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f142e] [data-tema=dia]_&:bg-[#f4f6fc] border border-[#2a3568] [data-tema=dia]_&:border-[#c7d0eb] text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b] text-sm focus:outline-none focus:border-[#ffd166]"
            />
          </div>

          {/* Día y Rango Horario */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#0f142e] [data-tema=dia]_&:bg-[#f4f6fc] border border-[#2a3568] [data-tema=dia]_&:border-[#c7d0eb]">
            <div>
              <label className="block text-xs font-semibold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1 flex items-center gap-1">
                <CalendarIcon size={13} /> Día
              </label>
              <select
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#c7d0eb] text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b] text-sm focus:outline-none"
              >
                <option value={1}>Lunes</option>
                <option value={2}>Martes</option>
                <option value={3}>Miércoles</option>
                <option value={4}>Jueves</option>
                <option value={5}>Viernes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1 flex items-center gap-1">
                <Clock size={13} /> Inicio
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#c7d0eb] text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b] text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1 flex items-center gap-1">
                <Clock size={13} /> Fin
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#c7d0eb] text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b] text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Categoría / Tipo */}
          <div>
            <label className="block text-xs font-semibold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1.5 flex items-center gap-1.5">
              <Tag size={13} /> Tipo de Bloque
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0f142e] [data-tema=dia]_&:bg-[#f4f6fc] border border-[#2a3568] [data-tema=dia]_&:border-[#c7d0eb] text-[#eef2ff] [data-tema=dia]_&:text-[#0d122b] text-sm focus:outline-none"
            >
              <option value="clase">🏫 Escuela / Clase</option>
              <option value="ordonez">💼 Ordoñez Vidrios</option>
              <option value="viaje">🚗 Viaje en Auto</option>
              <option value="personal">🩺 Cita Personal / Dentista</option>
              <option value="tramite">📋 Trámite / Junta</option>
              <option value="libre">🛋️ Tiempo Libre / Casa</option>
            </select>
          </div>

          {/* Botones de acción */}
          <div className="pt-3 flex items-center justify-between border-t border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#ff6b8b] hover:bg-[#ff6b8b]/15 transition flex items-center gap-1.5"
            >
              <Trash2 size={15} />
              Eliminar
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9aa4d6] hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#ffd166] hover:bg-[#ffbe0b] text-[#0d122b] transition flex items-center gap-1.5 shadow-md shadow-[#ffd166]/20"
              >
                <Save size={15} />
                Guardar Cambios
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
