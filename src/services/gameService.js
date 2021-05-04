import { GameModel } from '../../chss-module-engine/src/model/Game';
import { getCollection } from './mongoService';

export const createGame = async() => {
  const game = new GameModel();
  game._id = game.id;
  game.createdAt = new Date().toISOString();
  game.updatedAt = game.createdAt;
  (await getCollection('games')).insertOne(game);
  return game;
};

export const updateGame = async(game) => {
  game.updatedAt = new Date().toISOString();
  return (await getCollection('games')).replaceOne({_id: game.id}, game, { upsert: true });
};
