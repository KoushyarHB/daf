import Link from "next/link";

import { deckHintClass } from "@/lib/styles/tagsPage";

type SignInPromptProps = {
  message: string;
};

export default function SignInPrompt({ message }: SignInPromptProps) {
  return (
    <p className={deckHintClass}>
      <Link href="/login" className="font-medium text-daf-head no-underline hover:underline hover:underline-offset-2">
        Sign in
      </Link>{" "}
      {message}
    </p>
  );
}
