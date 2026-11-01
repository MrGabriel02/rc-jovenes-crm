import { AvisoSimulado, Badge, Card, Grid, PageHeader, Table } from "@/components/ui";
import { db } from "@/lib/data/repo";
import { MatrizRoles } from "./roles";

export const metadata = { title: "Configuración" };

const INTEGRACIONES = [
  { nombre: "Cuenta de la plataforma", detalle: "Gmail de la sección (cuenta de servicio de Google Cloud)", estado: "Por configurar" },
  { nombre: "Google Sheets (formularios)", detalle: "Cada apostolado comparte su hoja de respuestas con la cuenta de servicio", estado: "Simulado" },
  { nombre: "Google Calendar", detalle: "Agendas de citas de 3 directores y calendarios de reservas y actividades", estado: "Simulado" },
  { nombre: "Google Drive", detalle: "Comprobantes y documentos (sin tarjeta para Firebase Storage)", estado: "Por configurar" },
  { nombre: "Firebase (Auth, Firestore, notificaciones)", detalle: "Plan gratuito Spark", estado: "Por configurar" },
  { nombre: "WhatsApp Cloud API", detalle: "Número y cuenta de Meta Business disponibles; plantillas por aprobar", estado: "Por configurar" },
  { nombre: "Instagram Graph API", detalle: "Cuentas profesionales de la sección y del director", estado: "Por configurar" },
  { nombre: "Tasa BCV", detalle: "Lectura diaria con corrección manual", estado: "Simulado" },
];

export default function Configuracion() {
  return (
    <>
      <PageHeader title="Configuración" description="Roles y permisos por módulo, conexiones con Google y otros servicios." />
      <AvisoSimulado />
      <MatrizRoles roles={db.roles} />
      <Grid min={360}>
        <Card title="Integraciones">
          <ul className="flex flex-col gap-2 text-sm">
            {INTEGRACIONES.map((i) => (
              <li key={i.nombre} className="flex items-start justify-between gap-3 border-b border-border pb-2 last:border-0">
                <span className="flex flex-col"><strong>{i.nombre}</strong><span className="text-xs text-muted">{i.detalle}</span></span>
                <Badge tone={i.estado === "Simulado" ? "accent" : "warn"}>{i.estado}</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Formularios conectados" subtitle="Mapeo de columnas a campos estándar, una vez por formulario">
          <Table head={["Actividad", "Cuenta", "Última sincronización"]} minWidth={420}>
            {db.actividades.filter((a) => a.formularioConectado).map((a) => (
              <tr key={a.id}><td className="font-semibold">{a.nombre}</td><td>{a.formularioConectado!.cuentaPropietaria}</td><td>{a.formularioConectado!.ultimaSincronizacion ? new Date(a.formularioConectado!.ultimaSincronizacion).toLocaleString("es-VE") : "Nunca"}</td></tr>
            ))}
          </Table>
        </Card>
      </Grid>
    </>
  );
}
