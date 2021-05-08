import { getNextGameState } from "../../controllers/gameController";
import { getGame } from "../../services/gameService";
import { getLoggedInUsersForClient } from "../../services/userService";

export const updateGameHandler = [
  'updateGame',
  async(game, comms) => {
    try {
      const clientId = comms.connection.cookies.get('CHSS_CLIENT_ID');
      const usersLoggedInOnClient = await getLoggedInUsersForClient({ clientId });
      const userIdsLoggedInOnClient = usersLoggedInOnClient.map(user => user.userId);

      const previousGameState = await getGame({ id: game.id });
      const userIdThatCanUpdateGame = !previousGameState.completed && previousGameState.wNext
        ? previousGameState.wPlayer
        : previousGameState.bPlayer;

      if (!userIdsLoggedInOnClient.includes(userIdThatCanUpdateGame)) {
        comms.error('User is not allowed to update this game');
        return;
      }

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
