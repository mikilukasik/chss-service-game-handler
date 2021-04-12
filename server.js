import { initRoutes } from './src/routes/routes';
import msgService from '../msg/src/service';

export default () => {
  const serviceName = 'chss-service-game-handler';

  const msg = msgService({
    PORT: 4300,
    serviceName,
  });

  msg.connect().then(() => {
    console.log('MSG connected: ' + serviceName);
    initRoutes({ msg });
  }).catch(console.error);
};
