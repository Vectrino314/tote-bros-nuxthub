<template>
  <UForm
    :schema="passkeySchema"
    :state="state"
    class="space-y-4 max-w-sm"
    @submit="onSubmit"
  >
    <UFormGroup label="Email" name="email" size="lg">
      <UInput v-model="state.email" />
    </UFormGroup>
    <UButton
      :loading="loading"
      color="black"
      type="submit"
      :disabled="loading"
      size="lg"
      block
    >
      Login with Passkey
    </UButton>
  </UForm>
</template>

<script setup>
import { z } from "zod";
import { toast } from "vue-sonner";
const { fetch: refreshSession } = useUserSession();
const { authenticate } = useWebAuthn({
  authenticateEndpoint: "/api/auth/webauthn/authenticate",
});

const passkeySchema = z.object({
  email: z.string().email("Invalid email"),
});

const state = reactive({
  email: undefined,
});

const loading = ref(false);

const onSubmit = async event => {
  try {
    loading.value = true;
    await authenticate(event.data.email);
    await refreshSession();
    toast.success("Logged in successfully");
    return navigateTo(`/dashboard`);
  } catch (error) {
    toast.error(error.message || "Failed to authenticate with passkey");
  } finally {
    loading.value = false;
  }
};
</script>
