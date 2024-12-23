<template>
  <main class="flex flex-col items-center justify-center h-screen">
    <div class="w-full max-w-sm mx-auto space-y-6">
      <img src="/logo.png" alt="Microbot" class="h-8 w-auto" />
      <h1 class="font-semibold text-2xl">Sign Up</h1>
      <p class="text-sm">Enter your information to create an account</p>
      <AuthRegisterPasswordForm />
      <UDivider label="OR" />
      <AuthSocialLogin />
      <p class="text-sm text-center">
        Already have an account?
        <UButton to="/auth/login" variant="link" :padded="false" color="gray"
          >Sign in</UButton
        >
      </p>
    </div>
  </main>
</template>
