import Link from "next/link";

type SignInPromptProps = {
  message: string;
};

export default function SignInPrompt({ message }: SignInPromptProps) {
  return (
    <p className="deck-hint">
      <Link href="/login">Sign in</Link> {message}
    </p>
  );
}
