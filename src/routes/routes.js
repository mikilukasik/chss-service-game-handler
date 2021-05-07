import { workersController } from '../controllers/workersController';
import { updateGameHandler } from './playerSocket/updateGameHandler';
import { getActiveGamesHandler } from './playerSocket/getActiveGamesHandler';
import { newGameHandler } from './playerSocket/newGameHandler';

let playerSocket;
const playerSocketAwaiters = [];

export const getPlayerSocket = () => new Promise(resolve => {
  if (playerSocket) return resolve(playerSocket);
  playerSocketAwaiters.push(resolve);
});

export const initRoutes = ({ msg }) => {
  playerSocket = msg.ws('/playerSocket');

  playerSocket.on(...newGameHandler);
  playerSocket.on(...updateGameHandler);
  playerSocket.on(...getActiveGamesHandler);

  playerSocketAwaiters.forEach(resolve => resolve(playerSocket))

  const workersSocket = msg.ws('/workersSocket');
  workersController.init({ workersSocket });
};
