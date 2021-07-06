const WORKER_TIMEOUT = 10000;

let _workersSocket;
const workersSocketResolvers = [];
const nextAvailableConnectionResolvers = [];

const connectionMetas = {};
const assignConnectionMeta = ({ key }, valueObj) => {
  connectionMetas[key] = Object.assign(connectionMetas[key] || {}, valueObj);
};
const getConnMeta = ({ key }) => connectionMetas[key] || {};

const onSocketOpen = (connection) => {
  assignConnectionMeta(connection, { busy: true });
  connection.do('init').then(() => {
    const pendingConnectionResolver = nextAvailableConnectionResolvers.pop();
    if (pendingConnectionResolver) {
      pendingConnectionResolver(connection);
      return;
    }

    assignConnectionMeta(connection, { busy: false });
  });
};

const onSocketClose = ({ key }) => delete connectionMetas[key];

const getWorkersSocket = () => new Promise(resolve => {
  if (_workersSocket) return resolve(_workersSocket);
  workersSocketResolvers.push(resolve);  
});

const init = ({ workersSocket }) => {
  workersSocket.onEvt('open', onSocketOpen);
  workersSocket.onEvt('close', onSocketClose);

  _workersSocket = workersSocket;
  workersSocketResolvers.forEach(resolve => resolve(workersSocket));
};

const getNextAvailableConnection = async() => {
  const { connections } = await getWorkersSocket();
  const availableConnection = connections
    .filter(c => !getConnMeta(c).busy)
    .sort((a, b) => {
      const timeoutCountDiff = (getConnMeta(b).timeoutCount || 0) - (getConnMeta(a).timeoutCount || 0);
      if (timeoutCountDiff !== 0) return timeoutCountDiff;

      return a.cookies.get('CHSS_CLIENT_SPEED') - b.cookies.get('CHSS_CLIENT_SPEED')
    })
    .pop();

  if (!availableConnection) return new Promise(resolve => {
    // will put it in the awaiters array, likely to the beginning, but maybe elsewhere for balancing tasks under load 
    if (Math.random() < 0.7) return nextAvailableConnectionResolvers.unshift(resolve);

    const positionToInsertTo = Math.floor(Math.random() * nextAvailableConnectionResolvers.length);
    nextAvailableConnectionResolvers.splice(positionToInsertTo, 0, resolve);
  });
  
  assignConnectionMeta(availableConnection, { busy: true });
  return availableConnection;
};

const solver = async(moveTask) => {
  const connection = await getNextAvailableConnection();
  if (Date.now() > moveTask.endAt) throw false;

  let timedOut = false;
  const response = await new Promise(async(resolve) => {
    const timeout = setTimeout(async() => {
      // worker timed out
      timedOut = true;
      assignConnectionMeta(connection, { timeoutCount: (getConnMeta(connection).timeoutCount || 0) + 1 });
      console.log('A worker timed out', getConnMeta(connection));

      return resolve(await solver(moveTask));
    }, WORKER_TIMEOUT);

    connection.do('solveSmallMoveTask', moveTask)
      .then(result => {
        clearTimeout(timeout);
        if (!timedOut) return resolve(result);

        console.log('slow worker returned', connection.key, getConnMeta(connection))
        assignConnectionMeta(connection, { busy: false });
      });
  });

  if (timedOut) return response;

  const pendingConnectionResolver = nextAvailableConnectionResolvers.pop();
  if (pendingConnectionResolver) {
    pendingConnectionResolver(connection);
    return response;
  }

  assignConnectionMeta(connection, { busy: false });
  return response;
};

export const resolveSmallMoveTaskOnWorker = async(moveTask) => {
  if (Date.now() > moveTask.endAt) throw false;

  return await solver(moveTask);
};

export const workersController = {
  init,
};
