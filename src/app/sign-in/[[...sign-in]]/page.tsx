import { SignIn } from "@clerk/nextjs";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const params = await searchParams;
  const redirect =
    params.redirect_url && params.redirect_url.startsWith("/")
      ? params.redirect_url
      : "/";

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center py-8">
      <p className="mb-4 font-serif text-lg font-semibold text-stone-800">
        SoulRx 로그인
      </p>
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "rounded-2xl border border-stone-200 bg-white/90 shadow-sm",
          },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl={redirect}
        fallbackRedirectUrl={redirect}
      />
    </main>
  );
}
