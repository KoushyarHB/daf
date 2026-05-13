export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex w-full flex-1 flex-col px-4 py-8 sm:px-6">
      {children}
    </main>
  );
}
