import { getAuthSession } from "@/lib/auth/require-auth";
import SignInPrompt from "@/components/shared/SignInPrompt";
import TagForm from "@/components/pages/tags/TagForm";

export const dynamic = "force-dynamic";

export default async function NewTagPage() {
  const session = await getAuthSession();
  if (!session) {
    return <SignInPrompt message="to create tags." />;
  }

  return <TagForm mode="create" />;
}
