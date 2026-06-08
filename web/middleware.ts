import { auth } from "@/lib/auth/auth";

export default auth(() => {
  // Session refresh only; route handlers enforce auth on mutations.
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3)$).*)",
  ],
};
