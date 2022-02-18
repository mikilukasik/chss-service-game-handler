import { workersController } from '../controllers/workersController';
import { updateGameHandler } from './playerSocket/updateGameHandler';
import { getGamesHandler } from './playerSocket/getGamesHandler';
import { newGameHandler } from './playerSocket/newGameHandler';
import { newCustomGameHandler } from './playerSocket/newCustomGameHandler';
import { getScoreBoardHandler } from './playerSocket/getScoreBoardHandler';
import { getGameHandler } from './playerSocket/getGameHandler';
import { perftHandler } from './playerSocket/perftHandler';
import { tournamentController } from '../controllers/tournamentController';

let playerSocket;
const playerSocketAwaiters = [];

export const getPlayerSocket = () =>
  new Promise((resolve) => {
    if (playerSocket) return resolve(playerSocket);
    playerSocketAwaiters.push(resolve);
  });

export const initRoutes = ({ msg }) => {
  playerSocket = msg.ws('/playerSocket');

  playerSocket.on(...newGameHandler);
  playerSocket.on(...newCustomGameHandler);
  playerSocket.on(...updateGameHandler);
  playerSocket.on(...perftHandler);
  playerSocket.on(...getGamesHandler);
  playerSocket.on(...getGameHandler);
  playerSocket.on(...getScoreBoardHandler);

  playerSocketAwaiters.forEach((resolve) => resolve(playerSocket));

  const workersSocket = msg.ws('/workersSocket');
  workersController.init({ workersSocket });

  const tournamentSocket = msg.ws('/tournamentSocket');
  tournamentController.init({ tournamentSocket, msg });
};
