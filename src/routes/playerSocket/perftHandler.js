import { getNextGameState } from "../../controllers/gameController";
import { perft } from "../../services/debugService";
import { getGame, updateGame } from "../../services/gameService";
import { getLoggedInUsersForClient } from "../../services/userService";

export const perftHandler = [
  'perft',
  async(data, comms) => {
    try {
      const updateProgress = (progress) => comms.data({ progress });
      comms.send(await perft({ data, updateProgress }));
    } catch (e) {
      console.error(e);
      comms.error(`${e.message}\n${e.stack}`);
    }
  },
];
