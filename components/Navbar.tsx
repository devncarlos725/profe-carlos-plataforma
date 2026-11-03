'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  Car, 
  Gamepad2, 
  Sun, 
  Moon, 
  LogIn, 
  LogOut, 
  Sparkles,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function Navbar() {
  const pathname = usePathname();
  const { 
    currentUser, 
    theme, 
    toggleTheme, 
    setRole, 
    signInWithGoogle, 
    logout 
  } = useAppStore();

  const isTeacher = currentUser?.role === 'teacher';

  const teacherLinks = [
    { href: '/', label: '🗓️ Mi semana', icon: Clock },
    { href: '/profe/planificacion', label: '📋 Planificación Anual', icon: BookOpen },
    { href: '/profe/calendario', label: '📅 Calendario & Citas', icon: Calendar },
    { href: '/profe/alumnos', label: '📊 Dashboard Alumnos', icon: Users },
    { href: '/profe/contenidos', label: '📚 Contenidos & PDFs', icon: BookOpen },
    { href: '/profe/viajes', label: '🚗 Viajes', icon: Car },
    { href: '/alumno/desafio', label: '🎮 Trivia Profe', icon: Gamepad2 },
  ];

  const studentLinks = [
    { href: '/alumno', label: '🎒 Mi Curso & Roadmap', icon: BookOpen },
    { href: '/alumno/desafio', label: '🎮 ¡Desafía al Profe!', icon: Gamepad2 },
  ];

  const links = isTeacher ? teacherLinks : studentLinks;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b border-[#2a3568]/60 bg-[#0b1026]/90 [data-tema=dia]_&:bg-white/90 [data-tema=dia]_&:border-[#d3d9ef]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Rol */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🚀</span>
            <div>
              <span className="font-fredoka font-bold text-lg md:text-xl text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] block leading-tight">
                Profe Núñez
              </span>
              <span className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] flex items-center gap-1 font-semibold">
                {isTeacher ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-[#5eead4]" /> Panel Docente
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3 h-3 text-[#ffd166]" /> Campus Alumno {currentUser?.school ? `· ${currentUser.school}` : ''}
                  </>
                )}
              </span>
            </div>
          </Link>

          {/* Selector de modo rápido (para probar ambas vistas con 1 click) */}
          <div className="hidden sm:flex items-center bg-[#151c3d] [data-tema=dia]_&:bg-[#e8ebf8] p-1 rounded-full border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] text-xs">
            <button
              onClick={() => setRole('teacher')}
              className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                isTeacher 
                  ? 'bg-[#ffd166] text-[#241a00] shadow-sm' 
                  : 'text-[#9aa4d6] hover:text-white [data-tema=dia]_&:text-[#5a638f]'
              }`}
            >
              👨‍🏫 Modo Profe
            </button>
            <button
              onClick={() => setRole('student')}
              className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                !isTeacher 
                  ? 'bg-[#5eead4] text-[#0f3a35] shadow-sm' 
                  : 'text-[#9aa4d6] hover:text-white [data-tema=dia]_&:text-[#5a638f]'
              }`}
            >
              🎒 Modo Alumno
            </button>
          </div>
        </div>

        {/* Acciones derecha: Puntos, Tema, Perfil/Login */}
        <div className="flex items-center gap-2">
          {/* Puntos de alumno (gamificación) */}
          {!isTeacher && currentUser && (
            <div className="flex items-center gap-1.5 bg-[#ffd166]/15 border border-[#ffd166]/40 px-3 py-1 rounded-full text-xs font-bold text-[#ffd166] [data-tema=dia]_&:text-[#9a6400]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentUser.points} pts extra</span>
            </div>
          )}

          {/* Toggle Noche/Día */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[#151c3d] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] hover:scale-105 transition-transform"
            title="Cambiar tema día/noche"
            aria-label="Cambiar tema"
          >
            {theme === 'noche' ? <Sun className="w-4 h-4 text-[#ffd166]" /> : <Moon className="w-4 h-4 text-[#a78bfa]" />}
          </button>

          {/* Botón de Google Auth / Perfil */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
                  {currentUser.full_name}
                </span>
                <span className="text-[10px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                  {currentUser.email}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-800 text-xs font-bold hover:bg-slate-100 transition shadow"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-600" />
              <span>Entrar con Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de pestañas secundarias */}
      <nav className="max-w-7xl mx-auto px-4 pb-2 pt-1 flex gap-2 overflow-x-auto scrollbar-none">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-1.5 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[#ffd166] text-[#241a00] border-[#ffd166] shadow-md shadow-[#ffd166]/20'
                  : 'bg-[#151c3d] text-[#eef1ff] border-[#2a3568] hover:border-[#a78bfa] [data-tema=dia]_&:bg-white [data-tema=dia]_&:text-[#1b2150] [data-tema=dia]_&:border-[#d3d9ef]'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
