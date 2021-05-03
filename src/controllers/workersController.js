let _workersSocket;
const workersSocketResolvers = [];
const nextAvailableConnectionResolvers = [];
const busyConnections = {};

const onSocketOpen = (connection) => {
  busyConnections[connection.key] = true;
  connection.do('init').then(() => {
    const pendingConnectionResolver = nextAvailableConnectionResolvers.pop();
    if (pendingConnectionResolver) {
      pendingConnectionResolver(connection);
      return;
    }

    delete busyConnections[connection.key];
  });
};

const getWorkersSocket = () => new Promise(resolve => {
  if (_workersSocket) return resolve(_workersSocket);
  workersSocketResolvers.push(resolve);  
});

const init = ({ workersSocket }) => {
  workersSocket.onEvt('open', onSocketOpen);
  _workersSocket = workersSocket;
  workersSocketResolvers.forEach(resolve => resolve(workersSocket));
};

const getNextAvailableConnection = async() => {
  const { connections, onEvt } = await getWorkersSocket();
  // onEvt('open', (...args) => {console.log({args})})
  const availableConnection = connections
    .filter(({ key }) => !busyConnections[key])
    .sort((a, b) => a.cookies.get('CHSS_CLIENT_SPEED') - b.cookies.get('CHSS_CLIENT_SPEED'))
    .pop();

  if (!availableConnection) return new Promise(resolve => nextAvailableConnectionResolvers.push(resolve));
  
  busyConnections[availableConnection.key] = true;
  return availableConnection;
};

export const resolveSmallMoveTaskOnWorker = async({ smallMoveTask }) => {
  const connection = await getNextAvailableConnection();
  const response = await connection.do('solveSmallMoveTask', smallMoveTask);

  const pendingConnectionResolver = nextAvailableConnectionResolvers.pop();
  if (pendingConnectionResolver) {
    pendingConnectionResolver(connection);
    return response;
  }
   
  delete busyConnections[connection.key];
  return response;
};

export const workersController = {
  init,
};
