import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

import background from "../assets/background-picture.png";
import logo from "../assets/ZeitAufGleis-Logo.png";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // ✅ LOGIN ERFOLGREICH
    navigate("/");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Login Card */}
      <form
        onSubmit={handleLogin}
        className="
          relative
          w-full max-w-md
          rounded-2xl
          bg-black/60
          backdrop-blur-xl
          shadow-2xl
          px-10 py-12
          text-white
        "
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-1 mb-10">
          <img src={logo} alt="ZeitAufGleis Logo" className="h-45" />
          <h1 className="text-3xl font-semibold">Einloggen</h1>
        </div>

        {/* Inputs */}
        <div className="space-y-5">
          <Input
            type="email"
            placeholder="E-Mail-Adresse"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="
              bg-white/10
              border-white/20
              text-white
              placeholder:text-white/60
              focus:border-white/40
            "
          />

          <Input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="
              bg-white/10
              border-white/20
              text-white
              placeholder:text-white/60
              focus:border-white/40
            "
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 text-center mt-4">{error}</p>
        )}

        {/* Button */}
        <Button
          type="submit"
          className="w-full mt-8 text-lg"
          disabled={loading}
        >
          {loading ? "Einloggen…" : "Einloggen"}
        </Button>

        {/* Footer */}
        <p className="text-xs text-white/70 text-center mt-6">
          Mit dem Einloggen stimmen Sie den Nutzungsbedingungen und der
          Datenschutzerklärung zu.
        </p>
      </form>
    </div>
  );
}
