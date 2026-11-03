'use client';

import { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Sparkles, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Award, 
  FileText, 
  CheckSquare, 
  GraduationCap, 
  BarChart3, 
  UserCheck, 
  UserX, 
  Mail, 
  Trash2, 
  X, 
  Layers, 
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { SCHOOLS_COURSES } from '@/lib/initialData';
import { StudentRecord } from '@/lib/types';
import RubricGrader from '@/components/RubricGrader';

export default function StudentsDashboardPage() {
  const { 
    students, 
    addManualStudent, 
    updateStudentGrade, 
    deleteStudent,
    curriculumTopics 
  } = useAppStore();

  // Estados de filtros y segmentación
  const [selectedSchool, setSelectedSchool] = useState<string>('Todas');
  const [selectedCourse, setSelectedCourse] = useState<string>('Todos');
  const [selectedQuartile, setSelectedQuartile] = useState<string>('todos');
  const [filterRegistration, setFilterRegistration] = useState<string>('todos'); // 'todos' | 'google' | 'manual'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'grade' | 'points' | 'quartile'>('grade');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modales
  const [isAddManualOpen, setIsAddManualOpen] = useState(false);
  const [inspectStudent, setInspectStudent] = useState<StudentRecord | null>(null);
  const [rubricStudent, setRubricStudent] = useState<StudentRecord | null>(null);

  // Formulario nuevo alumno manual
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentSchool, setNewStudentSchool] = useState('Mons. Conrero');
  const [newStudentCourse, setNewStudentCourse] = useState('2° Año');
  const [newStudentGrade, setNewStudentGrade] = useState('7.0');
  const [newStudentNotes, setNewStudentNotes] = useState('');

  // Filtrado de alumnos
  const filteredStudents = students
    .filter(student => {
      const matchSchool = selectedSchool === 'Todas' || student.school === selectedSchool;
      const matchCourse = selectedCourse === 'Todos' || student.course === selectedCourse;
      const matchQuartile = selectedQuartile === 'todos' || student.quartile === selectedQuartile;
      const matchReg = filterRegistration === 'todos' || 
        (filterRegistration === 'manual' ? student.is_manual : !student.is_manual);
      const matchSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSchool && matchCourse && matchQuartile && matchReg && matchSearch;
    })
    .sort((a, b) => {
      let comp = 0;
      if (sortBy === 'name') comp = a.full_name.localeCompare(b.full_name);
      if (sortBy === 'grade') comp = a.average_grade - b.average_grade;
      if (sortBy === 'points') comp = a.points - b.points;
      if (sortBy === 'quartile') comp = a.quartile.localeCompare(b.quartile);
      return sortOrder === 'asc' ? comp : -comp;
    });

  // Métricas para segmentación rápida
  const countQ4 = students.filter(s => s.quartile === 'Q4').length;
  const countQ3 = students.filter(s => s.quartile === 'Q3').length;
  const countQ2 = students.filter(s => s.quartile === 'Q2').length;
  const countQ1 = students.filter(s => s.quartile === 'Q1').length;

  const handleCreateManualStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName) return;

    addManualStudent({
      full_name: newStudentName,
      school: newStudentSchool,
      course: newStudentCourse,
      initial_grade: parseFloat(newStudentGrade) || 7.0,
      notes: newStudentNotes,
    });

    setNewStudentName('');
    setNewStudentNotes('');
    setIsAddManualOpen(false);
  };

  const getQuartileBadge = (q: 'Q1' | 'Q2' | 'Q3' | 'Q4') => {
    switch (q) {
      case 'Q4':
        return { label: '🌟 Q4 · Sobresaliente', bg: 'bg-[#5eead4]/20 text-[#5eead4] [data-tema=dia]_&:text-[#0f3a35] border-[#5eead4]/50' };
      case 'Q3':
        return { label: '🟢 Q3 · Satisfactorio', bg: 'bg-[#ffd166]/20 text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] border-[#ffd166]/50' };
      case 'Q2':
        return { label: '🟡 Q2 · En Proceso', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/50' };
      case 'Q1':
        return { label: '🔴 Q1 · Requiere Apoyo', bg: 'bg-red-500/20 text-red-300 border-red-500/50' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera Principal */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-fredoka font-bold text-2xl sm:text-3xl text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] flex items-center gap-2">
            <Users className="w-7 h-7 text-[#5eead4]" /> Tabla Dinámica de Alumnos & Rúbricas
          </h1>
          <p className="text-sm text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mt-1">
            Segmentá por cuartiles (Q1 a Q4), cargá alumnos sin cuenta presencialmente y evaluá con rúbricas en una sola tabla.
          </p>
        </div>

        <button
          onClick={() => setIsAddManualOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ffd166] text-[#241a00] font-bold text-sm hover:bg-[#ffc83d] transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Alumno (En Aula / Sin Correo)</span>
        </button>
      </div>

      {/* SEGMENTACIÓN POR CUARTILES DE RENDIMIENTO (Q1 a Q4) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedQuartile(selectedQuartile === 'Q4' ? 'todos' : 'Q4')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedQuartile === 'Q4'
              ? 'bg-[#5eead4]/25 border-[#5eead4] ring-2 ring-[#5eead4]'
              : 'bg-[#151c3d] [data-tema=dia]_&:bg-white border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] hover:border-[#5eead4]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5eead4] [data-tema=dia]_&:text-[#0f3a35]">🌟 Cuartil Q4</span>
            <span className="font-fredoka font-bold text-xl text-[#5eead4] [data-tema=dia]_&:text-[#0f3a35]">{countQ4}</span>
          </div>
          <span className="text-[11px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] block mt-1">
            Avanzado / Sobresaliente (8.5 - 10)
          </span>
        </button>

        <button
          onClick={() => setSelectedQuartile(selectedQuartile === 'Q3' ? 'todos' : 'Q3')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedQuartile === 'Q3'
              ? 'bg-[#ffd166]/25 border-[#ffd166] ring-2 ring-[#ffd166]'
              : 'bg-[#151c3d] [data-tema=dia]_&:bg-white border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] hover:border-[#ffd166]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#ffd166] [data-tema=dia]_&:text-[#9a6400]">🟢 Cuartil Q3</span>
            <span className="font-fredoka font-bold text-xl text-[#ffd166] [data-tema=dia]_&:text-[#9a6400]">{countQ3}</span>
          </div>
          <span className="text-[11px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] block mt-1">
            Satisfactorio / Aprobado (7.0 - 8.4)
          </span>
        </button>

        <button
          onClick={() => setSelectedQuartile(selectedQuartile === 'Q2' ? 'todos' : 'Q2')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedQuartile === 'Q2'
              ? 'bg-amber-500/25 border-amber-500 ring-2 ring-amber-500'
              : 'bg-[#151c3d] [data-tema=dia]_&:bg-white border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 [data-tema=dia]_&:text-amber-700">🟡 Cuartil Q2</span>
            <span className="font-fredoka font-bold text-xl text-amber-300 [data-tema=dia]_&:text-amber-700">{countQ2}</span>
          </div>
          <span className="text-[11px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] block mt-1">
            En Proceso / Regular (4.0 - 6.9)
          </span>
        </button>

        <button
          onClick={() => setSelectedQuartile(selectedQuartile === 'Q1' ? 'todos' : 'Q1')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            selectedQuartile === 'Q1'
              ? 'bg-red-500/25 border-red-500 ring-2 ring-red-500'
              : 'bg-[#151c3d] [data-tema=dia]_&:bg-white border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] hover:border-red-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-300 [data-tema=dia]_&:text-red-600">🔴 Cuartil Q1</span>
            <span className="font-fredoka font-bold text-xl text-red-300 [data-tema=dia]_&:text-red-600">{countQ1}</span>
          </div>
          <span className="text-[11px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] block mt-1">
            Requiere Apoyo / Riesgo (1.0 - 3.9)
          </span>
        </button>
      </div>

      {/* BARRA DE FILTROS Y SEGMENTACIÓN DE DATOS */}
      <div className="p-4 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Buscar */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl pl-9 pr-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
          />
          <Search className="w-4 h-4 text-[#9aa4d6] absolute left-3 top-2.5" />
        </div>

        {/* Escuela */}
        <div>
          <select
            value={selectedSchool}
            onChange={e => setSelectedSchool(e.target.value)}
            className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs font-semibold text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
          >
            <option value="Todas">Todas las escuelas</option>
            {SCHOOLS_COURSES.map(sc => (
              <option key={sc.id} value={sc.school_name}>
                {sc.school_name}
              </option>
            ))}
          </select>
        </div>

        {/* Curso */}
        <div>
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs font-semibold text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
          >
            <option value="Todos">Todos los años</option>
            <option value="2° Año">2° Año</option>
            <option value="3° Año">3° Año</option>
          </select>
        </div>

        {/* Registro / Tipo */}
        <div>
          <select
            value={filterRegistration}
            onChange={e => setFilterRegistration(e.target.value)}
            className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs font-semibold text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
          >
            <option value="todos">Todos (Google y En Aula)</option>
            <option value="manual">📝 Solo cargados en aula (Sin correo)</option>
            <option value="google">🟢 Con cuenta Google / Email</option>
          </select>
        </div>
      </div>

      {/* TABLA DINÁMICA DE ESTUDIANTES */}
      <div className="rounded-2xl border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] bg-[#151c3d] [data-tema=dia]_&:bg-white shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] bg-[#0b1026]/75 [data-tema=dia]_&:bg-slate-100 text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4">
                  <button 
                    onClick={() => { setSortBy('name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <span>Estudiante</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Escuela / Curso</th>
                <th className="py-3 px-4">
                  <button 
                    onClick={() => { setSortBy('quartile'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <span>Perfil (Cuartil)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button 
                    onClick={() => { setSortBy('grade'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <span>Promedio</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button 
                    onClick={() => { setSortBy('points'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <span>Pts Trivia</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Última Devolución / Rúbrica</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3568]/40 [data-tema=dia]_&:divide-[#d3d9ef]">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((st) => {
                  const qBadge = getQuartileBadge(st.quartile);

                  return (
                    <tr 
                      key={st.id}
                      className="transition hover:bg-[#1b2559]/30 [data-tema=dia]_&:hover:bg-slate-50"
                    >
                      {/* Nombre y Tipo */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-bold text-sm text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] block">
                              {st.full_name}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              {st.is_manual ? (
                                <span className="text-[10px] bg-slate-700/40 text-slate-300 [data-tema=dia]_&:bg-slate-200 [data-tema=dia]_&:text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                                  📝 En Aula (Sin cuenta)
                                </span>
                              ) : (
                                <span className="text-[10px] bg-[#5eead4]/15 text-[#5eead4] [data-tema=dia]_&:text-[#0f3a35] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                                  <UserCheck className="w-2.5 h-2.5" /> Cuenta Google
                                </span>
                              )}
                              {st.email && (
                                <span className="text-[10px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                                  · {st.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Escuela y Curso */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] block">
                          {st.school}
                        </span>
                        <span className="text-[11px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                          ⚙️ {st.course}
                        </span>
                      </td>

                      {/* Cuartil */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${qBadge.bg}`}>
                          {qBadge.label}
                        </span>
                      </td>

                      {/* Promedio / Nota */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-fredoka font-bold text-base text-[#5eead4] [data-tema=dia]_&:text-[#0a5fb4]">
                          {st.average_grade.toFixed(1)} / 10
                        </span>
                      </td>

                      {/* Puntos Trivia */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-[#ffd166]/15 border border-[#ffd166]/30 px-2 py-0.5 rounded-full text-xs font-bold text-[#ffd166] [data-tema=dia]_&:text-[#9a6400]">
                          <Sparkles className="w-3 h-3" /> {st.points} pts
                        </span>
                      </td>

                      {/* Feedback */}
                      <td className="py-3 px-4 max-w-xs">
                        {st.last_submission_feedback ? (
                          <span className="text-[11px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] italic line-clamp-2">
                            "{st.last_submission_feedback}"
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Sin devolución aún</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Botón Ver Gráfica y Perfil */}
                          <button
                            onClick={() => setInspectStudent(st)}
                            className="p-1.5 rounded-xl bg-[#1b2559] hover:bg-[#2a3568] text-[#5eead4] [data-tema=dia]_&:bg-slate-100 transition"
                            title="Ver Gráfica de Rendimiento y Perfil Q1-Q4"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>

                          {/* Botón Corregir con Rúbrica */}
                          <button
                            onClick={() => setRubricStudent(st)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#5eead4] text-[#0f3a35] font-bold text-xs hover:bg-[#4fd8c2] transition shadow-sm flex items-center gap-1"
                            title="Calificar con Rúbrica / Lista de Cotejo"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Rúbrica</span>
                          </button>

                          {/* Borrar */}
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar a ${st.full_name} del listado?`)) {
                                deleteStudent(st.id);
                              }
                            }}
                            className="p-1.5 rounded-xl text-red-400 hover:bg-red-500/20 transition"
                            title="Eliminar estudiante"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                    <Users className="w-8 h-8 text-[#ffd166] mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-sm">No se encontraron estudiantes con los filtros aplicados.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de tabla con resumen */}
        <div className="px-4 py-3 bg-[#0b1026]/75 [data-tema=dia]_&:bg-slate-50 border-t border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] flex flex-wrap items-center justify-between text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] gap-2">
          <span>Mostrando <b>{filteredStudents.length}</b> estudiantes de un total de <b>{students.length}</b></span>
          <div className="flex gap-3">
            <span className="text-[#5eead4]">Q4: {countQ4}</span>
            <span className="text-[#ffd166]">Q3: {countQ3}</span>
            <span className="text-amber-400">Q2: {countQ2}</span>
            <span className="text-red-400">Q1: {countQ1}</span>
          </div>
        </div>
      </div>

      {/* MODAL 1: CARGA MANUAL DE ALUMNOS (PARA ALUMNOS EN EL AULA SIN EMAIL) */}
      {isAddManualOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#151c3d] [data-tema=dia]_&:bg-white rounded-3xl border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
              <div>
                <span className="text-[10px] font-bold text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] uppercase tracking-wider block">
                  Sin obligación de correo ni inicio de sesión
                </span>
                <h3 className="font-fredoka font-bold text-lg text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
                  ➕ Cargar Alumno Manualmente
                </h3>
              </div>
              <button onClick={() => setIsAddManualOpen(false)} className="p-1 text-[#9aa4d6] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualStudent} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                  Nombre y Apellido del Estudiante
                </label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  placeholder="Ej: Marcos Alderete"
                  className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                    Escuela
                  </label>
                  <select
                    value={newStudentSchool}
                    onChange={e => setNewStudentSchool(e.target.value)}
                    className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
                  >
                    {SCHOOLS_COURSES.map(sc => (
                      <option key={sc.id} value={sc.school_name}>
                        {sc.school_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                    Curso
                  </label>
                  <select
                    value={newStudentCourse}
                    onChange={e => setNewStudentCourse(e.target.value)}
                    className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
                  >
                    <option value="2° Año">2° Año</option>
                    <option value="3° Año">3° Año</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                  Nota o Calificación Inicial (1 a 10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  value={newStudentGrade}
                  onChange={e => setNewStudentGrade(e.target.value)}
                  className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                  Observaciones pedagógicas (opcional)
                </label>
                <textarea
                  rows={2}
                  value={newStudentNotes}
                  onChange={e => setNewStudentNotes(e.target.value)}
                  placeholder="Ej: Trabaja en lámina en el aula..."
                  className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
                <button
                  type="button"
                  onClick={() => setIsAddManualOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#9aa4d6]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ffd166] text-[#241a00] text-xs font-bold rounded-xl hover:bg-[#ffc83d]"
                >
                  Guardar Alumno en la Tabla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GRÁFICAS Y PERFIL INDIVIDUAL DEL ALUMNO (CUARTIL Q1-Q4 & COMPETENCIAS) */}
      {inspectStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#151c3d] [data-tema=dia]_&:bg-white rounded-3xl border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
              <div>
                <span className="text-[10px] font-bold text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] uppercase tracking-wider block">
                  Perfil de Desempeño Pedagógico
                </span>
                <h3 className="font-fredoka font-bold text-xl text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
                  {inspectStudent.full_name}
                </h3>
                <span className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                  {inspectStudent.school} · {inspectStudent.course}
                </span>
              </div>
              <button onClick={() => setInspectStudent(null)} className="p-1 text-[#9aa4d6] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuadrante Destacado */}
            <div className="p-4 rounded-2xl bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] block">
                  Diagnóstico Curricular:
                </span>
                <span className="font-fredoka font-bold text-lg text-[#5eead4] [data-tema=dia]_&:text-[#0a5fb4]">
                  {getQuartileBadge(inspectStudent.quartile).label}
                </span>
                <p className="text-[11px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mt-0.5">
                  Promedio general acumulado: <b>{inspectStudent.average_grade} / 10</b>
                </p>
              </div>

              <div className="text-right">
                <span className="font-fredoka font-bold text-3xl text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] block">
                  {inspectStudent.attendance_percent}%
                </span>
                <span className="text-[10px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                  Asistencia en Taller
                </span>
              </div>
            </div>

            {/* GRÁFICA DE BARRAS DE COMPETENCIAS */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#0e1432] [data-tema=dia]_&:bg-slate-50 border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
              <h4 className="text-xs font-bold text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#ffd166]" /> Gráfica de Competencias Técnicas
              </h4>

              {[
                { label: 'Comprensión y Aplicación Conceptual', val: inspectStudent.skills.concepts, color: 'from-blue-500 to-[#5eead4]' },
                { label: 'Redacción, Planos y Diagramas de Bloques', val: inspectStudent.skills.diagrams, color: 'from-[#ffd166] to-amber-500' },
                { label: 'Participación en Clases y Tareas Prácticas', val: inspectStudent.skills.participation, color: 'from-purple-500 to-[#a78bfa]' },
                { label: 'Actitud, Predisposición y Desafíos', val: inspectStudent.skills.attitude, color: 'from-emerald-500 to-teal-400' },
              ].map(bar => (
                <div key={bar.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">{bar.label}</span>
                    <span className="font-bold text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">{bar.val} / 10</span>
                  </div>
                  <div className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${bar.color}`} 
                      style={{ width: `${bar.val * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Notas pedagógicas del alumno */}
            {inspectStudent.notes && (
              <div className="p-3 rounded-xl bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] text-xs">
                <span className="font-bold text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] block mb-1">
                  Observaciones registradas por el Profe:
                </span>
                <p className="text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
                  {inspectStudent.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectStudent(null)}
                className="px-5 py-2 bg-[#ffd166] text-[#241a00] text-xs font-bold rounded-xl hover:bg-[#ffc83d]"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CALIFICADOR CON RÚBRICA Y LISTA DE COTEJO */}
      {rubricStudent && (
        <RubricGrader
          isOpen={Boolean(rubricStudent)}
          onClose={() => setRubricStudent(null)}
          submission={{
            id: 'sub-' + rubricStudent.id,
            material_id: 'mat-eval',
            student_id: rubricStudent.id,
            student_name: rubricStudent.full_name,
            student_email: rubricStudent.email,
            submission_text: rubricStudent.last_submission_feedback || 'Calificación presencial de actividades y carpeta de taller.',
            submitted_at: new Date().toISOString(),
            grade: rubricStudent.average_grade,
            feedback: rubricStudent.last_submission_feedback,
          }}
          onSaveGrade={(subId, grade, feedback, rubricScores) => {
            updateStudentGrade(rubricStudent.id, grade, feedback);
            setRubricStudent(null);
          }}
        />
      )}
    </div>
  );
}
