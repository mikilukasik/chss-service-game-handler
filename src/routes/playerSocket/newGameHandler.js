import { createGame } from '../../services/gameService';

export const newGameHandler = [
  'newGame',
  async ({ user, computerPlaysBlack, computerPlaysWhite }, comms) => {
    const game = await createGame(
      Object.assign(
        {
          computerPlaysBlack,
          computerPlaysWhite,
        },
        computerPlaysWhite
          ? {
              bPlayer: user.userId,
              bName: user.username,
            }
          : {},
        computerPlaysBlack
          ? {
              wPlayer: user.userId,
              wName: user.username,
            }
          : {},
      ),
    );

    comms.send({ gameId: game.id });
  },
];
