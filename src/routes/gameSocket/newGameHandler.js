// import { GameModel } from 'chss-engine/src/model/Game';
import { GameModel } from '../../../../chss-engine/src/model/Game';

export const newGameHandler = [
  'newGame',
  (data, comms) => {
    console.log('Starting new game..');

    const game = new GameModel();
    comms.connection.do('updateGame', game).then(() => {
      comms.send('OK');
    }).catch(comms.error);
  },
];
