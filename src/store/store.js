// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import usersReducer from './usersSlice';
import countryReducer from './country/countrySlice';
import uploadLogoReducer from './uploads/uploadLogoSlice';
import teamReducer from './teams/getTeamSlice';
import teamsListReducer from './teams/listTeamsSlice';
import createNationalTeamReducer from './nationalTeams/createNationalTeamSlice';
import getNationalTeamsReducer from './nationalTeams/getNationalTeamsSlice';
import updateNationalTeamReducer from './nationalTeams/updateNationalTeamSlice';
import createNationalGameReducer from './nationalGames/createNationalGameSlice';
import getNationalGamesReducer from './nationalGames/getNationalGamesSlice';
import updateNationalGameReducer from './nationalGames/updateNationalGameSlice';
import cancelNationalGameReducer from './nationalGames/cancelNationalGameSlice';
import catalogCountriesReducer from './catalogCountriesSlice';
import competitionsReducer from './competitionsSlice';
import retailProductsReducer from './retail/productsSlice';
import retailOrdersReducer from './retail/ordersSlice';
import retailCategoriesReducer from './retail/categoriesSlice';
import ticketVenuesReducer from './tickets/venuesSlice';
import ticketSectionsReducer from './tickets/sectionsSlice';
import ticketEventsReducer from './tickets/eventsSlice';
import ticketPromotionsReducer from './tickets/promotionsSlice';
import ticketsAdminReducer from './tickets/ticketsSlice';
import ticketOrdersReducer from './tickets/ordersSlice';
import ticketRafflesReducer from './tickets/rafflesSlice';
import ticketPointsReducer from './tickets/pointsSlice';
import leagueGamesReducer from './leagueGames/leagueGamesSlice';
import managerLeagueGamesReducer from './leagueGames/managerLeagueGamesSlice';
import seasonsReducer from './seasons/seasonsSlice';
import leagueStandingsReducer from './leagueStandings/leagueStandingsSlice';
import storiesReducer from './stories/storiesSlice';
import publishersReducer from './publishers/publishersSlice';
import articleCategoriesReducer from './articleCategories/articleCategoriesSlice';
import articlesReducer from './articles/articlesSlice';
import getMyNationalTeamReducer from './nationalTeams/getMyNationalTeamSlice';

export const store = configureStore({
  reducer: {
    // auth and users
    auth: authReducer,
    users: usersReducer,
    // countries
    countries: countryReducer,
    // uploads
    uploadLogo: uploadLogoReducer,
    // teams
    team: teamReducer,
    teamsList: teamsListReducer,
    // national teams
    createNationalTeam: createNationalTeamReducer,
    nationalTeams: getNationalTeamsReducer,
    updateNationalTeam: updateNationalTeamReducer,
    // national games
    createNationalGame: createNationalGameReducer,
    nationalGames: getNationalGamesReducer,
    updateNationalGame: updateNationalGameReducer,
    cancelNationalGame: cancelNationalGameReducer,

    // catalogs
    catalogCountries: catalogCountriesReducer,
    competitions: competitionsReducer,

    retailProducts: retailProductsReducer,
    retailOrders: retailOrdersReducer,
    retailCategories: retailCategoriesReducer,
    ticketVenues: ticketVenuesReducer,
    ticketSections: ticketSectionsReducer,
    ticketEvents: ticketEventsReducer,
    ticketPromotions: ticketPromotionsReducer,
    ticketsAdmin: ticketsAdminReducer,
    ticketOrders: ticketOrdersReducer,
    ticketRaffles: ticketRafflesReducer,
    ticketPoints: ticketPointsReducer,
    leagueGames: leagueGamesReducer,
    managerLeagueGames: managerLeagueGamesReducer,
    seasons: seasonsReducer,
    leagueStandings: leagueStandingsReducer,
    stories: storiesReducer,
    publishers: publishersReducer,
    articleCategories: articleCategoriesReducer,
    articles: articlesReducer,
    myNationalTeam: getMyNationalTeamReducer,
  },
});
