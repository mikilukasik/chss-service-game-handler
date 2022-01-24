import { GameModel } from '../../chss-module-engine/src/model/Game';
import { getPlayerSocket } from '../routes/routes';
import { getCollection } from './mongoService';
import { getScoreBoard, processGameScore } from './scoreBoardService';

const PAUSE_ABANDONED_GAMES_INTERVAL = 20000;
const PAUSE_AFTER_INACTIVE_FOR = 60 * 60 * 1000;

export const createGame = async (options) => {
  const game = new GameModel(options);

  // game._id = game.id;
  // game.createdAt = new Date().toISOString();
  // game.updatedAt = game.createdAt;
  (await getCollection('games')).insertOne(game);
  const playerSocket = await getPlayerSocket();

  playerSocket.emit('gameCreated', game);
  return game;
};

export const getGame = async (filters) => {
  const gamesCollection = await getCollection('games');
  return gamesCollection.findOne(filters);
};

export const updateGame = async (game) => {
  const playerSocket = await getPlayerSocket();

  game.updatedAt = new Date().toISOString();
  if (game.status !== 'active') {
    game.status = 'active';
    playerSocket.emit('gameBecameActive', game);
  }

  const gamesCollection = await getCollection('games');
  const result = await gamesCollection.replaceOne({ _id: game.id }, game, { upsert: true });

  playerSocket.emit(`gameChanged:${game.id}`, game);
  if (game.completed) {
    playerSocket.emit(`gameCompleted:${game.id}`, game);
    const { scoreBoardModified } = await processGameScore(game);
    if (scoreBoardModified) playerSocket.emit('scoreBoardChanged', await getScoreBoard());
  }

  return result;
};

export const getGames = async () => {
  const gamesCollection = await getCollection('games');
  return gamesCollection.find({ status: 'active' }).sort({ createdAt: -1 }).toArray();
};

const pauseAbandonedGames = async () => {
  const query = { status: 'active', updatedAt: { $lt: new Date(Date.now() - PAUSE_AFTER_INACTIVE_FOR).toISOString() } };
  const update = { $set: { status: 'paused' } };

  const gamesCollection = await getCollection('games');
  // can't use updateMany as we need the list of actually updated IDs to emit them.
  // Also need to make sure that we only pause games that didn't update between the 2 queries
  gamesCollection.find(query).forEach(({ id }) => {
    gamesCollection
      .findOneAndUpdate(Object.assign({ id }, query), update, { returnOriginal: false })
      .then(async ({ value: game, lastErrorObject: { updatedExisting } }) => {
        if (updatedExisting) {
          const playerSocket = await getPlayerSocket();
          playerSocket.emit('activeGamePaused', game);
        }
      });
  });
};

pauseAbandonedGames();
setInterval(pauseAbandonedGames, PAUSE_ABANDONED_GAMES_INTERVAL);
