import { getModelNames } from '../../services/tournamentService';

export const getModelsHandler = [
  'getModelNames',
  async (arg, comms) => {
    const models = await getModelNames();
    comms.send(models);
  },
];
