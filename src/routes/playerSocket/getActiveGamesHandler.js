import { getActiveGames } from "../../services/gameService";

export const getActiveGamesHandler = [
  'getActiveGames',
  async(noData, comms) => {
    const activeGames = await getActiveGames();
    comms.send(activeGames);
  },
];
