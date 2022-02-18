export const startLearningHandler = [
  'startLearning',
  async ({ model } = {}, { send }) => {
    console.log({ model });
    await send('OK');
  },
];
