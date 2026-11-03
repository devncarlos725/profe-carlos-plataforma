'use client';

import { useState } from 'react';
import { X, Award, CheckSquare, MessageSquare, Save } from 'lucide-react';
import { TaskSubmission } from '@/lib/types';
import { DEFAULT_RUBRIC_CRITERIA } from '@/lib/initialData';

interface RubricGraderProps {
  isOpen: boolean;
  onClose: () => void;
  submission: TaskSubmission | null;
  onSaveGrade: (
    submissionId: string, 
    grade: number, 
    feedback: string, 
    rubricEvaluation: Record<string, boolean | number>
  ) => void;
}

export default function RubricGrader({
  isOpen,
  onClose,
  submission,
  onSaveGrade,
}: RubricGraderProps) {
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    DEFAULT_RUBRIC_CRITERIA.forEach(c => {
      init[c.id] = c.maxPoints;
    });
    return init;
  });

  if (!isOpen || !submission) return null;

  const totalCalculated = Object.values(criteriaScores).reduce((acc, v) => acc + v, 0);

  const handleScoreChange = (id: string, val: number) => {
    setCriteriaScores(prev => ({
      ...prev,
      [id]: val,
    }));
  };

  const handleSave = () => {
    onSaveGrade(submission.id, totalCalculated, feedback, criteriaScores);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white rounded-2xl border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
          <div>
            <span className="text-xs uppercase font-bold text-[#ffd166] tracking-wider">
              Corrección con Lista de Cotejo / Rúbrica
            </span>
            <h3 className="font-fredoka font-bold text-lg text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
              {submission.student_name || 'Alumno'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#9aa4d6] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trabajo entregado por el alumno */}
        <div className="mt-4 p-4 rounded-xl bg-[#0b1026] [data-tema=dia]_&:bg-slate-50 border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
          <span className="text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] block mb-1">
            Respuesta / Enlace entregado por el estudiante:
          </span>
          <p className="text-sm text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] whitespace-pre-wrap">
            {submission.submission_text || 'Sin texto adjunto.'}
          </p>
          {submission.submission_url && (
            <a
              href={submission.submission_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#5ab0ff] underline mt-2 block font-semibold hover:text-[#5eead4]"
            >
              📎 Ver archivo o enlace entregado: {submission.submission_url}
            </a>
          )}
        </div>

        {/* Lista de cotejo / Criterios de la rúbrica */}
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-bold text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#5eead4]" /> Criterios de Evaluación
          </h4>

          {DEFAULT_RUBRIC_CRITERIA.map(c => {
            const currentScore = criteriaScores[c.id] ?? c.maxPoints;
            return (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-[#0e1432] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] flex flex-wrap items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-[200px]">
                  <span className="text-xs font-bold text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] block">
                    {c.name}
                  </span>
                  <span className="text-[11px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                    Ponderación máxima: {c.maxPoints} pts
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={c.maxPoints}
                    step={0.5}
                    value={currentScore}
                    onChange={e => handleScoreChange(c.id, parseFloat(e.target.value))}
                    className="w-24 accent-[#ffd166] cursor-pointer"
                  />
                  <span className="text-xs font-bold bg-[#ffd166]/20 text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] px-2 py-0.5 rounded-lg">
                    {currentScore} / {c.maxPoints}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Calificación total y Devolución */}
        <div className="mt-4 pt-3 border-t border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#ffd166]" /> Calificación Final Calculada:
            </span>
            <span className="text-2xl font-fredoka font-bold text-[#5eead4] [data-tema=dia]_&:text-[#0a5fb4]">
              {totalCalculated} / 10
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Devolución pedagógica para el alumno
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Excelente desarrollo, se nota el dominio en la articulación de mecanismos..."
              className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl p-3 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] focus:outline-none focus:border-[#5eead4]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#9aa4d6] hover:bg-slate-800/40 rounded-xl"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-[#5eead4] text-[#0f3a35] text-xs font-bold rounded-xl hover:bg-[#4fd8c2] transition shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Calificación</span>
          </button>
        </div>
      </div>
    </div>
  );
}
