import { getDB } from '../config/db.js';

const collection = () => getDB().collection('users');

export const upsertGithubUser = async ({
  providerUserId,
  username,
  email,
  avatarUrl
}) => {
  const now = new Date();

  const result = await collection().findOneAndUpdate(
    { provider: 'github', providerUserId },
    {
      $set: {
        username,
        email,
        avatarUrl,
        updatedAt: now
      },
      $setOnInsert: {
        provider: 'github',
        providerUserId,
        createdAt: now
      }
    },
    { returnDocument: 'after', upsert: true }
  );

  if (result?.value) {
    return result.value;
  }

  return collection().findOne({ provider: 'github', providerUserId });
};
