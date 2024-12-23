import { passkeyActions } from "~~/server/services/db/PasskeyActions";

export default defineEventHandler(async event => {
  const { user } = await requireUserSession(event);
  const passkeys = await passkeyActions.findCredentialByUserId(user.id);
  return passkeys;
});
