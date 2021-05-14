import { getCollection } from './mongoService';

let _scoreBoard;

const sortAndLimitScoreBoard = () => {
  _scoreBoard.sort((a, b) => {
    const resultScoreDifference = b.resultScore - a.resultScore;
    if (resultScoreDifference !== 0) return resultScoreDifference;

    const moveCountDifference = b.moveCount - a.moveCount;

    switch (a.resultScore) {
      case 1: // draw
        return 0;
      case 0: // lost
        return moveCountDifference;
      case 2: // won
        return -moveCountDifference;
      default:
        throw new Error('Invalid resultScore');
    }
  });

  while (_scoreBoard.length > 10) _scoreBoard.pop();
};

export const processGameScore = async(game) => {
  if (game.isCustom || !game.completed || !([game.wName, game.bName].includes('Computer'))) return { scoreBoardModified: false };

  const won = 
    (game.whiteWon && game.computerPlaysBlack) ||
    (game.blackWon && game.computerPlaysWhite);
  
  const resultScore = won ? 2 : game.isDraw ? 1 : 0;

  const score = {
    name: game.computerPlaysBlack ? game.wName : game.bName,
    result: ['lost', 'draw', 'won'][resultScore],
    resultScore,
    moveCount: game.moveCount,
    gameId: game.id,
  };

  const scoreBoard = await getScoreBoard();
  const previousScoreIndex = scoreBoard.findIndex(({ name }) => name === score.name);

  if (previousScoreIndex < 0) {
    scoreBoard.push(score);
    sortAndLimitScoreBoard();
    
    const madeItToBoard = !!scoreBoard.find(({ name }) => name === score.name);
    return { scoreBoardModified: madeItToBoard };
  }

  const previousScore = scoreBoard[previousScoreIndex];
  if (resultScore < previousScore.resultScore) return { scoreBoardModified: false };

  if (resultScore === previousScore.resultScore) {
    switch (resultScore) {
      case 1: // draw
        return { scoreBoardModified: false }
      case 0: // lost
        if (previousScore.moveCount >= score.moveCount) return { scoreBoardModified: false };

        previousScore.moveCount = score.moveCount;
        previousScore.gameId = score.gameId;
        sortAndLimitScoreBoard();

        return { scoreBoardModified: true };
      case 2: // won
        if (previousScore.moveCount <= score.moveCount) return { scoreBoardModified: false };

        previousScore.moveCount = score.moveCount;
        previousScore.gameId = score.gameId;
        sortAndLimitScoreBoard();

        return { scoreBoardModified: true };
      default:
        throw new Error('Invalid resultScore');
    }
  }

  previousScore.result = score.result;
  previousScore.resultScore = score.resultScore;
  previousScore.gameId = score.gameId;
  previousScore.moveCount = score.moveCount;
  
  sortAndLimitScoreBoard();
  return { scoreBoardModified: true };
};

const initScoreBoard = async() => {
  if (_scoreBoard) return;
  _scoreBoard = [];

  const gamesCollection = await getCollection('games');
  await gamesCollection.aggregate([
    { $match: { completed: true, $or: [{ wName: 'Computer' }, { bName: 'Computer' }] } },
  ]).forEach(processGameScore);
};

export const getScoreBoard = async() => {
  if (!_scoreBoard) await initScoreBoard();
  return _scoreBoard;
};
