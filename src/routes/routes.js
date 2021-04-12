import { workersController } from '../controllers/workersController';
import { makeComputerMoveHandler } from './gameSocket/makeComputerMoveHandler';
import { newGameHandler } from './gameSocket/newGameHandler';

export const initRoutes = ({ msg }) => {
  const gameSocket = msg.ws('/gameSocket');
  gameSocket.on(...newGameHandler);
  gameSocket.on(...makeComputerMoveHandler);

  const workersSocket = msg.ws('/workersSocket');
  workersController.init({ workersSocket });
};
