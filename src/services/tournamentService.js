import { getCollection } from './mongoService';
import { promises as fs } from 'fs';

const USE_SELU = false;

export const getModelNames = async () => {
  const validModelNames = [];

  const allFolders = await fs.readdir(`public/models`);
  // console.log(allFolders);
  for (const folderName of allFolders) {
    try {
      await fs.stat(`public/models/${folderName}/constants.json`);

      if (!USE_SELU) {
        const modelContents = await fs.readFile(`public/models/${folderName}/model.json`, 'utf8');
        // console.log({ modelContents });
        if (modelContents.indexOf('"activation":"selu"') >= 0) throw 'no selu';
      }
      validModelNames.push(folderName);
    } catch (e) {
      // /* */ console.log(e);
    }
  }

  return validModelNames.sort(() => Math.random() - 0.5); //.slice(0, 2);
};

// export const getLoggedInUsersForClient = async ({ clientId }) => {
//   const usersCollection = await getCollection('users');
//   return usersCollection
//     .aggregate([
//       {
//         $lookup: {
//           from: 'clients',
//           localField: 'userId',
//           foreignField: 'loggedInUser',
//           as: 'clientData',
//         },
//       },
//       {
//         $unwind: '$clientData',
//       },
//       {
//         $match: { 'clientData.clientId': clientId },
//       },
//     ])
//     .toArray();
// };
