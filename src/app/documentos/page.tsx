import { AvisoSimulado, Badge, Card, PageHeader, Table, LinkButton } from "@/components/ui";

export const metadata = { title: "Documentos" };

const DOCS = [
  { nombre: "Informe económico Triduo 2026", tipo: "Informe económico", area: "Sección", fecha: "2026-07-12" },
  { nombre: "Reporte de economía Ejercicios Espirituales 2026", tipo: "Informe económico", area: "Sección", fecha: "2026-02-25" },
  { nombre: "Minuta de consejo de sección (octubre)", tipo: "Minuta", area: "Sección", fecha: "2026-10-20" },
  { nombre: "Permiso Mega Misiones 2026", tipo: "Permiso", area: "Juventud y Familia Misionera", fecha: "2026-03-10" },
  { nombre: "Nombramientos ciclo 2025-2026", tipo: "Nombramiento", area: "Sección", fecha: "2025-09-15" },
  { nombre: "Horario Triduo 2026", tipo: "Logística", area: "Sección", fecha: "2026-06-28" },
  { nombre: "Lista de necesidades Mega Misiones", tipo: "Logística", area: "Juventud y Familia Misionera", fecha: "2026-03-01" },
];

export default function Documentos() {
  return (
    <>
      <PageHeader title="Documentos" description="Los archivos viven en una carpeta de Google Drive de la sección y se enlazan a cada actividad, apostolado o persona." actions={<><LinkButton href="#" variant="secondary">Abrir carpeta de Drive</LinkButton><LinkButton href="#">Subir documento</LinkButton></>} />
      <AvisoSimulado />
      <Card>
        <Table head={["Documento", "Tipo", "Área", "Fecha"]} minWidth={560}>
          {DOCS.map((d) => <tr key={d.nombre}><td className="font-semibold">{d.nombre}</td><td><Badge>{d.tipo}</Badge></td><td>{d.area}</td><td className="tabular-nums">{new Date(`${d.fecha}T12:00:00`).toLocaleDateString("es-VE")}</td></tr>)}
        </Table>
      </Card>
      <Card title="Informes que genera la plataforma" subtitle="Una vez al mes, para el director de sección y el director local">
        <ul className="list-disc pl-5 text-sm">
          <li>Informe económico mensual por apostolado y general, con el formato de la tabla del Triduo (Excel) y el reporte en Word.</li>
          <li>Informe de actividades del mes: participantes, servidores y seguimiento.</li>
          <li>Comparativo anual de la misma actividad (por ejemplo, Triduo 2025 frente a 2026).</li>
        </ul>
      </Card>
    </>
  );
}
