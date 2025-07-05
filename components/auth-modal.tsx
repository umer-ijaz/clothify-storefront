"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { auth, googleProvider, firestore } from "@/lib/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isResetPassword, setIsResetPassword] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      } else {
        if (password !== confirmPassword) {
          setError("Passwörter stimmen nicht überein.");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Store user info in Firestore under 'users' collection with uid as document ID
        await setDoc(doc(firestore, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          createdAt: new Date().toISOString(),
        });

        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Store user info in Firestore with uid as document ID
      await setDoc(doc(firestore, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Bitte geben Sie Ihre E-Mail-Adresse ein.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setError(""); // Clear any existing errors
      alert(
        "E-Mail zum Zurücksetzen des Passworts wurde gesendet! Bitte überprüfen Sie Ihr Postfach."
      );
      // Optionally switch back to login view
      setIsResetPassword(false);
      setIsLogin(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000] p-4 max-h-screen w-[100%] pb-[100vh] pt-[100%] md:pt-[50%] lg:pt-[30%]">
      <div
        ref={scrollRef}
        className="bg-white rounded-xl w-full max-w-md p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="mb-6 text-center">
          <div className="flex justify-center mb-2">
            <Image
              src="/logo.png"
              alt="logo"
              width={90}
              height={90}
              className="cursor-pointer"
            />
          </div>
          <h2 className="text-2xl font-bold">
            {isResetPassword
              ? "Setzen Sie Ihr Passwort zurück"
              : isLogin
              ? "Melden Sie sich in Ihrem Konto an"
              : "Ein Konto erstellen"}
          </h2>
          <p className="text-gray-500 mt-1">
            {isResetPassword
              ? "Geben Sie Ihre E-Mail-Adresse ein, um einen Link zum Zurücksetzen des Passworts zu erhalten."
              : isLogin
              ? "Geben Sie Ihre Zugangsdaten ein, um auf Ihr Konto zuzugreifen."
              : "Füllen Sie die Angaben aus, um mit dem Einkauf zu beginnen."}
          </p>
        </div>

        {isResetPassword ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <p className="text-sm text-red-500 bg-red-100 p-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full border-gray-300"
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-full h-12 bg-gradient-to-r from-[#EB1E24] via-[#F05021] to-[#F8A51B] text-white  cursor-pointer"
            >
              Link zum Zurücksetzen senden
            </Button>
          </form>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <p className="text-sm text-red-500 bg-red-100 p-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Passwort</Label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetPassword(true);
                      setError("");
                    }}
                    className="text-sm text-orange-500 hover:text-orange-600  cursor-pointer"
                  >
                    Passwort vergessen?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-full border-gray-300"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-full border-gray-300"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-full h-12 bg-gradient-to-r from-[#EB1E24] via-[#F05021] to-[#F8A51B] text-white  cursor-pointer"
            >
              {isLogin ? "Anmelden" : "Registrieren"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          {isResetPassword ? (
            <p className="text-gray-600">
              Passwort merken?
              <button
                onClick={() => {
                  setIsResetPassword(false);
                  setIsLogin(true);
                  setError("");
                }}
                className="ml-1 text-orange-500 hover:text-orange-600 font-medium  cursor-pointer"
              >
                Zurück zum Login
              </button>
            </p>
          ) : (
            <p className="text-gray-600">
              {isLogin
                ? "Sie haben kein Konto?"
                : "Haben Sie bereits ein Konto?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="ml-1 text-orange-500 hover:text-orange-600 font-medium  cursor-pointer"
              >
                {isLogin ? "Registrieren" : "Anmelden"}
              </button>
            </p>
          )}
        </div>

        {!isResetPassword && (
          <>
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Oder fortfahren mit
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                className="rounded-full cursor-pointer  cursor-pointer"
                onClick={handleGoogleLogin}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-red-500"
                >
                  <path d="M21.35 11.1H12v2.9h5.45c-.25 1.3-.97 2.4-2.05 3.1v2.6h3.3c1.95-1.8 3.05-4.45 3.05-7.6 0-.65-.05-1.3-.15-1.9z" />
                  <path d="M12 22c2.7 0 4.95-.9 6.6-2.4l-3.3-2.6c-.9.6-2.05.95-3.3.95-2.55 0-4.7-1.7-5.45-4h-3.3v2.55C5.8 19.85 8.7 22 12 22z" />
                  <path d="M6.55 13.95c-.2-.6-.3-1.25-.3-1.95s.1-1.35.3-1.95V7.5h-3.3C2.4 9.05 2 10.5 2 12s.4 2.95 1.25 4.5l3.3-2.55z" />
                  <path d="M12 4.5c1.5 0 2.85.5 3.9 1.5l2.9-2.9C17 1.9 14.75 1 12 1 8.7 1 5.8 3.15 4.25 6l3.3 2.55C7.3 6.2 9.45 4.5 12 4.5z" />
                </svg>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
