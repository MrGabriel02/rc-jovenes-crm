import { AvisoSimulado, PageHeader } from "@/components/ui";
import { HOY } from "@/lib/domain/fechas";
import { PanelFormacion, type Charla, type Ponente } from "./panel";

export const metadata = { title: "Formación" };

// Datos SIMULADOS: ningún ponente ni teléfono es real.
const PONENTES: Ponente[] = [
  { id: "pn1", nombre: "Andrea Colmenárez", telefono: "0414-000-1101", tema: "Afectividad y noviazgo", profesion: "Psicóloga" },
  { id: "pn2", nombre: "P. Rafael Mendoza", telefono: "0424-000-1102", tema: "Doctrina social de la Iglesia", profesion: "Sacerdote" },
  { id: "pn3", nombre: "Luis Escalona", telefono: "0412-000-1103", tema: "Biblia y lectio divina", profesion: "Teólogo" },
  { id: "pn4", nombre: "María Gabriela Pérez", telefono: "0416-000-1104", tema: "Vocación y discernimiento", profesion: "Consagrada" },
  { id: "pn5", nombre: "José Daniel Rivas", telefono: "0414-000-1105", tema: "Fe y trabajo", profesion: "Ingeniero y empresario" },
];
const CHARLAS: Charla[] = [
  { id: "c1", fecha: "2026-03-21", tema: "Doctrina social de la Iglesia", ponenteId: "pn2", asistentes: 34 },
  { id: "c2", fecha: "2026-04-18", tema: "Pascua: el sepulcro vacío", ponenteId: "pn3", asistentes: 41 },
  { id: "c3", fecha: "2026-05-16", tema: "Fe y trabajo", ponenteId: "pn5", asistentes: 29 },
  { id: "c4", fecha: "2026-06-13", tema: "Afectividad y noviazgo", ponenteId: "pn1", asistentes: 57 },
  { id: "c5", fecha: "2026-09-12", tema: "Lectio divina en la vida diaria", ponenteId: "pn3", asistentes: 38 },
  { id: "c6", fecha: "2026-10-17", tema: "Vocación y discernimiento", ponenteId: "pn4", asistentes: 46 },
  { id: "c7", fecha: "2026-11-15", tema: "Santidad en lo ordinario", ponenteId: null, asistentes: null },
  { id: "c8", fecha: "2026-12-12", tema: "Adviento: esperar con esperanza", ponenteId: "pn3", asistentes: null },
  { id: "c9", fecha: "2027-01-16", tema: "Propósitos con sentido", ponenteId: null, asistentes: null },
];
const TEMAS = [
  { tema: "Redes sociales y vida interior", votos: 12 }, { tema: "Finanzas personales con criterio cristiano", votos: 9 },
  { tema: "Cómo rezar el rosario sin distraerse", votos: 7 }, { tema: "Ciencia y fe", votos: 6 }, { tema: "Perdón y sanación", votos: 5 },
];

export default function Formacion() {
  return (
    <>
      <PageHeader title="Formación" description="Charla mensual con banco de ponentes, historial de temas y asistencia." />
      <AvisoSimulado />
      <PanelFormacion ponentesIni={PONENTES} charlasIni={CHARLAS} temasIni={TEMAS} hoy={HOY.toISOString().slice(0, 10)} />
    </>
  );
}
