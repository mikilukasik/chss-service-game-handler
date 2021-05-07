import { createGame } from '../../services/gameService';

export const newGameHandler = [
  'newGame',
  async({ user, userColor, againstComputer }, comms) => {
    if (userColor !== 'white') return comms.error('playing with black is not yet implemented');
    if (!againstComputer) return comms.error('playing against other users is not yet implemented');

    const game = await createGame({
      wPlayer: user.userId,
      wName: user.username,
      computerPlaysBlack: true,
    });

    comms.send({ gameId: game.id });
  },
];
