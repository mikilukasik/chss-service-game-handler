import { getModelNames } from '../../services/tournamentService';
import { GameModel } from '../../../../chss-module-engine/src/model/Game';
import { createTournament } from '../../controllers/tournamentController';

// const getTournamentStats = ({ tournamentData }) => {};

export const startTournamentHandler = [
  'startTournament',
  async ({ aiPlayers, randomValue = 0, rounds = 1 } = {}, { connection, send }) => {
    const { games, tournamentData } = await createTournament({ aiPlayers, randomValue, rounds, connection });
    await connection.do('updateTournamentData', tournamentData);
    await send({ games });
  },
];
