import { moveInBoard } from '../../chss-module-engine/src/engine/engine';
import { updateGame } from '../services/gameService';
import { getMoveFromBooks } from '../services/openingsService';
import { resolveSmallMoveTaskOnWorker } from './workersController';

export const perft = async({ board, moves, depth }) => {
  // TODO: don't think this works anymore

  const moveCountPerDepth = new Int32Array(10);
  moveCountPerDepth[1] = game.nextMoves.length;

  try {
    const moveFromBooks = await getMoveFromBooks(game);
    if (moveFromBooks) {
      const nextGameState = Object.assign({}, moveInBoard(moveFromBooks, game));
  
      await updateGame(nextGameState);
      return { nextGameState, stats: null };
    }
  } catch (e) {
    console.error(e);
  }

  const depth1Moves = game.nextMoves;

  const progress = {
    total: depth1Moves.length,
    completed: 0
  };

  const currentBests = [];

  const result = (await Promise.all(depth1Moves.map(move => 
    resolveSmallMoveTaskOnWorker({ move, currentBests, board: game.board, desiredDepth: 5 }).then(response => {
      response.moveCountPerDepth.forEach((count, depth) => moveCountPerDepth[depth] += count)
      progress.completed += 1;
      updateProgress(progress);
      return response;
    }).catch(console.error)
  )))
    .filter(Boolean)
    .map(r => (Object.assign(r, { score: r.score - game.pieceBalance })));

  if (!result.length) return null;

  result.sort((a, b) => a.score - b.score);

  const nextGameState = Object.assign({}, moveInBoard(result[0].move, game));

  await updateGame(nextGameState);
  return { nextGameState, stats: result };
};
