import { initRoutes } from './src/routes/routes';
import msgService from './msg/src/service';
import { initGameController } from './src/controllers/gameControllerV2';

const SERVICE_NAME = 'chss-service-game-handler';
const PORT = 4300;
const MSG_GATEWAY_ADDRESS = '0.0.0.0:3300';

export default () => {
  const msg = msgService({
    PORT,
    serviceName: SERVICE_NAME,
    gatewayAddress: MSG_GATEWAY_ADDRESS,
  });

  msg
    .connect()
    .then(() => {
      initRoutes({ msg });
      initGameController({ msg });
    })
    .catch(console.error);
};
