import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/MainLayout.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const MainLayout = ({ onLogout }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const getPageTitle = (path) => {
    const titles = {
      '/': 'Dashboard',
      '/users': 'Usuarios',
      '/analytics': 'Analíticas',
      '/teams': 'Equipos',
      '/teams/add': 'Crear equipo',
      '/teams/manager': 'Mi equipo',
      '/nationals-teams': 'Selecciones Nacionales',
      '/nationals-teams/add': 'Agregar Equipo Nacional',
      '/nationals-teams/edit': 'Editar Equipo Nacional',
      '/national-games': 'Juegos Nacionales',
      '/national-games/add': 'Agregar Juego Nacional',
      '/national-games/edit': 'Editar Juego Nacional',
      '/league-games': 'Juegos de Liga',
      '/league-games/bulk': 'Carga masiva liga',
      '/league-games/manager': 'Mis partidos',
      '/stories': 'Stories',
      '/stories/add': 'Nueva story',
      '/publishers': 'Publishers',
      '/tickets/venues': 'Canchas',
      '/tickets/sections': 'Secciones',
      '/tickets/events': 'Eventos boletos',
      '/tickets/promotions': 'Promociones',
      '/tickets/list': 'Boletos',
      '/tickets/orders': 'Órdenes boletos',
      '/tickets/raffles': 'Sorteos',
      '/tickets/points': 'Puntos',
    };
    if (titles[path]) return titles[path];
    if (path.startsWith('/tickets/')) return 'Boletos';
    return 'Dashboard';
  };

  return (
    <div className="app-container">
      <Sidebar
        onLogout={onLogout}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Header
          currentPage={getPageTitle(location.pathname)}
        />

        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout; 