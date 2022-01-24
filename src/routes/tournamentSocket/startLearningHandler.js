import { getModelNames } from '../../services/tournamentService';
import { GameModel } from '../../../../chss-module-engine/src/model/Game';
import { createTournament } from '../../controllers/tournamentController';

// const getTournamentStats = ({ tournamentData }) => {};

export const startLearningHandler = [
  'startLearning',
  async ({ model } = {}, { send }) => {
    console.log({ model });
    await send('OK');
  },
];
