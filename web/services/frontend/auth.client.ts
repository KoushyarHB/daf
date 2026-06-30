import { apiPost } from "@/services/frontend/http";

export async function registerUser(body: {
  email: string;
  password: string;
  name?: string;
}): Promise<void> {
  await apiPost("/api/auth/register", body);
}
