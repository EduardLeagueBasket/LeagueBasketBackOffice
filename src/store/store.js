// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import usersReducer from './usersSlice';
import leaguesReducer from './league/getAllSlice';
import createLeagueReducer from './league/createLeagueSlice';
import countryReducer from './country/countrySlice';
import uploadLogoReducer from './uploads/uploadLogoSlice';
import managerLeagueReducer from './league/getLeagueSlice';
import teamReducer from './teams/getTeamSlice';
import createPlayerReducer from './player/createPlayerSlice';
import getPlayersReducer from './player/getPlayersSlice';
import createNationalTeamReducer from './nationalTeams/createNationalTeamSlice';
import getNationalTeamsReducer from './nationalTeams/getNationalTeamsSlice';
import updateNationalTeamReducer from './nationalTeams/updateNationalTeamSlice';
import getNationalTeamPlayersReducer from './player/getNationalTeamPlayersSlice';

export const store = configureStore({
  reducer: {
    // auth and users
    auth: authReducer,
    users: usersReducer,
    // countries
    countries: countryReducer,
    // uploads
    uploadLogo: uploadLogoReducer,
    // leagues
    managerLeague: managerLeagueReducer,
    leagues: leaguesReducer,
    createLeague: createLeagueReducer,
    // teams
    team: teamReducer,
    // players
    createPlayer: createPlayerReducer,
    getPlayers: getPlayersReducer,
    nationalTeamPlayers: getNationalTeamPlayersReducer,
    // national teams
    createNationalTeam: createNationalTeamReducer,
    nationalTeams: getNationalTeamsReducer,
    updateNationalTeam: updateNationalTeamReducer,
  },
});
