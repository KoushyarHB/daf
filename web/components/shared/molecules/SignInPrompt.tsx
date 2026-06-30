import TextLink from "@/components/shared/atoms/TextLink";
import HintBanner from "@/components/shared/molecules/HintBanner";

type SignInPromptProps = {
  message: string;
};

export default function SignInPrompt({ message }: SignInPromptProps) {
  return (
    <HintBanner>
      <TextLink href="/login" variant="muted">
        Sign in
      </TextLink>{" "}
      {message}
    </HintBanner>
  );
}
