# Plataforma RC Jóvenes Barquisimeto

Panel de gestión de la sección de Jóvenes de Regnum Christi Barquisimeto. Es una PWA hecha con Next.js, pensada para correr gratis (Vercel Hobby o Firebase App Hosting) con Firebase y herramientas de Google.

> **Versión de demostración.** Todos los datos son simulados y generados de forma determinista en `src/lib/data/semilla.ts`. Ningún nombre ni número corresponde a personas reales. Las integraciones (Firestore, Calendar, Drive, Sheets, WhatsApp, Instagram) también están simuladas.

## Módulos

| Ruta | Módulo | Qué hace hoy |
|---|---|---|
| `/` | Inicio | Día litúrgico y frase del día, novedades, avance de los requisitos del P. Elías, KPIs, "Hoy toca", cumpleaños de formadores, gráficos, la casa y las cámaras |
| `/personas` | Personas | Base CRM con filtros por retiro, género, edad y profesión; edad automática; respuestas del formulario CRM; enlace de actualización; formularios sincronizados y datos faltantes |
| `/calendario` | Calendario | Actividades, reservas, misas y fiestas litúrgicas con filtros, hora eucarística del primer jueves, cuenta regresiva y formulario para añadir actividad (revisa choques con la capilla) |
| `/seguimiento` | Seguimiento | Tablero post retiro D0 a D+15 con WhatsApp en un clic, tasas de respuesta y rechazo, barra por paso y archivo de retiros completados |
| `/equipos` | Equipos | Panel por ciudad, eventos por tipo, comparación de equipos, lista de espera con sugerencia de equipo, retirados y foráneos; ficha del equipo con info para el responsable, asistencia, integrantes, foto e inquietudes |
| `/promocion` | Promoción | Directorio de colegios, parroquias y otros; embajadores por promoción y de parroquia (Samuel y Emaús); envío de flyer; grupos de voluntarios y sugerencias |
| `/direccion-espiritual` | Dirección espiritual | DE y diálogo apostólico: semana por director, "ver como" (cada director ve solo lo suyo), mensaje para confirmar las citas del día, aviso de citas sin marcar, dirigidos por director, enlaces y QR, alta de directores con Google Calendar |
| `/apostolados` | Apostolados | Página por apostolado con logo, formularios y tablas, próximos retiros con cuenta regresiva, retiros por ciudad, servidores por retiro, retención, economía por retiro (comparación y mínimo para no perder), documentos e integrantes |
| `/formacion` | Formación | Charlas en orden cronológico y banco de ponentes (agregar, editar y eliminar), historial, asistencia por charla y temas de interés |
| `/retiros` | Retiros | Triduo y EE por año o en general: formulario conectado y sincronización, seguimiento de invitados (hoja Asociaciones), acta de asociación, formadores por invitar, pagos en Bs y $, generador del formulario, proveedores, menú editable con lista de compras por tipo de alimento y tareas exportables |
| `/economia` | Economía | Ingresos y gastos en USD y Bs a tasa BCV, 10 % sobre la ganancia, abonos, custodios e informes económicos por apostolado (pendientes a los 7 días del retiro) |
| `/casa` | La casa | Mapa interactivo de los 3 niveles, horario de misas y adoración que bloquea la capilla, reservas con doble aprobación, coworking, cafetín, inventario, mantenimiento y limpieza |
| `/camaras` | Cámaras | Las 4 cámaras YI Home 1080p (jardín, área común y terraza), estado de las microSD, eventos y guía de conexión |
| `/formador` | App de formadores | Inicio limpio para el formador: carta del día, su apostolado, próximos retiros, recordatorios de reuniones y calendario |
| `/inscripcion` | Inscripción pública | Formulario para entrar a la base o a una actividad, desde el enlace de Configuración |
| `/reservar` | Formulario público | Solicitud de reserva con choque de horarios y precio por bloque de 1,5 h |
| `/comunicaciones` | Comunicaciones | Estadísticas de Instagram de la sección y del director, plantillas |
| `/notificaciones` | Notificaciones | Avisos a todos, un rol, un equipo, un apostolado o personas; por app, WhatsApp o correo; al momento o programados |
| `/albumes` | Álbumes | Enlaces de Drive y Google Fotos por apostolado y actividad, y los compartidos con la cuenta de la sección |
| `/documentos` | Documentos | Repositorio (Google Drive) e informes mensuales |
| `/configuracion` | Configuración | Enlace e QR de inscripción, acceso a la app de formadores, roles editables con matriz de permisos y conexiones |

## Imágenes de las fiestas

En solemnidades, fiestas y patronos RC, el inicio cambia la imagen de Cristo por la de la fiesta si existe `public/marca/fiestas/<clave>.jpg` (las claves están en `src/lib/domain/liturgia.ts`, por ejemplo `todos-los-santos`, `cristo-rey`, `inmaculada`, `guadalupe`, `divina-pastora`).

## Estructura

```
src/
  app/                 páginas (App Router), una carpeta por módulo
  components/          sidebar, UI base (ui.tsx), gráficos con Recharts (charts.tsx)
  lib/domain/          reglas de negocio puras, sin dependencias de UI (con pruebas)
  lib/data/semilla.ts  datos simulados deterministas
  lib/data/repo.ts     capa de consultas que usan las páginas
```

Las reglas de negocio están en `src/lib/domain` y se prueban en `reglas.test.ts` y `liturgia.test.ts` (calendario litúrgico, horario de misas, edad y cumpleaños): pasos post retiro, faltas seguidas, alertas de DE, 10 % sobre la ganancia, duplicados por cédula/teléfono/nombre, tarifas y choques de reservas, y evaluación de formadores.

## Cómo correrlo

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 40 pruebas de reglas de negocio
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
