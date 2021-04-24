import { GameModel } from '../../chss-engine/src/model/Game';
import { getCollection } from './mongoService';

export const createGame = async() => {
  const game = new GameModel();
  game._id = game.id;
  (await getCollection('games')).insertOne(game);
  return game;
};

export const updateGame = async(game) => {
  return (await getCollection('games')).replaceOne({_id: game.id}, game);
};
