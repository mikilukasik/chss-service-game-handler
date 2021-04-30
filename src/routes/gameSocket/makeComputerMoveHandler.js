import { getNextGameState } from "../../controllers/gameController";

export const makeComputerMoveHandler = [
  'makeComputerMove',
  async(game, comms) => {
    try {
      console.log('Making computer move..');
      const updateProgress = (progress) => comms.data({ progress });
      const { nextGameState, stats } = await getNextGameState({ game, updateProgress });
      comms.connection.do('displayStats', stats);
      await comms.connection.do('updateGame', nextGameState);
      comms.send('OK');
    } catch (e) {
      comms.error(`${e.message}\n${e.stack}`);
    }
  },
];
