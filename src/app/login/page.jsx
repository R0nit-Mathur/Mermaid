'use client';

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const slides = [
    "/images/slide1.png",
    "/images/slide2.png",
    "/images/slide3.png",
    "/images/slide4.png",
  ];

  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const AUTO_MS = 3800;

  useEffect(() => {
    startAuto();
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        document.cookie = `mermaid_auth=1; path=/`;
        router.replace('/home');
      }
    });
    return () => {
      stopAuto();
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startAuto() {
    stopAuto();
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, AUTO_MS);
  }
  function stopAuto() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function goTo(i) {
    setCurrent(i % slides.length);
    startAuto();
  }

  const prevIndex = (current - 1 + slides.length) % slides.length;
  const nextIndex = (current + 1) % slides.length;

  const getPos = (i) => {
    if (i === current) return "center";
    if (i === prevIndex) return "left";
    if (i === nextIndex) return "right";
    return "off";
  };

  const transition = "transform 700ms cubic-bezier(0.22,1,0.36,1), opacity 700ms";

  const posStyle = (pos) => {
    const base = {
      transition,
      position: "absolute",
      borderRadius: "14px",
      overflow: "hidden",
      border: "2px solid rgba(156, 163, 175, 0.8)",
      background: "#000",
      boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
    };

    switch (pos) {
      case "left":
        return { ...base, transform: "translateX(-46%) scale(0.78)", opacity: 1, zIndex: 20, width: "420px", height: "300px" };
      case "center":
        return { ...base, transform: "translateX(0%) scale(1.06)", opacity: 1, zIndex: 30, width: "560px", height: "360px" };
      case "right":
        return { ...base, transform: "translateX(46%) scale(0.78)", opacity: 1, zIndex: 20, width: "420px", height: "300px" };
      default:
        return { ...base, transform: "translateX(120%) scale(0.75)", opacity: 0, zIndex: 10, width: "420px", height: "300px" };
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* LEFT: LOGIN PANEL */}
      <div className="w-1/2 flex items-center justify-center bg-neutral-900 text-white p-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-neutral-800 mb-4 flex items-center justify-center">
              <span className="text-xl font-bold">M</span>
            </div>
            <h1 className="text-3xl font-bold">Welcome to Mermaid</h1>
            <p className="text-neutral-400 mt-2">
              Don’t have an account? <a className="text-teal-400">Sign up for free</a>
            </p>
          </div>

          {/* social buttons */}
          <div className="space-y-3 mb-6 w-full">
            <button
              onClick={async () => {
                try {
                  await signInWithPopup(auth, googleProvider);
                  document.cookie = `mermaid_auth=1; path=/`;
                  router.replace('/home');
                } catch (e) {
                  console.error('Google sign-in failed', e);
                }
              }}
              className="w-full flex items-center justify-center gap-3 bg-neutral-800 py-3 px-6 rounded-full 
                         transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
            >
              <img src="/google.svg" alt="G" className="w-6 h-6" />
              <span className="font-medium">Continue with Google</span>
            </button>
            <button
              className="w-full flex items-center justify-center gap-3 bg-neutral-800 py-3 px-6 rounded-full 
                         transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
            >
              <img src="/github.svg" alt="G" className="w-6 h-6" />
              <span className="font-medium">Continue with Github</span>
            </button>
            <button
              className="w-full flex items-center justify-center gap-3 bg-neutral-800 py-3 px-6 rounded-full 
                         transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
            >
              <img src="/apple.svg" alt="A" className="w-6 h-6" />
              <span className="font-medium">Continue with Apple</span>
            </button>
          </div>

          <div className="flex items-center my-6 text-neutral-500 text-sm">
            <hr className="flex-1 border-neutral-700" />
            <span className="px-3">Or Log in with email</span>
            <hr className="flex-1 border-neutral-700" />
          </div>

          <div className="space-y-4">
            <input
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-md bg-neutral-900 border border-neutral-700 outline-none"
            />
            <input
              placeholder="Enter your password"
              type="password"
              className="w-full px-4 py-3 rounded-md bg-neutral-900 border border-neutral-700 outline-none"
            />

            <button
              className="w-full bg-white text-black py-3 rounded-full font-semibold 
                         transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
            >
              Log In
            </button>

            <p className="text-center text-neutral-500">Forgot Password ?</p>
          </div>
        </div>
      </div>

      {/* RIGHT: VIDEO + CAROUSEL */}
      <div className="relative w-1/2 h-full overflow-hidden">
        {/* background video */}
        <video
          src="/video-bg.mp4"
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
        />

        {/* overlay content */}
        <div className="relative z-10 flex flex-col h-full text-white">
          {/* tagline */}
          <div className="pt-10 px-8 text-center">
            <h2 className="text-4xl font-bold drop-shadow-md">Learn About Ocean</h2>
            <p className="mt-1 text-xl">With AI</p>
          </div>

          {/* carousel area */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full flex items-center justify-center">
              {/* stage / viewport */}
              <div className="relative w-[880px] h-[420px] flex items-center justify-center">
                {slides.map((src, i) => {
                  const pos = getPos(i);
                  return (
                    <div
                      key={i}
                      style={posStyle(pos)}
                      className="rounded-2xl overflow-hidden bg-black 
                                 transition-all duration-300 ease-in-out hover:scale-105"
                      aria-hidden={pos === "off"}
                    >
                      <img
                        src={src}
                        alt={`slide-${i}`}
                        draggable={false}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* controls */}
          <div className="pb-10 flex items-center justify-center gap-6">
            <button
              onClick={() => {
                setCurrent((c) => (c - 1 + slides.length) % slides.length);
                startAuto();
              }}
              className="rounded-full bg-black/30 p-3 hover:bg-black/50 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95"
              aria-label="previous"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 6L9 12L15 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ease-in-out 
                             ${i === current ? "bg-white scale-110" : "bg-neutral-500 hover:scale-110"}`}
                  aria-label={`go to ${i}`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                setCurrent((c) => (c + 1) % slides.length);
                startAuto();
              }}
              className="rounded-full bg-black/30 p-3 hover:bg-black/50 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95"
              aria-label="next"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 6L15 12L9 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
