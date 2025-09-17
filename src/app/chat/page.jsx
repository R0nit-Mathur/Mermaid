'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import LeafletMap from './LeafletMap';
import { generateOceanResponse } from '@/lib/gemini';
import { useSearchParams } from 'next/navigation';

function ChatInner() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt');

  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! Ask me anything about oceans, fisheries, or eDNA.' }
  ]);
  const [input, setInput] = useState('');
  const [mapData, setMapData] = useState({ zones: [], rivers: [], points: [] });
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-send initial prompt from Home
  useEffect(() => {
    if (initialPrompt && !isLoading && messages.length <= 1) {
      setInput(initialPrompt);
      handleSend(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const handleSend = async (forcedText) => {
    const raw = forcedText ?? input;
    const trimmed = raw.trim();
    if (!trimmed || isLoading) return;
    
    setIsLoading(true);
    const next = [...messages, { role: 'user', content: trimmed }];
    // show typing bubble
    setMessages([...next, { role: 'assistant', content: '...', typing: true }]);
    setInput('');
    
    try {
      const aiResponse = await generateOceanResponse(trimmed, next);
      const assistantArray = Array.isArray(aiResponse.response) ? aiResponse.response : [aiResponse.response];
      setMapData(aiResponse.mapData);
      setMessages([...next, { role: 'assistant', content: assistantArray }]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages([...next, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full bg-black text-white">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <div className="px-4 py-3 bg-black border-b border-black/50">
          <div className="grid grid-cols-3 items-center w-full">
            <div className="flex items-center">
              <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl bg-[#0f1113] border border-white/10 shadow-inner">
                <div className="h-6 w-6 rounded-md bg-black border border-white/15 flex items-center justify-center">
                  <span className="block h-2.5 w-2.5 rounded-sm bg-white/70" />
                </div>
                <span className="text-sm font-semibold text-neutral-200">Home</span>
              </div>
            </div>
            <div />
            <div />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pt-14 flex">
        {/* Left: Chat UI */}
        <div className="w-1/2 h-full border-r border-white/10 flex flex-col">
          <div className="px-4 py-3 border-b border-white/10">Chat</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-[#232b30] text-[#edeef0]' : 'bg-[#0f1113] text-[#cfeaf1]'}`}>
                  {m.typing ? (
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#9ccbd7] rounded-full animate-pulse" />
                      <span className="w-1.5 h-1.5 bg-[#9ccbd7] rounded-full animate-pulse [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-[#9ccbd7] rounded-full animate-pulse [animation-delay:300ms]" />
                    </span>
                  ) : Array.isArray(m.content) ? (
                    <ol className="list-decimal ml-5 space-y-1">
                      {m.content.map((item, idx) => (<li key={idx}>{item}</li>))}
                    </ol>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t border-white/10 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Type your question..."
              className="flex-1 bg-transparent outline-none border border-[#2c353b] rounded-md px-3 py-2 text-sm"
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-[#232b30] hover:bg-[#2b343a] disabled:opacity-50"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>

        {/* Right: Map + Stats */}
        <div className="relative w-1/2 h-full">
          <LeafletMap mapData={mapData} />
          {/* Stats overlay */}
          <div className="absolute right-4 bottom-4 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-4 w-72 shadow-lg z-10">
            <div className="text-sm text-[#9ab6bf] mb-2">Conditions (India)</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[#6fa6b5]">Temperature</div>
                <div className="text-[#d4f1f9] font-semibold">27.3 °C</div>
              </div>
              <div>
                <div className="text-[#6fa6b5]">Wind Speed</div>
                <div className="text-[#d4f1f9] font-semibold">12.5 km/h</div>
              </div>
              <div>
                <div className="text-[#6fa6b5]">Direction</div>
                <div className="text-[#d4f1f9] font-semibold">SW (230°)</div>
              </div>
              <div>
                <div className="text-[#6fa6b5]">Wave Height</div>
                <div className="text-[#d4f1f9] font-semibold">1.2 m</div>
              </div>
              <div>
                <div className="text-[#6fa6b5]">Salinity</div>
                <div className="text-[#d4f1f9] font-semibold">35 PSU</div>
              </div>
              <div>
                <div className="text-[#6fa6b5]">Chlorophyll</div>
                <div className="text-[#d4f1f9] font-semibold">0.6 mg/m³</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading...</div>}>
      <ChatInner />
    </Suspense>
  );
}
