import { useMutation } from "@tanstack/react-query";

import * as authClient from "@/services/frontend/auth.client";

export function useRegisterMutation() {
  return useMutation({
    mutationFn: authClient.registerUser,
  });
}
