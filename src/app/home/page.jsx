'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { FiSend, FiPaperclip, FiGithub, FiLogOut, FiUser, FiSettings } from "react-icons/fi";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace('/login');
        return;
      }
      setUser(u);
      const name = u.displayName || '';
      const first = name.trim().split(' ')[0] || (u.email ? u.email.split('@')[0] : 'User');
      setFirstName(first);
    });
    return () => unsub();
  }, [router]);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    // Clear middleware auth cookie
    document.cookie = 'oceanus_auth=; Max-Age=0; path=/';
    router.replace('/login');
  };

  const goToChat = () => {
    const q = prompt.trim();
    const url = q ? `/chat?prompt=${encodeURIComponent(q)}` : '/chat';
    router.push(url);
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60 pointer-events-none"
        style={{ backgroundImage: `url('/images/code-bg.png')` }}
      />
      <div
        className="absolute inset-0 bg-cover bg-center mix-blend-screen opacity-60 pointer-events-none"
        style={{ backgroundImage: `url('/images/sunray-bg.png')` }}
      />

      {/* Top Bar (solid black, full-width) */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <div className="px-4 py-3 bg-black border-b border-black/50">
          <div className="grid grid-cols-3 items-center w-full">
            {/* Left: Home active tab */}
            <div className="flex items-center">
              <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl bg-[#0f1113] border border-white/10 shadow-inner">
                <div className="h-6 w-6 rounded-md bg-black border border-white/15 flex items-center justify-center">
                  <span className="block h-2.5 w-2.5 rounded-sm bg-white/70" />
                </div>
                <span className="text-sm font-semibold text-neutral-200">Home</span>
              </div>
            </div>

            {/* Center: (no brand text) */}
            <div className="flex items-center justify-center" />

            {/* Right: User Avatar + Dropdown */}
            <div className="flex items-center justify-end relative" ref={menuRef}>
              {user && user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User avatar'}
                  className="h-9 w-9 rounded-full border border-[#41f0c8] shadow-sm cursor-pointer"
                  onClick={() => setMenuOpen(!menuOpen)}
                />
              ) : (
                <div
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="h-9 w-9 rounded-full bg-[#232b30] flex items-center justify-center text-xs font-bold text-[#41f0c8] cursor-pointer"
                >
                  {firstName ? firstName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-44 bg-[#161d21] border border-[#2c353b] rounded-lg shadow-lg overflow-hidden">
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#edeef0] hover:bg-[#22292f] transition"
                    onClick={() => { setMenuOpen(false); router.push('/profile'); }}
                  >
                    <FiUser /> Profile
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#edeef0] hover:bg-[#22292f] transition"
                    onClick={() => { setMenuOpen(false); router.push('/settings'); }}
                  >
                    <FiSettings /> Settings
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-[#22292f] transition"
                    onClick={handleLogout}
                  >
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-6 pt-28 scale-105">
        {/* Welcome Title */}
        <p className="mb-3 text-[#41f0c8] text-sm md:text-base uppercase font-mono font-bold tracking-widest text-center">
          WELCOME, {firstName ? firstName.toUpperCase() : 'RONIT'}
        </p>

        {/* Main Heading and Subtitle */}
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-[#abf5ff] drop-shadow-[0_0_12px_#65e4ff60] text-center">
          Ready to speak with the waves!
        </h1>
        <p className="mb-8 text-[#a3a3a3] text-lg font-normal text-center max-w-2xl">
          Explore the ocean of possibilities outside human capabilities
        </p>

        {/* Chatbox */}
        <div className="w-full flex flex-col items-center">
          <div className="relative bg-black/70 border border-[#2c353b] rounded-2xl w-full min-h-[160px] px-6 pt-5 pb-4 shadow-lg flex flex-col">
            {/* Scrollable Input */}
            <div className="flex-1 overflow-y-auto">
              <textarea
                rows={1}
                placeholder="Find me the best fishing spots in the indian ocean"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); goToChat(); } }}
                className="w-full resize-none bg-transparent outline-none text-[#7dd3fc] placeholder-[#5e6b70] text-lg font-medium leading-relaxed"
                style={{ minHeight: "40px", maxHeight: "100px" }}
              />
            </div>

            {/* Bottom Row */}
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center gap-3">
                <button className="h-9 w-9 rounded-full bg-[#232b30] flex items-center justify-center text-lg text-[#c7cfd4] hover:bg-[#22292f] transition">
                  <FiPaperclip />
                </button>
                <button className="h-9 w-9 rounded-full bg-[#232b30] flex items-center justify-center text-lg text-[#c7cfd4] hover:bg-[#22292f] transition">
                  <FiGithub />
                </button>
              </div>
              <button onClick={goToChat} className="h-9 w-12 rounded-lg bg-[#232b30] flex items-center justify-center text-xl text-[#7dd3fc] hover:bg-[#41f0c8] hover:text-black transition">
                <FiSend />
              </button>
            </div>
          </div>

          {/* Prompts Row */}
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            {[
              "Clone Youtube",
              "Budget Planner",
              "AI Pen",
              "Surprise Me",
            ].map((btn) => (
              <button
                key={btn}
                onClick={() => { setPrompt(btn); setTimeout(goToChat, 0); }}
                className="bg-[#161d21] px-5 py-2 rounded-lg text-sm font-medium text-[#edeef0] hover:bg-[#22292f] transition"
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
