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
    document.cookie = 'mermaid_auth=; Max-Age=0; path=/';
    router.replace('/login');
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

      {/* User Icon (Top Right with Dropdown) */}
      <div className="absolute top-4 right-6 z-20" ref={menuRef}>
        <div
          onClick={() => setMenuOpen(!menuOpen)}
          className="cursor-pointer"
        >
          {user && user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User avatar'}
              className="h-10 w-10 rounded-full border border-[#41f0c8] shadow-sm"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-[#232b30] flex items-center justify-center text-sm font-bold text-[#41f0c8]">
              {firstName ? firstName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-[#161d21] border border-[#2c353b] rounded-lg shadow-lg overflow-hidden">
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#edeef0] hover:bg-[#22292f] transition"
              onClick={() => router.push('/profile')}
            >
              <FiUser /> Profile
            </button>
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#edeef0] hover:bg-[#22292f] transition"
              onClick={() => router.push('/settings')}
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

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-6 scale-105">
        {/* Welcome Title */}
        <p className="mb-3 text-[#41f0c8] text-sm md:text-base uppercase font-mono font-bold tracking-widest text-center">
          Welcome, {firstName ? firstName.toUpperCase() : 'RONIT'}
        </p>


        {/* Main Heading and Subtitle */}
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#abf5ff] drop-shadow-[0_0_12px_#65e4ff60] text-center">
          Where ideas become reality
        </h1>
        <p className="mb-8 text-[#a3a3a3] text-lg font-normal text-center max-w-2xl">
          Build fully functional apps and websites through simple conversations
        </p>

        {/* Chatbox */}
        <div className="w-full flex flex-col items-center">
          <div className="relative bg-black/70 border border-[#2c353b] rounded-2xl w-full min-h-[160px] px-6 pt-5 pb-4 shadow-lg flex flex-col">
            {/* Scrollable Input */}
            <div className="flex-1 overflow-y-auto">
              <textarea
                rows={1}
                placeholder="Build me an image generator app using Nano Banana"
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
              <button className="h-9 w-12 rounded-lg bg-[#232b30] flex items-center justify-center text-xl text-[#7dd3fc] hover:bg-[#41f0c8] hover:text-black transition">
                <FiSend />
              </button>
            </div>
          </div>

          {/* Prompts Row */}
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            {[
              "Gold Fishes",
              "Temperature",
              "Toxicity Levels",
              "Surprise Me"
            ].map((btn) => (
              <button
                key={btn}
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
