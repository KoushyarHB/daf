import { getAuthSession } from "@/lib/auth/require-auth";
import SignInPrompt from "@/components/shared/SignInPrompt";
import TagsManager from "@/components/pages/tags/TagsManager";
import * as tagsService from "@/services/tags.service";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const session = await getAuthSession();
  if (!session) {
    return <SignInPrompt message="to manage tags." />;
  }

  const tags = await tagsService.listTagsPaginated({
    page: 1,
    pageSize: 100,
    counts: true,
  });

  return <TagsManager initialTags={tags.items} />;
}
