import { MoveTaskN, SplitMove, moveInTable } from '../../../chss-engine/src/engine/engine';
import { resolveSmallMoveTaskOnWorker } from './workersController';

export const getNextGameState = async({ game }) => {
  game.moveTask = new MoveTaskN(game);
  game.moveTask.sharedData.desiredDepth = 4;

  const tempMoves = new SplitMove(game).movesToSend;
  const result = await Promise.all(tempMoves.map(smallMoveTask => resolveSmallMoveTaskOnWorker({ smallMoveTask })));

  result.sort((a, b) => b.score - a.score);

  const moveCoords = result[0].moveTree[0];
  const nextGameState = Object.assign({}, moveInTable(moveCoords, game));

  return nextGameState;
};
