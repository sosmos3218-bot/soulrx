import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
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
        forceRedirectUrl="/"
      />
    </main>
  );
}
