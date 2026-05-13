import PrimaryLayout from "@/components/shared/layouts/primary-layout/PrimaryLayout";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PrimaryLayout>{children}</PrimaryLayout>;
}
