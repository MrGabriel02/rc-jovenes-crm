import { AvisoSimulado, Card, Grid, Kpi, PageHeader } from "@/components/ui";
import { db } from "@/lib/data/repo";
import { ALBUMES, CUENTA_ALBUMES } from "@/lib/data/avisos";
import { Albumes } from "./componentes";

export const metadata = { title: "Álbumes" };

export default function PaginaAlbumes() {
  return (
    <>
      <PageHeader title="Álbumes" description="Enlaces a las fotos de cada actividad en Drive o Google Fotos, generales y por apostolado." />
      <AvisoSimulado />
      <Grid min={180}>
        <Kpi label="Álbumes" value={ALBUMES.length} />
        <Kpi label="Fotos en total" value={ALBUMES.reduce((a, x) => a + x.fotos, 0).toLocaleString("es-VE")} />
        <Kpi label="Compartidos con la cuenta" value={ALBUMES.filter((a) => a.compartidoCon).length} note={CUENTA_ALBUMES} />
      </Grid>
      <Card>
        <Albumes inicial={ALBUMES} apostolados={db.apostolados.map((a) => a.nombre)} cuenta={CUENTA_ALBUMES} />
      </Card>
    </>
  );
}
