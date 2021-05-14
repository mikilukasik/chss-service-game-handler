import { aptStringToTable } from '../../../chss-module-engine/src/engine/engine';
import { createGame } from '../../services/gameService';

export const newCustomGameHandler = [
  'newCustomGame',
  async({ tableString, wNext, user }, comms) => {
    const options = {
      table: aptStringToTable(tableString),
      wNext,
    };

    // TODO: we assume that game will be played against computer
    options[wNext ? 'wPlayer' : 'bPlayer'] = user.userId;
    options[wNext ? 'wName' : 'bName'] = user.username;
    options[wNext ? 'computerPlaysBlack' : 'computerPlaysWhite'] = true;

    const game = await createGame(options);

    comms.send({ gameId: game.id });
  },
];
