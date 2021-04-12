// import { GameModel } from 'chss-engine/src/model/Game';
// import { GameModel } from '../../../../chss-engine/src/model/Game';

export const makeComputerMoveHandler = [
  'makeComputerMove',
  (data, comms) => {
    console.log('Making computer move..');

    // comms.connection.do('updateGame', game).then(() => {
    //   comms.send('OK');
    // }).catch(comms.error);

    comms.send('not implemented');
  },
];
