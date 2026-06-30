import { SubmitButton } from "@/components/shared/atoms/Button";

type AuthSubmitButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
};

export default function AuthSubmitButton({
  children,
  disabled,
}: AuthSubmitButtonProps) {
  return <SubmitButton disabled={disabled}>{children}</SubmitButton>;
}
