type AuthSubmitButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
};

export default function AuthSubmitButton({
  children,
  disabled,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="auth-btn mt-2 w-full cursor-pointer rounded-md border-0 bg-[rgb(47,111,184)] px-4 py-2.5 text-center text-[0.95rem] font-semibold text-white shadow-sm transition-colors hover:bg-[rgb(38,92,158)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(47,111,184)]/40 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}
