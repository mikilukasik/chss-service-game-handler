import { getModelNames } from '../../services/tournamentService';
import uuid from 'uuid-random';
import { GameModel } from '../../../../chss-module-engine/src/model/Game';
import { recordTournamentGame } from '../../controllers/tournamentController';

export const tournamentGameFinishedHandler = [
  'tournamentGameFinished',
  async (game, comms) => {
    await recordTournamentGame({ game, connection: comms.connection });
    comms.send('OK');
  },
];
