import { getGames } from "../../services/gameService";

export const getGamesHandler = [
  'getGames',
  async(noData, comms) => {
    const games = await getGames();
    comms.send(games);
  },
];
