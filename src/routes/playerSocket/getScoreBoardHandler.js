import { getScoreBoard } from '../../services/scoreBoardService';

export const getScoreBoardHandler = [
  'getScoreBoard',
  async(noData, comms) => {
    const scoreBoard = await getScoreBoard();
    comms.send(scoreBoard);
  },
];
