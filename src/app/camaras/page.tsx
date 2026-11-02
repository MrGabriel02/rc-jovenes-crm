import { AlertTriangle, Cctv, HardDrive, Wifi } from "lucide-react";
import { AvisoSimulado, Badge, Card, Grid, Kpi, PageHeader, Table } from "@/components/ui";
import { CAMARAS, EVENTOS_CAMARAS, MODELO_CAMARA, fueraDeHorario, porcentajeSD, HORARIO_CASA } from "@/lib/data/camaras";
import { PanelCamaras } from "./panel";

export const metadata = { title: "Cámaras" };

const AHORA = "2026-11-01T09:00:00";

export default function Camaras() {
  const enLinea = CAMARAS.filter((c) => c.estado === "en_linea").length;
  const caidas = CAMARAS.filter((c) => c.estado === "sin_conexion");
  const sdLlenas = CAMARAS.filter((c) => porcentajeSD(c) >= 90);
  const fuera = EVENTOS_CAMARAS.filter((e) => fueraDeHorario(e.fecha));
  const nombre = (id: string) => CAMARAS.find((c) => c.id === id)?.nombre ?? id;

  return (
    <>
      <PageHeader
        title="Cámaras de seguridad"
        description={`${CAMARAS.length} cámaras ${MODELO_CAMARA.modelo} (${MODELO_CAMARA.codigo}) con grabación en tarjeta microSD. Toca una para verla en grande.`}
      />
      <AvisoSimulado />

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(190px, 100%), 1fr))" }}>
        <Kpi icon={<Wifi size={16} />} label="En línea" value={`${enLinea} de ${CAMARAS.length}`} note="Transmitiendo en vivo" />
        <Kpi icon={<Cctv size={16} />} label="Sin conexión" value={caidas.length} tone={caidas.length ? "warn" : "good"} note={caidas.map((c) => c.nombre).join(", ") || "Todas responden"} />
        <Kpi icon={<HardDrive size={16} />} label="Tarjetas casi llenas" value={sdLlenas.length} tone={sdLlenas.length ? "warn" : "good"} note={sdLlenas.map((c) => c.nombre).join(", ") || "Con espacio"} />
        <Kpi icon={<AlertTriangle size={16} />} label="Movimiento fuera de horario" value={fuera.length} tone={fuera.length ? "warn" : "good"} note={`Casa abierta de ${HORARIO_CASA.abre}:00 a ${HORARIO_CASA.cierra}:00`} />
      </div>

      <PanelCamaras camaras={CAMARAS} ahora={AHORA} />

      <Grid min={380}>
        <Card title="Eventos recientes" subtitle="Movimiento, desconexiones y estado de las tarjetas">
          <Table head={["Fecha", "Cámara", "Evento"]} minWidth={480}>
            {[...EVENTOS_CAMARAS].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((e) => (
              <tr key={e.camaraId + e.fecha}>
                <td className="whitespace-nowrap tabular-nums">{new Date(e.fecha).toLocaleString("es-VE", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</td>
                <td className="font-semibold">{nombre(e.camaraId)}</td>
                <td className="flex flex-wrap items-center gap-2">
                  <Badge tone={e.tipo === "Movimiento" ? "neutral" : "warn"}>{e.tipo}</Badge>
                  <span className="text-xs text-ink-2">{e.detalle}</span>
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card title="Cómo se conectan" subtitle="Lo que hace falta para pasar de la demo a las cámaras reales">
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li>Las YI Home 1080p no traen RTSP ni ONVIF de fábrica: por defecto solo se ven en la app YI Home. Para verlas en la plataforma hay dos caminos.</li>
            <li><strong>Sin modificar las cámaras:</strong> se sigue usando la app YI Home (compartida con los encargados) y la plataforma registra eventos, el estado de las tarjetas y las revisiones. No hay video dentro de la plataforma.</li>
            <li><strong>Con video en la plataforma:</strong> instalar en cada cámara el firmware comunitario yi-hack, que agrega RTSP y acceso a la microSD por red. Antes hay que confirmar que es compatible con la versión exacta de hardware, y se pierde la garantía.</li>
            <li>Un equipo encendido en la casa (una PC vieja o una Raspberry Pi) corre go2rtc o MediaMTX y convierte el RTSP a WebRTC o HLS, que se puede ver en el navegador.</li>
            <li>Un túnel gratuito de Cloudflare publica ese video sin abrir puertos del router. La plataforma lo muestra solo a los roles con permiso de Cámaras.</li>
          </ol>
        </Card>

        <Card title="Privacidad" subtitle="Reglas para grabar en una casa con menores de edad">
          <ul className="list-disc space-y-2 pl-5 text-sm">
            <li>No se instalan cámaras en baños, vestidores ni salones de dirección espiritual.</li>
            <li>Un aviso visible en la entrada indica que hay videovigilancia.</li>
            <li>Solo el administrador, los directores de sección y el encargado de mantenimiento ven las cámaras, y queda registro de cada acceso.</li>
            <li>Las grabaciones duran lo que alcance la microSD (unos 10 a 14 días) y solo se extraen si hay un incidente.</li>
          </ul>
        </Card>
      </Grid>
    </>
  );
}
