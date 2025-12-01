import SignInForm from "./components/SignInForm";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="max-w-md w-full m-4">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-300">Sign in to your account</p>
          </div>

          <SignInForm />
        </div>
      </div>
    </div>
  );
}
