import { notFound } from "next/navigation";

import { getAuthSession } from "@/lib/auth/require-auth";
import SignInPrompt from "@/components/shared/molecules/SignInPrompt";
import TagForm from "@/components/pages/tags/TagForm";
import * as tagsService from "@/services/backend/tags.service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTagPage({ params }: PageProps) {
  const session = await getAuthSession();
  if (!session) {
    return <SignInPrompt message="to edit tags." />;
  }

  const { id } = await params;
  const tag = await tagsService.getTagById(id);
  if (!tag) {
    notFound();
  }

  return (
    <TagForm
      mode="edit"
      tagId={id}
      initial={{ slug: tag.slug, label: tag.label }}
    />
  );
}
