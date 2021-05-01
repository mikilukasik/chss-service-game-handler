import { MoveTaskN, SplitMove, moveInTable } from '../../chss-module-engine/src/engine/engine';
import { updateGame } from '../services/gameService';
import { resolveSmallMoveTaskOnWorker } from './workersController';

export const getNextGameState = async({ game, updateProgress }) => {
  await updateGame(game);
  game.moveTask = new MoveTaskN(game);
  game.moveTask.sharedData.desiredDepth = 4;

  const tempMoves = new SplitMove(game).movesToSend;
  const progress = {
    total: tempMoves.length,
    completed: 0
  };

  const result = await Promise.all(tempMoves.map(smallMoveTask => 
    resolveSmallMoveTaskOnWorker({ smallMoveTask }).then(response => {
      progress.completed += 1;
      updateProgress(progress);
      return response;
    })
  ));

  // hack, to get the worst move. computer just wanna loose, works hard on it
  // result.sort((a, b) => a.score - b.score);

  result.sort((a, b) => b.score - a.score);

  const moveCoords = result[0].moveTree[0];
  const nextGameState = Object.assign({}, moveInTable(moveCoords, game));

  await updateGame(nextGameState);
  return { nextGameState, stats: result };
};
