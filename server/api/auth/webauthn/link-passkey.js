import { passkeyActions } from "~~/server/services/db/PasskeyActions";
import { z } from "zod";

export default defineWebAuthnRegisterEventHandler({
  async validateUser(userBody, event) {
    const session = await getUserSession(event);
    if (session.user?.email && session.user.email !== userBody.userName) {
      throw createError({
        statusCode: 400,
        message: "Email not matching curent session",
      });
    }
    return z
      .object({
        userName: z.string().email(),
        displayName: z.string().trim().optional(),
      })
      .parse(userBody);
  },
  async storeChallenge(event, challenge, attemptId) {
    await passkeyActions.storeChallenge(attemptId, challenge);
  },

  async getChallenge(event, attemptId) {
    const challenge = await passkeyActions.getAndDeleteChallenge(attemptId);
    return challenge;
  },
  async onSuccess(event, { credential, user }) {
    const { user: sessionUser } = await requireUserSession(event);
    await passkeyActions.createCredential(
      sessionUser.id,
      user.displayName,
      credential.id,
      credential.publicKey,
      credential.counter,
      credential.transports,
      credential.backedUp,
    );
  },
});
