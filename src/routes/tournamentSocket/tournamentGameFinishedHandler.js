import { recordTournamentGame } from '../../controllers/tournamentController';

export const tournamentGameFinishedHandler = [
  'tournamentGameFinished',
  async (game, comms) => {
    await recordTournamentGame({ game, connection: comms.connection });
    comms.send('OK');
  },
];
