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
import ForceChangePassword from './pages/password/ForceChangePassword';
import Teams from './pages/teams/Index';
import AddTeam from './pages/teams/Add';
import EditTeam from './pages/teams/Edit';
import ManagerTeamEdit from './pages/teams/manager/TeamEdit';
import NationalTeams from './pages/nationalTeams/Index';
import AddNationalTeam from './pages/nationalTeams/Add';
import EditNationalTeam from './pages/nationalTeams/Edit';
import NationalTeamManagerHome from './pages/nationalTeams/Manager';
import NationalGames from './pages/nationalGames/Index';
import AddNationalGame from './pages/nationalGames/Add';
import EditNationalGame from './pages/nationalGames/Edit';
import CountriesIndex from './pages/countries/Index';
import CountryAdd from './pages/countries/Add';
import CompetitionsIndex from './pages/competitions/Index';
import CompetitionAdd from './pages/competitions/Add';
import CompetitionEdit from './pages/competitions/Edit';
import RetailProductsIndex from './pages/retail/products/Index';
import RetailProductAdd from './pages/retail/products/Add';
import RetailProductEdit from './pages/retail/products/Edit';
import RetailOrdersIndex from './pages/retail/orders/Index';
import RetailOrderDetail from './pages/retail/orders/Detail';
import TicketVenuesIndex from './pages/tickets/venues/Index';
import TicketVenueAdd from './pages/tickets/venues/Add';
import TicketVenueEdit from './pages/tickets/venues/Edit';
import TicketSectionsIndex from './pages/tickets/sections/Index';
import TicketSectionAdd from './pages/tickets/sections/Add';
import TicketSectionEdit from './pages/tickets/sections/Edit';
import TicketEventsIndex from './pages/tickets/events/Index';
import TicketEventAdd from './pages/tickets/events/Add';
import TicketEventEdit from './pages/tickets/events/Edit';
import TicketEventSections from './pages/tickets/events/Sections';
import TicketPromotionsIndex from './pages/tickets/promotions/Index';
import TicketPromotionAdd from './pages/tickets/promotions/Add';
import TicketPromotionEdit from './pages/tickets/promotions/Edit';
import TicketsListIndex from './pages/tickets/tickets/Index';
import TicketAssign from './pages/tickets/tickets/Assign';
import TicketTaquilla from './pages/tickets/tickets/Taquilla';
import TicketOrdersIndex from './pages/tickets/orders/Index';
import TicketOrderDetail from './pages/tickets/orders/Detail';
import TicketRafflesIndex from './pages/tickets/raffles/Index';
import TicketRaffleDetail from './pages/tickets/raffles/Detail';
import TicketPointsIndex from './pages/tickets/points/Index';
import LeagueGamesIndex from './pages/leagueGames/Index';
import LeagueGamesBulkAdd from './pages/leagueGames/BulkAdd';
import ManagerLeagueGameAdd from './pages/leagueGames/ManagerAdd';
import SeasonsIndex from './pages/seasons/Index';
import SeasonAdd from './pages/seasons/Add';
import SeasonDetail from './pages/seasons/Detail';
import LeagueStandingsIndex from './pages/leagueStandings/Index';
import StoriesIndex from './pages/stories/Index';
import StoriesAdd from './pages/stories/Add';
import PublishersIndex from './pages/publishers/Index';
import ArticleCategoriesIndex from './pages/articleCategories/Index';
import ArticlesIndex from './pages/articles/Index';
import ArticlesAdd from './pages/articles/Add';
import TitleManager from './components/TitleManager';

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
      <TitleManager />
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
          <Route path="teams" element={<Teams />} />
          <Route path="teams/add" element={<AddTeam />} />
          <Route path="teams/edit/:id" element={<EditTeam />} />
          <Route path="teams/manager" element={<ManagerTeamEdit />} />
          <Route path="nationals-teams" element={<NationalTeams />} />
          <Route path="nationals-teams/add" element={<AddNationalTeam />} />
          <Route path="nationals-teams/edit/:id" element={<EditNationalTeam />} />
          <Route path="national-teams/manager" element={<NationalTeamManagerHome />} />
          <Route path="national-games" element={<NationalGames />} />
          <Route path="national-games/add" element={<AddNationalGame />} />
          <Route path="national-games/edit/:id" element={<EditNationalGame />} />
          <Route path="countries" element={<CountriesIndex />} />
          <Route path="countries/add" element={<CountryAdd />} />
          <Route path="competitions" element={<CompetitionsIndex />} />
          <Route path="competitions/add" element={<CompetitionAdd />} />
          <Route path="competitions/edit/:id" element={<CompetitionEdit />} />
          <Route path="retail/products" element={<RetailProductsIndex />} />
          <Route path="retail/products/add" element={<RetailProductAdd />} />
          <Route
            path="retail/products/edit/:id"
            element={<RetailProductEdit />}
          />
          <Route path="retail/orders" element={<RetailOrdersIndex />} />
          <Route path="retail/orders/:id" element={<RetailOrderDetail />} />
          <Route path="league-games" element={<LeagueGamesIndex />} />
          <Route path="league-games/bulk" element={<LeagueGamesBulkAdd />} />
          <Route path="league-games/manager" element={<ManagerLeagueGameAdd />} />
          <Route path="seasons" element={<SeasonsIndex />} />
          <Route path="seasons/add" element={<SeasonAdd />} />
          <Route path="seasons/:id" element={<SeasonDetail />} />
          <Route path="league-standings" element={<LeagueStandingsIndex />} />
          <Route path="stories" element={<StoriesIndex />} />
          <Route path="stories/add" element={<StoriesAdd />} />
          <Route path="publishers" element={<PublishersIndex />} />
          <Route path="article-categories" element={<ArticleCategoriesIndex />} />
          <Route path="articles" element={<ArticlesIndex />} />
          <Route path="articles/add" element={<ArticlesAdd />} />
          <Route path="tickets/venues" element={<TicketVenuesIndex />} />
          <Route path="tickets/venues/add" element={<TicketVenueAdd />} />
          <Route path="tickets/venues/edit/:id" element={<TicketVenueEdit />} />
          <Route path="tickets/sections" element={<TicketSectionsIndex />} />
          <Route path="tickets/sections/add" element={<TicketSectionAdd />} />
          <Route path="tickets/sections/edit/:id" element={<TicketSectionEdit />} />
          <Route path="tickets/events" element={<TicketEventsIndex />} />
          <Route path="tickets/events/add" element={<TicketEventAdd />} />
          <Route path="tickets/events/edit/:id" element={<TicketEventEdit />} />
          <Route path="tickets/events/:id/sections" element={<TicketEventSections />} />
          <Route path="tickets/promotions" element={<TicketPromotionsIndex />} />
          <Route path="tickets/promotions/add" element={<TicketPromotionAdd />} />
          <Route path="tickets/promotions/edit/:id" element={<TicketPromotionEdit />} />
          <Route path="tickets/list" element={<TicketsListIndex />} />
          <Route path="tickets/assign" element={<TicketAssign />} />
          <Route path="tickets/taquilla" element={<TicketTaquilla />} />
          <Route path="tickets/orders" element={<TicketOrdersIndex />} />
          <Route path="tickets/orders/:id" element={<TicketOrderDetail />} />
          <Route path="tickets/raffles" element={<TicketRafflesIndex />} />
          <Route path="tickets/raffles/:id" element={<TicketRaffleDetail />} />
          <Route path="tickets/points" element={<TicketPointsIndex />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
