import { Suspense } from "react";
import { AvisoSimulado, Card, PageHeader, LinkButton } from "@/components/ui";
import { DOCUMENTOS } from "@/lib/data/documentos";
import { db, nombreArea } from "@/lib/data/repo";
import { ListaDocumentos } from "./lista";

export const metadata = { title: "Documentos" };

export default function Documentos() {
  return (
    <>
      <PageHeader title="Documentos" description="Los archivos viven en una carpeta de Google Drive de la sección y se enlazan a cada actividad, apostolado o persona." actions={<><LinkButton href="https://drive.google.com/drive/folders/1rbCxHNNKvcpGCvNWOkH9vmFyZYpQFt_8" external variant="secondary">Abrir carpeta de Drive</LinkButton><LinkButton href="#subir">Subir documento</LinkButton></>} />
      <AvisoSimulado />
      <Suspense>
        <ListaDocumentos documentos={DOCUMENTOS} areas={[{ id: "seccion", nombre: "Sección" }, ...db.apostolados.map((x) => ({ id: x.id, nombre: nombreArea(x.id) }))]} />
      </Suspense>
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
