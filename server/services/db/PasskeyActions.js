import { eq, and, desc, lt } from "drizzle-orm";
import { tables, useDB } from "~/server/utils/db";

class PasskeyActions {
  async findCredentialByUserId(userId) {
    try {
      const record = await useDB()
        .select()
        .from(tables.credentials)
        .where(eq(tables.credentials.userId, userId));
      return record;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to find credential by user id: ${error}`);
    }
  }

  async createCredential(
    userId,
    name,
    id,
    publicKey,
    counter,
    transports,
    backedUp,
  ) {
    try {
      const record = await useDB()
        .insert(tables.credentials)
        .values({ userId, name, id, publicKey, counter, transports, backedUp })
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to create credential: ${error}`);
    }
  }

  async storeChallenge(attemptId, challenge) {
    try {
      await useDB()
        .insert(tables.webAuthnChallenges)
        .values({
          id: attemptId,
          challenge,
          expiresAt: new Date(Date.now() + 60000),
        });
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to store challenge: ${error}`);
    }
  }

  async getAndDeleteChallenge(attemptId) {
    try {
      // First, clean up expired challenges
      await useDB()
        .delete(tables.webAuthnChallenges)
        .where(lt(tables.webAuthnChallenges.expiresAt, new Date()));

      // Get the challenge
      const record = await useDB()
        .select()
        .from(tables.webAuthnChallenges)
        .where(eq(tables.webAuthnChallenges.id, attemptId))
        .get();

      if (record) {
        // Delete the challenge
        await useDB()
          .delete(tables.webAuthnChallenges)
          .where(eq(tables.webAuthnChallenges.id, attemptId));
      }

      return record?.challenge;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to get challenge: ${error}`);
    }
  }

  async findCredentialById(credentialId) {
    try {
      const [record] = await useDB()
        .select()
        .from(tables.credentials)
        .where(eq(tables.credentials.id, credentialId));
      return record || null;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to find credential by id: ${error}`);
    }
  }

  async deleteCredential(userId, credentialId) {
    try {
      await useDB()
        .delete(tables.credentials)
        .where(
          and(
            eq(tables.credentials.userId, userId),
            eq(tables.credentials.id, credentialId),
          ),
        );
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to delete credential: ${error}`);
    }
  }
}

export const passkeyActions = new PasskeyActions();
