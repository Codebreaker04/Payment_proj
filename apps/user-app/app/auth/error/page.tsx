import Link from "next/link";

interface ErrorPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "Authentication is temporarily unavailable. Please try again later.",
  AccessDenied:
    "You do not have access to sign in here. Please contact support.",
  Verification: "The verification link is invalid or has expired.",
  Default: "Something went wrong while signing you in.",
};

export default async function AuthErrorPage({ searchParams }: ErrorPageProps) {
  const params = await searchParams;
  const errorKey = params.error ?? "Default";
  const message = ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.Default;

  return (
    <>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4 text-2xl font-semibold">
          !
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Authentication Error
        </h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="block w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Sign In
          </Link>
          <Link
            href="/"
            className="block text-sm text-gray-500 hover:text-gray-700"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </>
  );
}
