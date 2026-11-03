'use client';

import { useState, useRef } from 'react';
import { 
  BookOpen, 
  Plus, 
  FileText, 
  Video, 
  Upload, 
  Eye, 
  Trash2, 
  Link as LinkIcon, 
  CheckCircle2, 
  FileUp,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { SCHOOLS_COURSES } from '@/lib/initialData';
import PdfViewerModal from '@/components/PdfViewerModal';

export default function ContenidosPage() {
  const { materials, addMaterial, deleteMaterial } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePdf, setActivePdf] = useState<{ url: string; title: string; fileName?: string } | null>(null);

  // Formulario nuevo contenido
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialType, setMaterialType] = useState<'pdf' | 'video' | 'guia' | 'tarea'>('pdf');
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [url, setUrl] = useState('');
  const [school, setSchool] = useState('Todas');
  const [course, setCourse] = useState('2° Año');
  const [dueDate, setDueDate] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Manejar selección de archivo local
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Por favor seleccioná un archivo en formato PDF.');
      return;
    }

    // Tamaño formateado
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    setSelectedFileName(file.name);
    setSelectedFileSize(`${sizeMb} MB`);

    // Si el título está vacío, auto-completar con el nombre del archivo
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }

    // Leer el archivo como Data URL (base64)
    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFileDataUrl(result);
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      alert('Error leyendo el archivo PDF local.');
      setIsReadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    let finalUrl = url;
    let finalFileName = selectedFileName;

    if (materialType === 'pdf' || materialType === 'guia') {
      if (uploadMode === 'file') {
        if (!fileDataUrl) {
          alert('Por favor seleccioná un archivo PDF de tu computadora.');
          return;
        }
        finalUrl = fileDataUrl;
      } else {
        if (!url) {
          alert('Por favor ingresá el enlace del archivo o video.');
          return;
        }
      }
    }

    addMaterial({
      title,
      description,
      material_type: materialType,
      url: finalUrl,
      file_name: finalFileName || 'guia.pdf',
      school,
      course,
      unit_number: 1,
      order_index: materials.length + 1,
      is_required: true,
      due_date: dueDate || undefined,
    });

    // Resetear formulario
    setTitle('');
    setDescription('');
    setUrl('');
    setSelectedFileName('');
    setSelectedFileSize('');
    setFileDataUrl('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-fredoka font-bold text-2xl sm:text-3xl text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-[#ffd166]" /> Carga de Contenidos & Guías de Estudio
          </h1>
          <p className="text-sm text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mt-1">
            Subí archivos PDF directo desde tu ordenador, videos o enlaces de Drive sincronizados con el campus del alumno.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ffd166] text-[#241a00] font-bold text-sm hover:bg-[#ffc83d] transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Subir Nuevo Material</span>
        </button>
      </div>

      {/* Grid de Materiales Cargados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map(mat => {
          const isPdf = mat.material_type === 'pdf' || mat.material_type === 'guia';
          const isVid = mat.material_type === 'video';

          return (
            <div
              key={mat.id}
              className="p-5 rounded-2xl bg-[#151c3d] [data-tema=dia]_&:bg-white border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] shadow-sm flex flex-col justify-between gap-4 group relative"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    isPdf 
                      ? 'bg-red-500/20 text-red-300' 
                      : isVid 
                        ? 'bg-blue-500/20 text-blue-300' 
                        : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {isPdf && <FileText className="w-3 h-3" />}
                    {isVid && <Video className="w-3 h-3" />}
                    {mat.material_type.toUpperCase()}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] font-semibold">
                      {mat.course}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar "${mat.title}"?`)) {
                          deleteMaterial(mat.id);
                        }
                      }}
                      className="p-1 text-[#9aa4d6] hover:text-red-400 opacity-60 group-hover:opacity-100 transition"
                      title="Eliminar este material"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-fredoka font-bold text-base text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] mt-2">
                  {mat.title}
                </h3>

                {mat.description && (
                  <p className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mt-1 line-clamp-3">
                    {mat.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#2a3568]/50 [data-tema=dia]_&:border-[#d3d9ef]/60 flex items-center justify-between">
                <span className="text-[11px] text-[#5eead4] [data-tema=dia]_&:text-[#0a5fb4] font-semibold">
                  Escuela: {mat.school}
                </span>

                {isPdf && mat.url && (
                  <button
                    onClick={() => setActivePdf({ url: mat.url, title: mat.title, fileName: mat.file_name })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5eead4]/20 text-[#5eead4] [data-tema=dia]_&:text-[#0f3a35] text-xs font-bold hover:bg-[#5eead4]/30 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver PDF</span>
                  </button>
                )}

                {isVid && mat.url && (
                  <a
                    href={mat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 text-xs font-bold hover:bg-blue-500/30 transition"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Ver Video</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {materials.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] bg-[#151c3d]/50">
          <BookOpen className="w-12 h-12 text-[#ffd166] mx-auto mb-3 opacity-60" />
          <h3 className="font-fredoka font-bold text-lg text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
            No hay materiales cargados todavía
          </h3>
          <p className="text-xs text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mt-1 max-w-md mx-auto">
            Pulsa el botón de abajo para cargar tu primera guía de estudio en PDF desde tu computadora o un video.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-5 py-2.5 bg-[#ffd166] text-[#241a00] text-xs font-bold rounded-xl hover:bg-[#ffc83d]"
          >
            ➕ Cargar mi primer PDF
          </button>
        </div>
      )}

      {/* Modal para agregar material */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#151c3d] [data-tema=dia]_&:bg-white rounded-3xl border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-fredoka font-bold text-lg text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] mb-4 flex items-center gap-2">
              <FileUp className="w-5 h-5 text-[#ffd166]" /> Cargar Material o Tarea
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                  Título del material o guía
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej: Guía de estudio: Los materiales y sus transformaciones"
                  className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] focus:outline-none focus:border-[#ffd166]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                    Tipo de contenido
                  </label>
                  <select
                    value={materialType}
                    onChange={e => setMaterialType(e.target.value as any)}
                    className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
                  >
                    <option value="pdf">Documento PDF</option>
                    <option value="video">Clase en Video (YouTube / Link)</option>
                    <option value="guia">Guía de lectura</option>
                    <option value="tarea">Trabajo Práctico con Entrega</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                    Curso destino
                  </label>
                  <select
                    value={course}
                    onChange={e => setCourse(e.target.value)}
                    className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
                  >
                    <option value="2° Año">2° Año · Educ. Tecnológica I</option>
                    <option value="3° Año">3° Año · Educ. Tecnológica II</option>
                    <option value="2° y 3° Año">2° y 3° Año (Mancopa)</option>
                    <option value="Todos">Todos los cursos</option>
                  </select>
                </div>
              </div>

              {/* Selector de modo: Subir desde PC o Pegar enlace */}
              {(materialType === 'pdf' || materialType === 'guia') && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f]">
                    ¿Cómo deseas cargar el PDF?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        uploadMode === 'file'
                          ? 'bg-[#5eead4]/20 border-[#5eead4] text-[#5eead4] [data-tema=dia]_&:text-[#0f3a35]'
                          : 'bg-[#0b1026] border-[#2a3568] text-[#9aa4d6] [data-tema=dia]_&:bg-[#f3f5fd] [data-tema=dia]_&:border-[#d3d9ef]'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Desde mi Ordenador (PC)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUploadMode('link')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        uploadMode === 'link'
                          ? 'bg-[#ffd166]/20 border-[#ffd166] text-[#ffd166] [data-tema=dia]_&:text-[#9a6400]'
                          : 'bg-[#0b1026] border-[#2a3568] text-[#9aa4d6] [data-tema=dia]_&:bg-[#f3f5fd] [data-tema=dia]_&:border-[#d3d9ef]'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Enlace (Drive / Web)</span>
                    </button>
                  </div>

                  {/* Input de archivo local desde la PC */}
                  {uploadMode === 'file' && (
                    <div className="p-4 rounded-xl border-2 border-dashed border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] text-center space-y-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="application/pdf,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {selectedFileName ? (
                        <div className="space-y-1">
                          <CheckCircle2 className="w-7 h-7 text-[#5eead4] mx-auto" />
                          <p className="font-bold text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150] truncate max-w-xs mx-auto">
                            📄 {selectedFileName}
                          </p>
                          <span className="text-[11px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] block">
                            Tamaño: {selectedFileSize}
                          </span>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-[#ffd166] underline hover:text-[#ffc83d] font-semibold"
                          >
                            Elegir otro archivo
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="cursor-pointer space-y-1 py-2"
                        >
                          <FileUp className="w-8 h-8 text-[#ffd166] mx-auto opacity-80" />
                          <p className="text-xs font-bold text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]">
                            Haz clic aquí para seleccionar el PDF de tu computadora
                          </p>
                          <span className="text-[10px] text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] block">
                            Formato .PDF (Máx. 25 MB)
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Input de link / drive */}
                  {uploadMode === 'link' && (
                    <div>
                      <input
                        type="url"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="https://drive.google.com/... o enlace del PDF"
                        className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Si es video o tarea, pedir URL */}
              {materialType === 'video' && (
                <div>
                  <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                    Enlace de YouTube o video explicativo
                  </label>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#9aa4d6] [data-tema=dia]_&:text-[#5a638f] mb-1">
                  Descripción o consigna para los chicos (opcional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Instrucciones para la lectura o la entrega..."
                  className="w-full bg-[#0b1026] [data-tema=dia]_&:bg-[#f3f5fd] border border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef] rounded-xl px-3 py-2 text-xs text-[#eef1ff] [data-tema=dia]_&:text-[#1b2150]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#2a3568] [data-tema=dia]_&:border-[#d3d9ef]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#9aa4d6] hover:bg-slate-800/40 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isReadingFile}
                  className="px-5 py-2 bg-[#ffd166] text-[#241a00] text-xs font-bold rounded-xl hover:bg-[#ffc83d] transition shadow disabled:opacity-50"
                >
                  {isReadingFile ? 'Procesando archivo...' : 'Guardar y Publicar Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visor PDF integrado con portal independiente */}
      <PdfViewerModal
        isOpen={Boolean(activePdf)}
        onClose={() => setActivePdf(null)}
        title={activePdf?.title || ''}
        pdfUrl={activePdf?.url || ''}
        fileName={activePdf?.fileName}
      />
    </div>
  );
}
