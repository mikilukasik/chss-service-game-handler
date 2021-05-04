import { workersController } from '../controllers/workersController';
import { makeComputerMoveHandler } from './playerSocket/makeComputerMoveHandler';
import { newGameHandler } from './playerSocket/newGameHandler';

export const initRoutes = ({ msg }) => {
  const playerSocket = msg.ws('/playerSocket');
  playerSocket.on(...newGameHandler);
  playerSocket.on(...makeComputerMoveHandler);

  const workersSocket = msg.ws('/workersSocket');
  workersController.init({ workersSocket });
};
