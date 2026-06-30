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
      className="mt-2 w-full cursor-pointer appearance-none rounded-md border-0 bg-daf-head px-4 py-2.5 text-center text-[0.95rem] font-semibold text-white shadow-sm transition-colors hover:bg-daf-head-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daf-head/40 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}
