import {
  Home, Users, CalendarDays, Route, UsersRound, HeartHandshake, Flag, GraduationCap,
  Tent, Wallet, Building2, Cctv, Megaphone, FolderOpen, Settings, Sprout, Bell, Images,
} from "lucide-react";

export const MODULOS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/personas", label: "Personas", icon: Users },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/seguimiento", label: "Seguimiento", icon: Route },
  { href: "/equipos", label: "Equipos", icon: UsersRound },
  { href: "/promocion", label: "Promoción", icon: Sprout },
  { href: "/direccion-espiritual", label: "Dirección espiritual", icon: HeartHandshake },
  { href: "/apostolados", label: "Apostolados", icon: Flag },
  { href: "/formacion", label: "Formación", icon: GraduationCap },
  { href: "/retiros", label: "Retiros", icon: Tent },
  { href: "/economia", label: "Economía", icon: Wallet },
  { href: "/casa", label: "La casa", icon: Building2 },
  { href: "/camaras", label: "Cámaras", icon: Cctv },
  { href: "/comunicaciones", label: "Comunicaciones", icon: Megaphone },
  { href: "/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/albumes", label: "Álbumes", icon: Images },
  { href: "/documentos", label: "Documentos", icon: FolderOpen },
  { href: "/configuracion", label: "Configuración", icon: Settings },
] as const;
