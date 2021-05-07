import { GameModel } from '../../chss-module-engine/src/model/Game';
import { getPlayerSocket } from '../routes/routes';
import { getCollection } from './mongoService';

export const createGame = async(options) => {
  const game = new GameModel(options);

  game._id = game.id;
  game.createdAt = new Date().toISOString();
  game.updatedAt = game.createdAt;
  (await getCollection('games')).insertOne(game);
  const playerSocket = await getPlayerSocket();
  
  playerSocket.emit('msg:gameCreated', game);
  return game;
};

export const updateGame = async(game) => {
  game.updatedAt = new Date().toISOString();
  const playerSocket = await getPlayerSocket();
  playerSocket.emit(`msg:gameChanged:${game.id}`, game);
  const gamesCollection = await getCollection('games');
  return gamesCollection.replaceOne({_id: game.id}, game, { upsert: true });
};

export const getActiveGames = async() => {
  const gamesCollection = await getCollection('games');
  return gamesCollection.find({ completed: false, updatedAt: { $gt: new Date(Date.now() - 300000).toISOString() } }).sort({ createdAt: -1 }).toArray(); // games updated in the last 5 minutes
};
