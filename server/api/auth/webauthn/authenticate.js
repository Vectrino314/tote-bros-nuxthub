import { passkeyActions } from "~~/server/services/db/PasskeyActions";
import { userActions } from "~~/server/services/db/UserActions";
import { sanitizeUser } from "~~/server/utils/auth";

export default defineWebAuthnAuthenticateEventHandler({
  async storeChallenge(event, challenge, attemptId) {
    await passkeyActions.storeChallenge(attemptId, challenge);
  },

  async getChallenge(event, attemptId) {
    const challenge = await passkeyActions.getAndDeleteChallenge(attemptId);
    if (!challenge) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Challenge not found or expired'
      });
    }
    return challenge;
  },

  async allowCredentials(event, email) {
    const user = await userActions.findUserByEmail(email);
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }
    
    const credentials = await passkeyActions.findCredentialByUserId(user.id);
    return credentials || [];
  },

  async getCredential(event, credentialId) {
    const credential = await passkeyActions.findCredentialById(credentialId);
    if (!credential) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Credential not found'
      });
    }
    return credential;
  },

  async onSuccess(event, { credential }) {
    const user = await userActions.findUserByUserId(credential.userId);
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }

    await userActions.updateLastActive(user.id);
    const transformedUser = sanitizeUser(user);
    await setUserSession(event, { user: transformedUser });
  }
});
