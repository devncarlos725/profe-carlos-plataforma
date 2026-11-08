'use client';

import { useState } from 'react';
import { Car, MapPin, Plus, Trash2, Calendar, FileDown } from 'lucide-react';
import { DAYS_NAMES } from '@/lib/initialData';

interface TripRecord {
  id: string;
  date: string;
  km: number;
  minutes: number;
  note?: string;
}

const DEFAULT_PLAN = [
  { day: 1, route: 'Casa → El Naranjo → Casa → Tafí Viejo → Casa (sin Ordoñez)', km: 91.4, min: 104 },
  { day: 2, route: 'Casa → Reconquista → Ordoñez (13:30-17:00) → Tafí Viejo (17:50-18:30) → Casa', km: 68.2, min: 110 },
  { day: 3, route: 'Casa → Ordoñez (07:30-16:00) → Mancopa (16:40-17:20) → Casa', km: 54.6, min: 74 },
  { day: 4, route: 'Casa → Mons. Conrero (10:30-11:10) → Mancopa (13:00-14:20) → Ordoñez (15:00-18:30) → Casa', km: 62.8, min: 83 },
  { day: 5, route: 'Casa → Timbó Nuevo → Mons. Conrero → Ordoñez → Casa', km: 57.4, min: 73 },
];

export default function ViajesPage() {
  const [trips, setTrips] = useState<TripRecord[]>([
    { id: 'v-1', date: '2026-11-02', km: 89.1, minutes: 103, note: 'Ruta completa según plan' },
  ]);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [km, setKm] = useState('');
  const [minutes, setMinutes] = useState('');
  const [note, setNote] = useState('');

  const totalKm = trips.reduce((acc, t) => acc + t.km, 0);
  const totalMin = trips.reduce((acc, t) => acc + t.minutes, 0);

  const handleAddTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!km) return;

    const newTrip: TripRecord = {
      id: 'v-' + Date.now(),
      date,
      km: parseFloat(km),
      minutes: parseInt(minutes) || 0,
      note,
    };

    setTrips([newTrip, ...trips]);
    setKm('');
    setMinutes('');
    setNote('');
  };

  const handleRegisterFromPlan = () => {
    const dayOfWeek = new Date(date + 'T00:00:00').getDay();
    const planned = DEFAULT_PLAN.find(p => p.day === dayOfWeek);
    if (!planned) return alert('No hay ruta planificada para este día');

    const newTrip: TripRecord = {
      id: 'v-' + Date.now(),
      date,
      km: planned.km,
      minutes: planned.min,
      note: `Según plan: ${planned.route}`,
    };
    setTrips([newTrip, ...trips]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-fredoka font-bold text-2xl sm:text-3xl text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] flex items-center gap-2">
          <Car className="w-7 h-7 text-[#5ab0ff]" /> Bitácora de Viajes en Auto
        </h1>
        <p className="text-sm text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mt-1">
          Kilometraje, tiempos de viaje y combustible estimado desde Alderetes a todas las escuelas.
        </p>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
          <span className="font-fredoka font-bold text-2xl text-[#5ab0ff] block">
            {totalKm.toFixed(1)} km
          </span>
          <span className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] font-semibold">
            Km registrados acumulados
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
          <span className="font-fredoka font-bold text-2xl text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] block">
            {Math.floor(totalMin / 60)}h {totalMin % 60}m
          </span>
          <span className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] font-semibold">
            Tiempo de manejo
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
          <span className="font-fredoka font-bold text-2xl text-[#5eead4] [data-tema=dia]_&:text-[#0f3a35] block">
            294.6 km
          </span>
          <span className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] font-semibold">
            Plan semanal actualizado
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
          <span className="font-fredoka font-bold text-2xl text-[#a78bfa] block">
            {trips.length}
          </span>
          <span className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] font-semibold">
            Viajes asentados
          </span>
        </div>
      </div>

      {/* Plan semanal */}
      <div className="p-5 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
        <h3 className="font-fredoka font-bold text-base text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] mb-3">
          Plan Semanal de Recorridos (Ida y Vuelta)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                <th className="py-2">Día</th>
                <th>Recorrido</th>
                <th>Km</th>
                <th>Tiempo Estimado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3568]/40 [data-tema=dia]_&:divide-[#d3d9ef]/60">
              {DEFAULT_PLAN.map(p => (
                <tr key={p.day} className="text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
                  <td className="py-2.5 font-bold">{DAYS_NAMES[p.day]}</td>
                  <td>{p.route}</td>
                  <td className="font-bold text-[#5ab0ff]">{p.km.toFixed(1)} km</td>
                  <td>{Math.floor(p.min / 60)}h {p.min % 60}m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registrar Viaje Real */}
      <div className="p-5 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] space-y-4">
        <h3 className="font-fredoka font-bold text-base text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
          📝 Registrar un Viaje Real
        </h3>

        <form onSubmit={handleAddTrip} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="date"
            required
            value={date}
            onChange={e => setDate(e.target.value)}
            className="bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
          />
          <input
            type="number"
            step="0.1"
            required
            placeholder="Kilómetros reales"
            value={km}
            onChange={e => setKm(e.target.value)}
            className="bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
          />
          <input
            type="number"
            placeholder="Minutos de viaje"
            value={minutes}
            onChange={e => setMinutes(e.target.value)}
            className="bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
          />
          <input
            type="text"
            placeholder="Nota (opcional)"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
          />
          <div className="sm:col-span-4 flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-[#ffd166] text-[#241a00] font-bold text-xs rounded-xl hover:bg-[#ffc83d]"
            >
              ➕ Guardar Viaje
            </button>
            <button
              type="button"
              onClick={handleRegisterFromPlan}
              className="px-5 py-2 bg-[#5ab0ff]/20 text-[#5ab0ff] border border-[#5ab0ff]/40 font-bold text-xs rounded-xl hover:bg-[#5ab0ff]/30"
            >
              ✅ Registrar el día según el plan
            </button>
          </div>
        </form>

        {/* Historial */}
        <div className="space-y-2 pt-3 border-t border-[#2a3568]/40 [data-tema=dia]_&:border-[#d3d9ef]/60">
          {trips.map(t => (
            <div
              key={t.id}
              className="p-3 rounded-xl bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
                  🚗 {t.date} · {t.km} km · {t.minutes} min
                </span>
                {t.note && (
                  <p className="text-[11px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                    {t.note}
                  </p>
                )}
              </div>
              <button
                onClick={() => setTrips(trips.filter(x => x.id !== t.id))}
                className="p-1 text-[#9aa4d6] hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
