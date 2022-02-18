import { resolveSmallMoveTaskOnWorker } from '../controllers/workersController';

export const perft = async ({ data: { board, moves, depth }, updateProgress }) => {
  const moveCountPerDepth = new Int32Array(10);
  moveCountPerDepth[1] = moves.length;

  const progress = {
    total: moves.length,
    completed: 0,
  };

  const currentBests = [];

  const result = (
    await Promise.all(
      moves.map((move) =>
        resolveSmallMoveTaskOnWorker({ move, currentBests, board, desiredDepth: depth, perft: true })
          .then((response) => {
            response.moveCountPerDepth.forEach((count, depth) => (moveCountPerDepth[depth] += count));
            progress.completed += 1;
            updateProgress(progress);
            return response;
          })
          .catch(console.error),
      ),
    )
  ).filter(Boolean);

  if (!result.length) return null;
  return Array.from(moveCountPerDepth);
};
