import { getModelsHandler } from '../routes/tournamentSocket/getModelsHandler';
import { startTournamentHandler } from '../routes/tournamentSocket/startTournamentHandler';
import { tournamentGameFinishedHandler } from '../routes/tournamentSocket/tournamentGameFinishedHandler';
import uuid from 'uuid-random';
import path from 'path';
import { promises as fs } from 'fs';
import { GameModel } from '../../chss-module-engine/src/model/Game';
import { startLearningHandler } from '../routes/tournamentSocket/startLearningHandler';

const cacheFolder = './tournamentGameCache';

const tournaments = {};

let _msg;

const init = ({ tournamentSocket, msg }) => {
  _msg = msg;
  tournamentSocket.on(...getModelsHandler({ msg }));
  tournamentSocket.on(...startTournamentHandler);
  tournamentSocket.on(...startLearningHandler);
  tournamentSocket.on(...tournamentGameFinishedHandler);
};

const pieceValues = {
  p: -1,
  b: -3,
  n: -3,
  r: -5,
  q: -9,
  P: 1,
  B: 3,
  N: 3,
  R: 5,
  Q: 9,
};
const getBalance = (fen) =>
  fen
    .split(' ')[0]
    .split('')
    .reduce((p, c) => p + (pieceValues[c] || 0), 0);

const getTournamentGames = async ({ tournamentData: { randomValue, rounds, aiPlayerNames, id } }) => {
  const games = await Promise.all(
    aiPlayerNames.reduce(
      (games, playerName, playerIndex) =>
        games.concat(
          Array(aiPlayerNames.length - playerIndex - 1)
            .fill(0)
            .map((e, i) => {
              const opponentIndex = playerIndex + i + 1;

              const player1 = playerName;
              const player2 = aiPlayerNames[opponentIndex];

              return [
                new GameModel({
                  wPlayer: player1,
                  wName: player1,
                  bPlayer: player2,
                  bName: player2,
                  tournamentInfo: { randomValue, rounds, id },
                  // computerPlaysBlack: true,
                }),
                new GameModel({
                  wPlayer: player2,
                  wName: player2,
                  bPlayer: player1,
                  bName: player1,
                  tournamentInfo: { randomValue, rounds, id },
                  // computerPlaysBlack: true,
                }),
              ];
            })
            .flat(),
        ),
      [],
    ),
  );

  // games.sort(() => Math.random() - 0.5);
  return games;
};

const cacheResult = async (game) => {
  const fileName = path.resolve(cacheFolder, `${game.wPlayer} vs ${game.bPlayer}.json`);
  await fs.writeFile(fileName, JSON.stringify(game, null, 2), 'utf8');
};

const getCachedGame = async ({ wPlayer, bPlayer }) => {
  const fileName = path.resolve(cacheFolder, `${wPlayer} vs ${bPlayer}.json`);
  try {
    return JSON.parse(await fs.readFile(fileName, 'utf8'));
  } catch (e) {
    return null;
  }
};

export const createTournament = async ({ aiPlayers, randomValue, rounds, connection }) => {
  await fs.mkdir(path.resolve(cacheFolder), { recursive: true });

  let modelNames = await _msg.do('getAllModelNames', { requiredFiles: ['loader.js'] });
  let aiPlayerNames = modelNames;
  if (aiPlayers) aiPlayerNames = aiPlayerNames.filter((name) => aiPlayers.includes(name));

  const tournamentData = {
    randomValue,
    rounds,
    aiPlayerNames,
    id: uuid(),
    gameStats: {},
    playerStats: aiPlayerNames.reduce((p, c) => {
      p[c] = { points: 0, pieceBalance: 0, movePoints: 0, games: 0, won: 0, lost: 0, drew: 0, thinkingTimes: [] };
      return p;
    }, {}),
  };

  tournaments[tournamentData.id] = tournamentData;

  const games = await getTournamentGames({ tournamentData });

  let i = games.length;
  while (i--) {
    const { wPlayer, bPlayer } = games[i];
    tournamentData.gameStats[`${wPlayer} - ${bPlayer}`] = { games: [] };

    const cachedGame = await getCachedGame({ wPlayer, bPlayer });
    if (!cachedGame) continue;

    cachedGame.tournamentInfo.id = tournamentData.id;

    await recordTournamentGame({
      game: cachedGame,
      connection: i % 500 === 0 ? connection : null,
    });

    games.splice(i, 1);
  }

  return { games, tournamentData };
};

const average = (arr) => arr.reduce((p, c) => p + c, 0) / (arr.length || 1);

export const recordTournamentGame = async ({ game, connection }) => {
  try {
    const { whiteWon, blackWon, isDraw, allPastFens, thinkingTimes } = game;

    const wPlayer = tournaments[game.tournamentInfo.id].playerStats[game.wPlayer];
    const bPlayer = tournaments[game.tournamentInfo.id].playerStats[game.bPlayer];

    await cacheResult(game);

    if (whiteWon) {
      wPlayer.won += 1;
      bPlayer.lost += 1;
    }

    if (blackWon) {
      bPlayer.won += 1;
      wPlayer.lost += 1;
    }

    if (isDraw) {
      wPlayer.drew += 1;
      bPlayer.drew += 1;
    }

    const halfMoves = allPastFens.length - 1;

    const balance = getBalance(allPastFens[halfMoves]);

    bPlayer.games += 1;
    bPlayer.points += blackWon ? 1 : whiteWon ? 0 : 0.5;
    bPlayer.pieceBalance -= balance;
    bPlayer.movePoints += blackWon ? 1 / halfMoves : whiteWon ? -1 / halfMoves : 0;
    bPlayer.thinkingTimes.push(average(thinkingTimes.black));

    wPlayer.games += 1;
    wPlayer.points += whiteWon ? 1 : blackWon ? 0 : 0.5;
    wPlayer.pieceBalance += balance;
    wPlayer.movePoints += whiteWon ? 1 / halfMoves : blackWon ? -1 / halfMoves : 0;
    wPlayer.thinkingTimes.push(average(thinkingTimes.white));

    if (connection) await connection.do('updateTournamentData', tournaments[game.tournamentInfo.id]);
    console.log(`Tournament game updated.`);
  } catch (e) {
    console.error(e);
  }
};

export const tournamentController = {
  init,
};
