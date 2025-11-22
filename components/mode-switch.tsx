"use client";

import React from "react";

type ModeSwitchProps = {
  mode: "analysis" | "chat";
  setMode: (mode: "analysis" | "chat") => void;
};

const ModeSwitch: React.FC<ModeSwitchProps> = ({ mode, setMode }) => {
  const handleCheckboxChange = () => {
    const modes: Array<"analysis" | "chat"> = ["analysis", "chat"];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
  };

  return (
    <div className="relative inline-flex select-none items-center justify-center rounded-lg bg-slate-800/50 border border-slate-700 p-1">
      <input
        type="checkbox"
        className="sr-only"
        checked={mode === "analysis"}
        onChange={handleCheckboxChange}
      />
      <button
        type="button"
        onClick={() => setMode("analysis")}
        className={`flex items-center cursor-pointer space-x-2 rounded-lg rounded-r-none py-2.5 px-5 text-sm font-medium transition-all ${
          mode === "analysis"
            ? "text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
            : "text-slate-400 hover:text-slate-300"
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span>Analýza</span>
      </button>
      <button
        type="button"
        onClick={() => setMode("chat")}
        className={`relative flex items-center cursor-pointer space-x-2 rounded-lg rounded-l-none py-2.5 px-5 text-sm font-medium transition-all ${
          mode === "chat"
            ? "text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
            : "text-slate-400 hover:text-slate-300"
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span>Chat</span>
        <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse shadow-lg">
          AI
        </span>
      </button>
    </div>
  );
};

export default ModeSwitch;
