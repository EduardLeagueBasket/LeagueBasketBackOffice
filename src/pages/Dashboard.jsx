import React from 'react';
import { useSelector } from 'react-redux';
import '../styles/Dashboard.css';
import AdminHome from './dashboard/AdminHome';
import LeagueHome from './dashboard/LeagueHome';
import NationalHome from './dashboard/NationalHome';
import TeamHome from './dashboard/TeamHome';
import {
  DashboardHeader,
  QuickLinks,
} from './dashboard/DashboardShell';

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const profile = user?.profile?.name;

  let content = null;

  if (profile === 'SUPER_ADMIN' || profile === 'ADMIN') {
    content = <AdminHome user={user} />;
  } else if (profile === 'MANAGER_LEAGUE' || profile === 'ASISTANT_LEAGUE') {
    content = <LeagueHome user={user} />;
  } else if (profile === 'MANAGER_TEAM' || profile === 'ASISTANT_TEAM') {
    content = <TeamHome user={user} />;
  } else if (
    profile === 'MANAGER_NATIONAL_TEAM' ||
    profile === 'ASISTANT_NATIONAL_TEAM'
  ) {
    content = <NationalHome user={user} />;
  } else {
    content = (
      <>
        <DashboardHeader user={user} contextLabel="Panel" />
        <p className="text-muted">
          Bienvenido al panel. Usa el menú lateral para navegar.
        </p>
        <QuickLinks links={[{ to: '/users', label: 'Usuarios', icon: 'bi-people' }]} />
      </>
    );
  }

  return <div className="dashboard-container">{content}</div>;
};

export default Dashboard;
