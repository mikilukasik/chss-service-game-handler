import { getNextGameState } from "../../controllers/gameController";

export const makeComputerMoveHandler = [
  'makeComputerMove',
  async(data, comms) => {
    try {
      console.log('Making computer move..');
      const game = data.cmdArgs;
      const updateProgress = (progress) => comms.data({ progress });
      const nextGameState = await getNextGameState({ game, updateProgress });
      await comms.connection.do('updateGame', nextGameState);
      comms.send('OK');
    } catch (e) {
      comms.error(e.message);
    }
  },
];
