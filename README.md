# 🚀 Campus Virtual & Centro Docente - Profe Núñez

Plataforma educativa integral para la gestión escolar, bitácora de horarios y campus virtual para alumnos de Educación Tecnológica. Desarrollada con **Next.js 14**, **React**, **Tailwind CSS**, y arquitectura con **Supabase**.

---

## 🌟 Características Principales

### 👨‍🏫 Panel del Docente
- **🗓️ Mi Semana y Horarios:** Cronograma semanal de clases con cálculo de horas y rutas de viaje desde Alderetes a escuelas de Tucumán.
- **📅 Calendario & Citas:** Tabla dinámica para agendar compromisos personales (dentista, trámites en Junta, etc.) con persistencia.
- **📋 Planificación Anual:** Herramienta para gestionar Ejes Temáticos, temas dictados, temas en curso y control de lo que falta dar.
- **📊 Dashboard de Alumnos:** Tabla dinámica con segmentación por Cuartiles pedagógicos (Q1 a Q4), gráficas de competencias, carga manual de alumnos sin correo y evaluación con rúbricas.
- **📚 Contenidos & PDFs:** Visor embebido de documentos PDF y subida de archivos directa desde el ordenador (con almacenamiento seguro en IndexedDB).
- **🚗 Bitácora de Viajes:** Estimación y registro de kilometraje semanal.

### 🎒 Campus del Alumno
- **Onboarding por Escuela:** Vinculación automática según la escuela seleccionada (Mons. Conrero, Reconquista, Mancopa, El Naranjo, Tafí Viejo, Timbó Nuevo).
- **Roadmap de Aprendizaje:** Checklist de lecturas y videos vistos.
- **Visor de PDF Integrado:** Lectura directa en pantalla sin descarga obligatoria.
- **Entrega de Trabajos Prácticos:** Envíos con devolución pedagógica y notas.
- **🎮 ¡Desafía al Profe!:** Trivia interactiva de preguntas que otorga puntos extra acumulables.

---

## 🛠️ Tecnologías

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React, Canvas Confetti.
- **Almacenamiento Local:** IndexedDB para PDFs pesados + LocalStorage protegido.
- **Backend & Base de Datos:** Supabase (PostgreSQL, Row Level Security, Auth con Google).

---

## 🚀 Instalación y Uso

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/devncarlos725/profe-carlos-plataforma.git
   cd profe-carlos-plataforma
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   Renombrar `.env.local.example` a `.env.local` y agregar tus claves de Supabase.

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Abrir [http://localhost:3000](http://localhost:3000).
