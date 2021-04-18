import { GameModel } from 'chss-engine/src/model/Game';
import { gameService } from '../../services/gameService';

export const newGameHandler = [
  'newGame',
  async(data, comms) => {
    console.log('Starting new game..');

    const game = new GameModel();
    await gameService.saveGame(game);
    await comms.connection.do('updateGame', game).then(() => {
      comms.send('OK');
    }).catch(comms.error);
  },
];
