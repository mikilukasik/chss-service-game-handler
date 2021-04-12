import { MoveTaskN, SplitMove, DeepeningTask, resolveDepth, oneDeeper, solveDeepeningTask, moveIt, evalFuncs, moveInTable } from '../../../../chss-engine/src/engine/engine';

export const makeComputerMoveHandler = [
  'makeComputerMove',
  (data, comms) => {
    console.log('Making computer move..');
    try {
      const game = data.cmdArgs;
      game.moveTask = new MoveTaskN(game);
      game.moveTask.sharedData.desiredDepth = 3;

      const result = []
      const tempMoves = new SplitMove(game).movesToSend;
      tempMoves.forEach(function (smallMoveTask, index) {
        const deepeningTask = new DeepeningTask(smallMoveTask)
        oneDeeper(deepeningTask) //this will make about 30 smalldeepeningtasks from the initial 1 and create deepeningtask.resolverarray
        //first item in deepeningtask.smalldeepeningtasks is trigger
        const res = []
        while (deepeningTask.smallDeepeningTasks.length > 1) {
          const smallDeepeningTask = deepeningTask.smallDeepeningTasks.pop()
          smallDeepeningTask.progress = deepeningTask.progress
          const res2 = solveDeepeningTask(smallDeepeningTask, true)
          res2.value = res2.score
          res[res.length] = res2;
        }
    
        const tempResolveArray = []
        tempResolveArray[1] = []
        tempResolveArray[2] = res
        tempResolveArray[3] = []
    
        resolveDepth(2, tempResolveArray)
        const pushAgain = tempResolveArray[1][0]
        const moveCoords = pushAgain.moveTree[0]
        let wouldLoop
    
        if (!game.moveTask.shouldIDraw) {
          const movedTable = moveIt(moveCoords, game.table)
          wouldLoop = evalFuncs.checkIfLooped(movedTable, game.allPastTables)
        } else {
          // TODO: offer draw?
        }

        if (wouldLoop) pushAgain.value -= Math.pow(wouldLoop, 5)
        pushAgain.score = pushAgain.value
        pushAgain.move = moveCoords
        result[result.length] = pushAgain;
      })

      result.sort((a, b) => b.score - a.score);

      const moveCoords = result[0].moveTree[0];
      const nextGameState = Object.assign({}, moveInTable(moveCoords, game));

      comms.connection.do('updateGame', nextGameState).then(() => {
        comms.send('OK');
      }).catch(comms.error);
    } catch (e) {
      comms.error(e.message);
    }
  },
];
