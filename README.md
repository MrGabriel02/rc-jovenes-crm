# Plataforma RC Jóvenes Barquisimeto

Panel de gestión de la sección de Jóvenes de Regnum Christi Barquisimeto. Es una PWA hecha con Next.js, pensada para correr gratis (Vercel Hobby o Firebase App Hosting) con Firebase y herramientas de Google.

> **Versión de demostración.** Todos los datos son simulados y generados de forma determinista en `src/lib/data/semilla.ts`. Ningún nombre ni número corresponde a personas reales. Las integraciones (Firestore, Calendar, Drive, Sheets, WhatsApp, Instagram) también están simuladas.

## Módulos

| Ruta | Módulo | Qué hace hoy |
|---|---|---|
| `/` | Inicio | KPIs, seguimiento del día, alertas y 6 gráficos de estadísticas |
| `/personas` | Personas | Base CRM con filtros, ficha con historial y revisión de duplicados |
| `/calendario` | Calendario | Actividades con cuenta regresiva y servidores |
| `/seguimiento` | Seguimiento | Tablero post retiro D0, D+2, D+4, D+7, D+12 y D+15 con mensajes de WhatsApp en un clic |
| `/equipos` | Equipos de reino | Asistencia a encuentros (móvil), alertas a 2 y 4 faltas seguidas |
| `/direccion-espiritual` | Dirección espiritual | Cobertura, confirmación de citas por el director, enlace y QR a la agenda de citas |
| `/apostolados` | Apostolados | Integrantes, formularios conectados y quiénes pasaron por cada uno |
| `/formacion` | Formación | Charla mensual, banco de ponentes y evaluación de formadores |
| `/retiros` | Retiros | Triduo y EE: menú, calculadora de compras, tareas e invitados |
| `/economia` | Economía | Ingresos y gastos en USD y Bs a tasa BCV, 10 % sobre la ganancia, abonos y custodios |
| `/casa` | La casa | Reservas con doble aprobación, coworking, cafetín, inventario, mantenimiento y limpieza |
| `/reservar` | Formulario público | Solicitud de reserva con choque de horarios y precio por bloque de 1,5 h |
| `/comunicaciones` | Comunicaciones | Estadísticas de Instagram de la sección y del director, plantillas |
| `/documentos` | Documentos | Repositorio (Google Drive) e informes mensuales |
| `/configuracion` | Configuración | Roles editables con matriz de permisos, tarifas y conexiones |

## Estructura

```
src/
  app/                 páginas (App Router), una carpeta por módulo
  components/          sidebar, UI base (ui.tsx), gráficos con Recharts (charts.tsx)
  lib/domain/          reglas de negocio puras, sin dependencias de UI (con pruebas)
  lib/data/semilla.ts  datos simulados deterministas
  lib/data/repo.ts     capa de consultas que usan las páginas
```

Las reglas de negocio están en `src/lib/domain` y se prueban en `reglas.test.ts`: pasos post retiro, faltas seguidas, alertas de DE, 10 % sobre la ganancia, duplicados por cédula/teléfono/nombre, tarifas y choques de reservas, y evaluación de formadores.

## Cómo correrlo

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 27 pruebas de reglas de negocio
npm run build      # build de producción
```

## Pasar de datos simulados a datos reales

1. Crear el proyecto de Firebase con la cuenta de la plataforma (plan Spark, gratis).
2. Reemplazar las funciones de `src/lib/data/repo.ts` por consultas a Firestore, sin tocar las páginas.
3. Archivos a Google Drive mientras no haya plan Blaze; migrar a Firebase Storage después.
4. Importar los Google Forms de cada apostolado con una cuenta de servicio (Sheets API) y deduplicar con `compararPersonas`.
5. Las credenciales van en variables de entorno del hosting, nunca en el repositorio.

## Despliegue (Vercel Hobby)

Usamos Vercel Hobby: es gratis, no pide tarjeta y soporta todo lo de Next.js 16 sin configuración extra. Firebase App Hosting no sirve por ahora porque exige el plan Blaze, que necesita tarjeta.

1. Entrar a https://vercel.com/new con la cuenta de GitHub que es dueña del repo.
2. Importar `rc-jovenes-crm`. Vercel detecta Next.js solo, así que no hay que tocar nada.
3. Cada push a `main` despliega a producción y cada pull request genera una URL de vista previa.

El workflow `.github/workflows/ci.yml` corre lint, pruebas y build en cada push y en cada pull request.
