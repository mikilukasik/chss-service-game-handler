import { getGame } from '../../services/gameService';

export const getGameHandler = [
  'getGame',
  async ({ id }, comms) => {
    const game = await getGame({ id });
    comms.send(game);
  },
];
