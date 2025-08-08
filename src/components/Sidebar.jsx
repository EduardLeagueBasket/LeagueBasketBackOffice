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
          {
            user.profile.name === 'SUPER_ADMIN' && (
              <li className="nav-item">
                <NavLink to="/league" className="nav-link">
                  <i className="bi bi-globe2 me-2"></i>
                  {!isCollapsed && <span>Ligas</span>}
                </NavLink>
              </li>
            )
          }
          {
            user.profile.name === 'MANAGER_LEAGUE' && (
              <li className="nav-item">
                <NavLink to="/league/manager" className="nav-link">
                  <i className="bi bi-globe2 me-2"></i>
                  {!isCollapsed && <span>Gestionar liga</span>}
                </NavLink>
              </li>
            )
          }
          <li className="nav-item">
            <NavLink to="/nationals-teams" className="nav-link">
              <i className="bi bi-graph-up me-2"></i>
              {!isCollapsed && <span>Selecciones Nacionales</span>}
            </NavLink>
          </li>
          {
            user.profile.name === 'MANAGER_LEAGUE' && (
              <li className="nav-item">
                <NavLink to="/teams" className="nav-link">
                  <i className="bi bi-gear me-2"></i>
                  {!isCollapsed && <span>Equipos</span>}
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
          {
            (user.profile.name === 'MANAGER_NATIONAL_TEAM' || user.profile.name === 'MANAGER_TEAM') && (
              <li className="nav-item">
                <NavLink to="/players" className="nav-link">
                  <i className="bi bi-people me-2"></i>
                  {!isCollapsed && <span>Jugadores</span>}
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