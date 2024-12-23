import { passkeyActions } from "~~/server/services/db/PasskeyActions";

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const { id } = await readBody(event);
  await passkeyActions.deleteCredential(user.id, id);
  return { success: true };
});
