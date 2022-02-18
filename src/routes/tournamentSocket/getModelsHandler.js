export const getModelsHandler = ({ msg }) => [
  'getModelNames',
  async (arg, comms) => {
    const models = await msg.do('getAllModelNames');
    comms.send(models);
  },
];
