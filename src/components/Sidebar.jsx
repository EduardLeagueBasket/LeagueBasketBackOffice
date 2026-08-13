import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

const Sidebar = ({ onLogout, isCollapsed, onToggleCollapse }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  }
  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header d-flex align-items-center justify-content-between">
        <div className="sidebar-brand">
          <h5 className="text-white mb-0">Legue Basket</h5>
        </div>
        <button
          className="btn btn-link text-white p-0"
          onClick={onToggleCollapse}
        >
          <i className={`bi bi-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
        </button>
      </div>
      <nav className="sidebar-nav">
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink to="/" className="nav-link" end>
              <i className="bi bi-speedometer2 me-2"></i>
              {!isCollapsed && <span>Dashboard</span>}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/users" className="nav-link">
              <i className="bi bi-people me-2"></i>
              {!isCollapsed && <span>Usuarios</span>}
            </NavLink>
          </li>
          {(user?.profile?.name === 'SUPER_ADMIN' || user?.profile?.name === 'ADMIN') && (
            <>
              <li className="nav-item">
                <NavLink to="/countries" className="nav-link">
                  <i className="bi bi-geo-alt me-2"></i>
                  {!isCollapsed && <span>Países</span>}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/competitions" className="nav-link">
                  <i className="bi bi-trophy me-2"></i>
                  {!isCollapsed && <span>Competencias</span>}
                </NavLink>
              </li>
            </>
          )}
          {(user?.profile?.name === 'SUPER_ADMIN' ||
            user?.profile?.name === 'ADMIN' ||
            user?.profile?.name === 'MANAGER_LEAGUE' ||
            user?.profile?.name === 'ASISTANT_LEAGUE') && (
            <li className="nav-item">
              <NavLink to="/league-games" className="nav-link">
                <i className="bi bi-calendar2-week me-2"></i>
                {!isCollapsed && <span>Juegos de Liga</span>}
              </NavLink>
            </li>
          )}
          {(user?.profile?.name === 'SUPER_ADMIN' || user?.profile?.name === 'ADMIN') && (
            <>
              <li className="nav-item">
                <NavLink to="/nationals-teams" className="nav-link">
                  <i className="bi bi-flag me-2"></i>
                  {!isCollapsed && <span>Seleccion Nacional</span>}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/national-games" className="nav-link">
                  <i className="bi bi-calendar-event me-2"></i>
                  {!isCollapsed && <span>Juegos Nacionales</span>}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/seasons" className="nav-link">
                  <i className="bi bi-calendar-range me-2"></i>
                  {!isCollapsed && <span>Temporadas</span>}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/league-standings" className="nav-link">
                  <i className="bi bi-bar-chart-steps me-2"></i>
                  {!isCollapsed && <span>Tabla de posiciones</span>}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/retail/products" className="nav-link">
                  <i className="bi bi-bag me-2"></i>
                  {!isCollapsed && <span>Productos tienda</span>}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/retail/orders" className="nav-link">
                  <i className="bi bi-receipt me-2"></i>
                  {!isCollapsed && <span>Compras</span>}
                </NavLink>
              </li>
              <li className="nav-item mt-2">
                {!isCollapsed && <small className="text-white-50 px-3">BOLETOS</small>}
              </li>
              <li className="nav-item">
                <NavLink to="/tickets/venues" className="nav-link">
                  <i className="bi bi-building me-2"></i>
                  {!isCollapsed && <span>Canchas</span>}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/tickets/sections" className="nav-link">
                  <i className="bi bi-grid me-2"></i>
                  {!isCollapsed && <span>Secciones</span>}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/tickets/events" className="nav-link">
                  <i className="bi bi-calendar-event me-2"></i>
                  {!isCollapsed && <span>Eventos</span>}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/tickets/promotions" className="nav-link">
                  <i className="bi bi-tag me-2"></i>
                  {!isCollapsed && <span>Promociones</span>}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/tickets/list" className="nav-link">
                  <i className="bi bi-ticket-perforated me-2"></i>
                  {!isCollapsed && <span>Boletos</span>}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/tickets/orders" className="nav-link">
                  <i className="bi bi-cart me-2"></i>
                  {!isCollapsed && <span>Órdenes boletos</span>}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/tickets/raffles" className="nav-link">
                  <i className="bi bi-gift me-2"></i>
                  {!isCollapsed && <span>Sorteos</span>}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/tickets/points" className="nav-link">
                  <i className="bi bi-star me-2"></i>
                  {!isCollapsed && <span>Puntos</span>}
                </NavLink>
              </li>
            </>
          )}
          <li className="nav-item">
            <NavLink to="/teams" className="nav-link">
              <i className="bi bi-gear me-2"></i>
              {!isCollapsed && <span>Equipos</span>}
            </NavLink>
          </li>
          {
            (user?.profile?.name === 'SUPER_ADMIN' ||
              user?.profile?.name === 'ADMIN' ||
              user?.profile?.name === 'MANAGER_TEAM' ||
              user?.profile?.name === 'ASISTANT_TEAM' ||
              user?.profile?.name === 'MANAGER_NATIONAL_TEAM' ||
              user?.profile?.name === 'ASISTANT_NATIONAL_TEAM') && (
              <li className="nav-item">
                <NavLink to="/stories" className="nav-link">
                  <i className="bi bi-camera-reels me-2"></i>
                  {!isCollapsed && <span>Stories</span>}
                </NavLink>
              </li>
            )
          }
          {
            (user?.profile?.name === 'SUPER_ADMIN' ||
              user?.profile?.name === 'ADMIN') && (
              <li className="nav-item">
                <NavLink to="/publishers" className="nav-link">
                  <i className="bi bi-broadcast me-2"></i>
                  {!isCollapsed && <span>Publishers</span>}
                </NavLink>
              </li>
            )
          }
          {
            user.profile.name === 'MANAGER_TEAM' && (
              <li className="nav-item">
                <NavLink to="/league-games/manager" className="nav-link">
                  <i className="bi bi-calendar-plus me-2"></i>
                  {!isCollapsed && <span>Mis partidos</span>}
                </NavLink>
              </li>
            )
          }
          {
            user.profile.name === 'MANAGER_TEAM' && (
              <li className="nav-item">
                <NavLink to="/teams/manager" className="nav-link">
                  <i className="bi bi-gear me-2"></i>
                  {!isCollapsed && <span>Mi Equipo</span>}
                </NavLink>
              </li>
            )
          }
          {
            user.profile.name === 'MANAGER_NATIONAL_TEAM' && (
              <li className="nav-item">
                <NavLink to="/national-teams/manager" className="nav-link">
                  <i className="bi bi-gear me-2"></i>
                  {!isCollapsed && <span>Equipo Nacional</span>}
                </NavLink>
              </li>
            )
          }
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button
          className="btn btn-link text-white w-100 text-start"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 