import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center py-8">
      <p className="mb-4 font-serif text-lg font-semibold text-stone-800">
        SoulRx 가입
      </p>
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "rounded-2xl border border-stone-200 bg-white/90 shadow-sm",
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/"
      />
    </main>
  );
}
