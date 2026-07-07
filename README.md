# LicenseWatch

> ⚠️ **Trabajo en progreso (WIP)** — Funcionalidad principal implementada; backend de persistencia y autenticación en desarrollo.

**Dashboard React para gestión y monitoreo de licencias y permisos operacionales — organizado por País → Empresa → Estación → Licencia.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer-Motion-0055FF?style=flat-square&logo=framer&logoColor=white)](https://framer.com/motion)

---

## Descripción

LicenseWatch es una aplicación web para el seguimiento de licencias y permisos operacionales de empresas con presencia multinacional. Permite registrar países de operación, empresas, estaciones/aeropuertos (código IATA) y sus licencias asociadas, con alertas visuales por vencimiento próximo.

El sistema usa una jerarquía clara: **País → Empresa → Estación → Licencias**, y clasifica cada licencia automáticamente en:

- 🔴 **Critical** — vence en menos de 30 días
- 🟡 **Attention** — vence en 31–90 días
- 🟢 **Healthy** — vence en más de 90 días

---

## Funcionalidades implementadas

- Tabla de países con banderas (emoji por ISO), conteo de licencias y estado agregado
- Panel lateral deslizante con detalle por país (empresas → estaciones → licencias)
- CRUD completo: crear, editar y eliminar países, empresas, estaciones y licencias
- Búsqueda en tiempo real por nombre/código ISO
- Fechas de vencimiento con cálculo automático de días restantes
- Alertas configurables por número de días de anticipación
- Animaciones fluidas con Framer Motion
- Diseño dark mode con Tailwind CSS

---

## Stack tecnológico

| Categoría | Herramienta |
|-----------|-------------|
| Framework | React 19 |
| Build tool | Vite 8 |
| Estilos | Tailwind CSS 4 |
| Animaciones | Framer Motion |
| Íconos | Lucide React |
| Utilidades | clsx · tailwind-merge |

---

## Instalación

```bash
git clone https://github.com/ignacioperez1504/LicenseWatch.git
cd LicenseWatch

npm install
npm run dev
```

---

## Estado actual del proyecto

| Módulo | Estado |
|--------|--------|
| UI / Dashboard | ✅ Completo |
| CRUD País / Empresa / Estación / Licencia | ✅ Completo |
| Alertas por vencimiento | ✅ Completo |
| Búsqueda y filtrado | ✅ Completo |
| Persistencia (base de datos) | 🔄 En desarrollo |
| Autenticación de usuarios | 🔄 Pendiente |
| Notificaciones por correo/SMS | 🔄 Pendiente |
| API REST / Backend | 🔄 Pendiente |

---

## Roadmap

- [ ] Integrar Supabase como backend (auth + base de datos en tiempo real)
- [ ] Notificaciones automáticas por email al acercarse la fecha de vencimiento
- [ ] Exportación de reportes en PDF/Excel
- [ ] Historial de cambios por licencia
- [ ] Roles de usuario (admin / viewer)

---

## Contexto

Proyecto personal desarrollado para resolver una necesidad real de gestión de cumplimiento regulatorio en empresas con operaciones en múltiples países de América Latina.
