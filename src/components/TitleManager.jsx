import { useEffect } from "react";
import { useLocation, matchPath } from "react-router-dom";

const BASE = "League basket";

const routes = [
  // Auth / especiales
  ["/login", `Login | ${BASE}`],

  // Users
  ["/users/add", `Añadir usuario | ${BASE}`],
  ["/users/:id", `Editar usuario | ${BASE}`],
  ["/users", `Usuarios | ${BASE}`],

  // Teams
  ["/teams/add", `Añadir equipo | ${BASE}`],
  ["/teams/edit/:id", `Editar equipo | ${BASE}`],
  ["/teams/manager", `Manager de equipos | ${BASE}`],
  ["/teams", `Equipos | ${BASE}`],

  // National Teams
  ["/nationals-teams/add", `Añadir selección | ${BASE}`],
  ["/nationals-teams/edit/:id", `Editar selección | ${BASE}`],
  ["/nationals-teams", `Selecciones | ${BASE}`],
  ["/national-teams/manager", `Manager de selecciones | ${BASE}`],

  // National Games
  ["/national-games/add", `Añadir partido (selecciones) | ${BASE}`],
  ["/national-games/edit/:id", `Editar partido (selecciones) | ${BASE}`],
  ["/national-games", `Partidos (selecciones) | ${BASE}`],

  // Countries
  ["/countries/add", `Añadir país | ${BASE}`],
  ["/countries", `Países | ${BASE}`],

  // Competitions
  ["/competitions/add", `Añadir competición | ${BASE}`],
  ["/competitions/edit/:id", `Editar competición | ${BASE}`],
  ["/competitions", `Competiciones | ${BASE}`],

  // Retail
  ["/retail/products/add", `Añadir producto (Retail) | ${BASE}`],
  ["/retail/products/edit/:id", `Editar producto (Retail) | ${BASE}`],
  ["/retail/products", `Productos (Retail) | ${BASE}`],
  ["/retail/orders/:id", `Detalle pedido (Retail) | ${BASE}`],
  ["/retail/orders", `Pedidos (Retail) | ${BASE}`],

  // League Games
  ["/league-games/bulk", `Carga masiva de partidos | ${BASE}`],
  ["/league-games/manager", `Manager de partidos | ${BASE}`],
  ["/league-games", `Partidos | ${BASE}`],

  // Seasons
  ["/seasons/add", `Añadir temporada | ${BASE}`],
  ["/seasons/:id", `Detalle de temporada | ${BASE}`],
  ["/seasons", `Temporadas | ${BASE}`],

  // Standings
  ["/league-standings", `Clasificación | ${BASE}`],

  // Stories
  ["/stories/add", `Añadir historia | ${BASE}`],
  ["/stories", `Historias | ${BASE}`],

  // Publishers
  ["/publishers", `Publishers | ${BASE}`],

  // Article categories
  ["/article-categories", `Categorías de artículos | ${BASE}`],

  // Articles
  ["/articles/add", `Añadir artículo | ${BASE}`],
  ["/articles", `Artículos | ${BASE}`],

  // Tickets - Venues
  ["/tickets/venues/add", `Añadir recinto | ${BASE}`],
  ["/tickets/venues/edit/:id", `Editar recinto | ${BASE}`],
  ["/tickets/venues", `Recintos | ${BASE}`],

  // Tickets - Sections
  ["/tickets/sections/add", `Añadir sección | ${BASE}`],
  ["/tickets/sections/edit/:id", `Editar sección | ${BASE}`],
  ["/tickets/sections", `Secciones | ${BASE}`],

  // Tickets - Events
  ["/tickets/events/:id/sections", `Secciones del evento | ${BASE}`],
  ["/tickets/events/add", `Añadir evento | ${BASE}`],
  ["/tickets/events/edit/:id", `Editar evento | ${BASE}`],
  ["/tickets/events", `Eventos | ${BASE}`],

  // Tickets - Promotions
  ["/tickets/promotions/add", `Añadir promoción | ${BASE}`],
  ["/tickets/promotions/edit/:id", `Editar promoción | ${BASE}`],
  ["/tickets/promotions", `Promociones | ${BASE}`],

  // Tickets - Tickets list / assign / taquilla
  ["/tickets/list", `Entradas | ${BASE}`],
  ["/tickets/assign", `Asignar entradas | ${BASE}`],
  ["/tickets/taquilla", `Taquilla | ${BASE}`],

  // Tickets - Orders
  ["/tickets/orders/:id", `Detalle pedido (Tickets) | ${BASE}`],
  ["/tickets/orders", `Pedidos (Tickets) | ${BASE}`],

  // Tickets - Raffles
  ["/tickets/raffles/:id", `Detalle sorteo | ${BASE}`],
  ["/tickets/raffles", `Sorteos | ${BASE}`],

  // Tickets - Points
  ["/tickets/points", `Puntos | ${BASE}`],

  // Home
  ["/", `BackOffice | ${BASE}`],
];

function getTitle(pathname) {
  for (const [path, title] of routes) {
    if (matchPath({ path, end: true }, pathname)) return title;
  }
  return `BackOffice | ${BASE}`;
}

export default function TitleManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = getTitle(pathname);
  }, [pathname]);

  return null;
}