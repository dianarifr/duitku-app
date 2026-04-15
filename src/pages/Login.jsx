import { supabase } from '../supabaseClient';

function Login() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Waduh, gagal login:', error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 font-sans bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 space-y-8">

        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-2 text-3xl text-white bg-blue-600 shadow-lg rounded-2xl shadow-blue-200">
            💸
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-800">Duitku</h1>
          <p className="px-2 text-sm text-gray-500">
            Biar gaji nggak cuma numpang lewat. Pantau <span className="italic font-medium">cashflow</span> & <span className="italic font-medium">budget</span> bulananmu di sini! 🚀
          </p>
        </div>

        <div className="pt-6">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:ring-4 focus:ring-blue-100 active:scale-95"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google Icon"
              className="w-5 h-5"
            />
            Gass Login pake Google
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400">
            Chill, data kamu 100% aman dijagain <span className="font-medium text-gray-500">Supabase Auth</span> 🔒
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;