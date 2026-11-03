'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Gamepad2, Sparkles, Trophy, ArrowRight, RotateCcw, Award } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { QUIZ_QUESTIONS } from '@/lib/initialData';
import { QuizQuestion } from '@/lib/types';

export default function DesafioProfePage() {
  const { currentUser, addQuizPoints } = useAppStore();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);

  // Inicializar preguntas aleatorias
  const startNewGame = () => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
    setPointsAwarded(0);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const handleSelectOption = (optionIndex: number) => {
    if (selectedOption !== null || !questions[currentIndex]) return;
    setSelectedOption(optionIndex);

    const isCorrect = optionIndex === questions[currentIndex].correct_index;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
      } else {
        // Fin de la partida
        setIsFinished(true);
        const earned = newScore * 5; // 5 puntos por cada respuesta correcta
        setPointsAwarded(earned);
        addQuizPoints(earned);

        if (newScore >= 4) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    }, 1100);
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd166]/20 border border-[#ffd166]/40 text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>¡Sumá puntos extra para tu materia!</span>
        </div>
        <h1 className="font-fredoka font-bold text-3xl sm:text-4xl text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
          🎮 ¡Desafía al Profe Núñez!
        </h1>
        <p className="text-xs sm:text-sm text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
          Respondé las preguntas de trivia. Cada acierto suma puntos directos que el profe tiene en cuenta para tu nota final.
        </p>
      </div>

      {/* Tarjeta del Juego */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] shadow-2xl">
        {!isFinished && currentQ ? (
          <div className="space-y-6">
            {/* Meta de la pregunta */}
            <div className="flex items-center justify-between text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] pb-3 border-b border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
              <span className="flex items-center gap-1.5">
                <span className="text-lg">{currentQ.icon}</span> {currentQ.category}
              </span>
              <span>
                Pregunta {currentIndex + 1} de {questions.length} · ⭐ {score} aciertos
              </span>
            </div>

            {/* Pregunta */}
            <h2 className="font-fredoka font-bold text-lg sm:text-xl text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] leading-snug">
              {currentQ.question}
            </h2>

            {/* Opciones */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedOption === i;
                const isCorrect = i === currentQ.correct_index;

                let btnStyle = 'bg-[#0b1026] text-[#eef1ff] border-[#2a3568] hover:border-[#ffd166] [data-tema=dia]_&:bg-[#f3f5fd] [data-tema=dia]_&:text-[#1b2150] [data-tema=dia]_&:border-[#d3d9ef]';

                if (selectedOption !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-[#0f3a35] text-[#5eead4] border-[#5eead4] font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-[#40152a] text-[#ff6b8b] border-[#ff6b8b] font-bold';
                  } else {
                    btnStyle = 'opacity-40 border-transparent';
                  }
                }

                return (
                  <button
                    key={opt}
                    disabled={selectedOption !== null}
                    onClick={() => handleSelectOption(i)}
                    className={`w-full text-left p-4 rounded-2xl border-2 text-sm font-semibold transition-all ${btnStyle}`}
                  >
                    <span className="inline-block w-6 text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                      {String.fromCharCode(65 + i)})
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Pantalla Final */
          <div className="text-center py-6 space-y-4 animate-fade-in">
            <div className="text-5xl">
              {score >= 4 ? '🏆' : '😎'}
            </div>

            <h2 className="font-fredoka font-bold text-2xl text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
              {score >= 4 ? '¡Excelente! ¡Le ganaste al Profe!' : '¡Buen intento! Ganó el Profe'}
            </h2>

            <p className="text-sm text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
              Acertaste <b className="text-[#ffd166] [data-tema=dia]_&:text-[#9a6400] text-base">{score} de {questions.length}</b> preguntas.
              {score >= 4 ? ' ¡Te ganaste un chocolate y puntos extra! 🍫' : ' ¡Revancha cuando quieras para seguir sumando!'}
            </p>

            <div className="p-4 rounded-2xl bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#ffd166]/40 inline-flex items-center gap-3">
              <Award className="w-6 h-6 text-[#ffd166]" />
              <div className="text-left">
                <span className="text-[11px] font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] block">
                  Puntos obtenidos en esta partida:
                </span>
                <span className="font-fredoka font-bold text-lg text-[#5eead4] [data-tema=dia]_&:text-[#0a5fb4]">
                  +{pointsAwarded} pts añadidos a tu perfil
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={startNewGame}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#ffd166] text-[#241a00] font-fredoka font-bold text-sm hover:scale-105 transition shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Jugar de Nuevo</span>
              </button>

              <Link
                href="/alumno"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1b2559] text-white [data-tema=dia]_&:bg-slate-200 [data-tema=dia]_&:text-slate-800 font-bold text-sm hover:scale-105 transition"
              >
                <span>Volver a Mis Guías</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
