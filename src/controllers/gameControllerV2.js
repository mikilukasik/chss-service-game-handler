import { moveInBoard } from '../../chss-module-engine/src/engine/engine';
import { updateGame } from '../services/gameService';

const depth = 7;
const aiMultiplier = 2;
const deepMoveSorters = [
  { modelName: 'pg_large', cutoff: 0.0001 },
  { modelName: 'pg_small', cutoff: 0, worker: 'main' /*, cutoff: 0.042*/ },
  { modelName: 'pg_tiny', cutoff: 0, worker: 'sub' /*, cutoff: 0.042*/ },
];

let _msg;
const msgAwaiters = [];

const getMsg = () =>
  new Promise((r) => {
    if (_msg) return r(_msg);
    msgAwaiters.push(r);
  });

export const initGameController = ({ msg }) => {
  _msg = msg;
  while (msgAwaiters.length) msgAwaiters.pop()(_msg);
};

export const getNextGameState = async ({ game, updateProgress }) => {
  const prediction = await (
    await getMsg()
  ).do('predictOnGrid', { game, aiMultiplier, deepMoveSorters, depth }, ({ onData }) => {
    onData(updateProgress);
  });

  const nextGameState = Object.assign({}, moveInBoard(prediction.move, game));

  await updateGame(nextGameState);
  return { nextGameState, stats: null };
};
