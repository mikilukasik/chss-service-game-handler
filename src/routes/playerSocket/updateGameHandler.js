import { getNextGameState } from "../../controllers/gameController";
import { getGame, updateGame } from "../../services/gameService";
import { getLoggedInUsersForClient } from "../../services/userService";

export const updateGameHandler = [
  'updateGame',
  async({ game, aiToRespond, userId }, comms) => {
    try {
      const clientId = comms.connection.cookies.get('CHSS_CLIENT_ID');
      const usersLoggedInOnClient = await getLoggedInUsersForClient({ clientId });

      const user = usersLoggedInOnClient.find(u => u.userId === userId);
      if (!user) return comms.error('User is not allowed to update this game');

      const userIdsLoggedInOnClient = usersLoggedInOnClient.map(user => user.userId);

      const previousGameState = await getGame({ id: game.id });
      const userIdThatCanUpdateGame = !previousGameState.completed && previousGameState.wNext
        ? previousGameState.wPlayer
        : previousGameState.bPlayer;

      if (userId !== userIdThatCanUpdateGame && !user.isAdmin) {
        comms.error('User is not allowed to update this game');
        return;
      }
 
      await updateGame(game);

      if (aiToRespond /* // TODO: if computerIsOpponent */) {
        const updateProgress = (progress) => comms.data({ progress });
        const nextGameState = await getNextGameState({ game, updateProgress });

        if (!nextGameState) return comms.send(null);

        const { stats } = nextGameState;
        if (stats) comms.connection.do('displayStats', stats);
      }
      
      comms.send('OK');
    } catch (e) {
      console.error(e);
      comms.error(`${e.message}\n${e.stack}`);
    }
  },
];
