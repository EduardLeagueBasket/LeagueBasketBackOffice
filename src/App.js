import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/users/Index';
//import Orders from './pages/Orders';
//import Analytics from './pages/Analytics';
//import Settings from './pages/Settings';
import AddUser from './pages/users/Add';
import EditUser from './pages/users/Edit';
import League from './pages/league/Index';
import CreateLeague from './pages/league/AddLeague';
import ForceChangePassword from './pages/password/ForceChangePassword';
import ManagerLeagueEdit from './pages/league/manager/LeagueEdit';
import Teams from './pages/teams/Index';
import AddTeam from './pages/teams/Add';
import ManagerTeamEdit from './pages/teams/manager/TeamEdit';
import Players from './pages/player/Index';
import PlayerCreate from './pages/player/Add';
import PlayersByType from './pages/player/PlayersByType';
import NationalTeams from './pages/nationalTeams/Index';
import AddNationalTeam from './pages/nationalTeams/Add';
import EditNationalTeam from './pages/nationalTeams/Edit';
import NationalGames from './pages/nationalGames/Index';
import AddNationalGame from './pages/nationalGames/Add';
import EditNationalGame from './pages/nationalGames/Edit';

const App = () => {
  const user = useSelector((state) => state.auth.user);
  const isLoggedIn = !!user;

  if (isLoggedIn && user.requiredChangePassword) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<ForceChangePassword />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/"
          element={isLoggedIn ? <MainLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/add" element={<AddUser />} />
          <Route path="users/:id" element={<EditUser />} />
          <Route path="league" element={<League />} />
          <Route path="league/add" element={<CreateLeague />} />
          <Route path="league/manager" element={<ManagerLeagueEdit />} />
          <Route path="teams" element={<Teams />} />
          <Route path="teams/add" element={<AddTeam />} />
          <Route path="teams/manager" element={<ManagerTeamEdit />} />
          <Route path="players" element={<Players />} />
          <Route path="players/add" element={<PlayerCreate />} />
          <Route path="players/type/:type" element={<PlayersByType />} />
          <Route path="nationals-teams" element={<NationalTeams />} />
          <Route path="nationals-teams/add" element={<AddNationalTeam />} />
          <Route path="nationals-teams/edit/:id" element={<EditNationalTeam />} />
          <Route path="national-games" element={<NationalGames />} />
          <Route path="national-games/add" element={<AddNationalGame />} />
          <Route path="national-games/edit/:id" element={<EditNationalGame />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
