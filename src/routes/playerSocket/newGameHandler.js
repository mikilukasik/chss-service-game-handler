import { createGame } from '../../services/gameService';

export const newGameHandler = [
  'newGame',
  async(data, comms) => {
    const game = await createGame();
    await comms.connection.do('updateGame', game).then(() => {
      comms.send('OK');
    }).catch(comms.error);
  },
];
