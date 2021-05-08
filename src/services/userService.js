import { getCollection } from './mongoService';

export const getLoggedInUsersForClient = async({ clientId }) => {
  const usersCollection = await getCollection('users');
  return usersCollection.aggregate([{
    $lookup: {
      from: 'clients',
      localField: 'userId',
      foreignField: 'loggedInUser',
      as: 'clientData'
    }
  }, {
    $unwind: '$clientData',
  }, {
    $match: { 'clientData.clientId': clientId }
  }]).toArray();
};
