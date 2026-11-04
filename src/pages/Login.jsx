import { supabase } from '../supabaseClient';
import * as Icon from '../lib/icons';

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-5 font-sans">
      <div className="w-full max-w-md border border-line bg-surface p-8 sm:p-10">
        <div className="mb-8 border-b border-line pb-6">
          <div className="mb-5 flex items-baseline gap-2">
            <span className="font-serif text-[21px] font-semibold tracking-tight text-ink">Duitku</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">cashflow</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xs border border-line bg-surface-alt text-accent">
              <Icon.Wallet size={26} strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">
                Masuk ke Duitku
              </h1>
              <p className="mt-1 font-mono text-[10px] uppercase leading-relaxed tracking-[0.08em] text-muted">
                Pantau cashflow &amp; budget
                <br />
                biar gaji gak cuma numpang lewat
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogin}
          className="btn w-full gap-3 text-sm"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google Icon"
            className="h-5 w-5"
          />
          Masuk dengan Google
        </button>

        <div className="mt-6 flex items-center justify-center">
          <span className="badge">
            <Icon.CheckCircle2 size={12} strokeWidth={2} className="text-pos" />
            Secured by Supabase Auth
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;