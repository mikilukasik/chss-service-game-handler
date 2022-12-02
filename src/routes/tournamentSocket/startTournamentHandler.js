import { createTournament } from '../../controllers/tournamentController';

export const startTournamentHandler = [
  'startTournament',
  async ({ aiPlayers, randomValue = 0, rounds = 1, fenSetName } = {}, { connection, send }) => {
    const { games, tournamentData } = await createTournament({
      aiPlayers,
      randomValue,
      rounds,
      connection,
      fenSetName,
    });
    await connection.do('updateTournamentData', tournamentData);
    await send({ games });
  },
];
