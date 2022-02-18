import { moveInBoard } from '../../chss-module-engine/src/engine/engine';
import { updateGame } from '../services/gameService';
import { getMoveFromBooks } from '../services/openingsService';
import { resolveSmallMoveTaskOnWorker } from './workersController';

const CUTOFF_TIME = 1500;

// TODO: this ABORT_TIME is not fully implemented.. hence 75s
const ABORT_TIME = 75000;

export const getNextGameState = async ({ game, updateProgress }) => {
  if (game.nextMoves.length === 1) {
    const nextGameState = Object.assign({}, moveInBoard(game.nextMoves[0], game));

    await updateGame(nextGameState);
    return { nextGameState, stats: null };
  }

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

  const getResult = async () => {
    const started = Date.now();
    const endAt = started + ABORT_TIME;

    let depth = 2;
    let d1Moves = depth1Moves;
    const d2Moves = {};
    const moveTrees = {};
    let result;
    let popularMoves;

    while (Date.now() - started < CUTOFF_TIME || depth < 4) {
      depth += 1;
      console.log(`${Date.now() - started}ms: depth ${depth}`);

      try {
        result = await getResultForDepth(depth, d1Moves, d2Moves, popularMoves, moveTrees, endAt);
        result.sort((a, b) => a.score - b.score);

        d1Moves = result.map((r) => r.move);

        popularMoves = result.reduce((p, c) => {
          c.moveTree.forEach((m) => (p[m] = (p[m] || 0) + 1));
          return p;
        }, {});
      } catch (e) {
        if (e) throw e;
      }
    }

    console.log(`${Date.now() - started}ms: out`);
    return result;
  };

  const getResultForDepth = async (depth, d1Moves, d2Moves, popularMoves, moveTrees, endAt) => {
    const currentBest = [-32768];
    const progress = {
      total: d1Moves.length,
      completed: 0,
    };

    const result = (
      await Promise.all(
        d1Moves.map((move) =>
          resolveSmallMoveTaskOnWorker({
            move,
            nextMoves: d2Moves[move],
            currentBest,
            board: game.board,
            desiredDepth: depth,
            popularMoves,
            moveTree: moveTrees[move],
            endAt,
            dontLoop: game.dontLoop,
            repeatedPastFens: game.repeatedPastFens,
          })
            .then((response) => {
              if (currentBest[0] === -32768 || (true && response.score < currentBest[0])) {
                currentBest[0] = response.score;
              }

              d2Moves[move] = response.nextMoves;
              moveTrees[move] = response.moveTree;
              progress.completed += 1;
              if (depth >= 4) updateProgress(progress);

              if (Date.now() > endAt) throw false;

              return response;
            })
            .catch((e) => {
              if (!e) throw e;
              console.error(e);
            }),
        ),
      )
    )
      .filter(Boolean)
      .map((r) => Object.assign(r, { score: r.score - game.pieceBalance }));

    if (!result.length) return null;
    return result;
  };

  const r = await getResult();
  const nextGameState = Object.assign({}, moveInBoard(r[0].move, game));

  await updateGame(nextGameState);
  return { nextGameState, stats: r };
};
