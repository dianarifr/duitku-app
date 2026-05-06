import { supabase } from '../supabaseClient';
import * as Icon from '../lib/icons'; // Import dari lib ikon lo

function Login() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Otomatis balik ke mana pun asal kita saat ini
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error('Waduh, gagal login:', error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 font-sans bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 space-y-10 border border-gray-100">

        <div className="space-y-4 text-center">
          {/* Logo Box menggunakan Ikon Wallet */}
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 text-white bg-blue-600 shadow-xl rounded-3xl shadow-blue-100">
            <Icon.Wallet size={40} strokeWidth={2.5} />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl italic font-black tracking-tighter text-gray-800 uppercase">
              Duitku
            </h1>
            <p className="px-4 text-xs font-bold leading-relaxed tracking-widest text-gray-400 uppercase">
              Pantau <span className="text-blue-500">cashflow</span> & <span className="text-blue-500">budget</span> <br/>
              biar gaji gak cuma numpang lewat
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleLogin}
            className="flex items-center justify-center w-full gap-3 px-4 py-4 text-sm font-black text-gray-700 uppercase transition-all duration-200 bg-white border-2 border-gray-100 shadow-sm rounded-2xl hover:bg-gray-50 hover:border-blue-100 focus:ring-4 focus:ring-blue-50/50 active:scale-95"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google Icon"
              className="w-5 h-5"
            />
            Masuk dengan Google
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-full bg-gray-50">
            <Icon.CheckCircle2 size={12} strokeWidth={3} className="text-green-500" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
              Secured by <span className="text-gray-600">Supabase Auth</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;