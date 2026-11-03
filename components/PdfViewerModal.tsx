'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, ExternalLink, FileText } from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl: string;
  fileName?: string;
}

export default function PdfViewerModal({
  isOpen,
  onClose,
  title,
  pdfUrl,
  fileName = 'material-estudio.pdf',
}: PdfViewerModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  // Visor Google Docs o visor directo si es data o cors
  const viewerSrc = pdfUrl.includes('github') || pdfUrl.includes('raw.githubusercontent')
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`
    : pdfUrl;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[999999] flex flex-col bg-black/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      {/* BARRA SUPERIOR FIJA DE CONTROL - 100% VISIBLE Y DESTACADA */}
      <header className="w-full bg-[#151c3d] text-[#eef1ff] border-b-2 border-[#2a3568] px-4 py-3 sm:px-6 shadow-2xl flex items-center justify-between gap-3 shrink-0">
        {/* Título */}
        <div className="flex items-center gap-2.5 truncate max-w-xl">
          <div className="p-2 rounded-xl bg-[#ffd166]/20 text-[#ffd166] shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="truncate">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffd166] block">
              Visor de Documento PDF
            </span>
            <h2 className="font-fredoka font-bold text-sm sm:text-base text-white truncate">
              {title}
            </h2>
          </div>
        </div>

        {/* Botones de Acción Clave */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Botón Descargar */}
          <a
            href={pdfUrl}
            download={fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5eead4] text-[#0f3a35] text-xs font-bold hover:bg-[#4fd8c2] transition shadow-md"
            title="Descargar este archivo a tu computadora o celular"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Descargar PDF</span>
          </a>

          {/* Botón Abrir en Nueva Pestaña */}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1b2559] border border-[#2a3568] text-white text-xs font-bold hover:bg-[#2a3568] transition"
            title="Abrir en pestaña nueva del navegador"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden md:inline">Pestaña Nueva</span>
          </a>

          {/* Botón Cerrar - Super Visible */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg transition active:scale-95"
            title="Cerrar visor de documento (o pulsa tecla Escape)"
          >
            <X className="w-4 h-4" />
            <span>Cerrar</span>
          </button>
        </div>
      </header>

      {/* CUERPO DEL VISOR PDF - OCUPA TODO EL ALTO RESTANTE */}
      <main className="flex-1 w-full h-full relative bg-[#0b1026]">
        <iframe
          src={viewerSrc}
          className="w-full h-full border-0"
          title={title}
        />
      </main>
    </div>
  );

  return createPortal(modalContent, document.body);
}
