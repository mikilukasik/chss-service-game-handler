import { getNextGameState } from "../../controllers/gameController";

export const updateGameHandler = [
  'updateGame',
  async(game, comms) => {
    try {
      const updateProgress = (progress) => comms.data({ progress });
      const { stats } = await getNextGameState({ game, updateProgress });
      if (stats) comms.connection.do('displayStats', stats);
      comms.send('OK');
    } catch (e) {
      console.error(e);
      comms.error(`${e.message}\n${e.stack}`);
    }
  },
];
