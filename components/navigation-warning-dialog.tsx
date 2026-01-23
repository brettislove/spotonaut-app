interface NavigationWarningDialogProps {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export default function NavigationWarningDialog({
  isOpen,
  onStay,
  onLeave,
}: NavigationWarningDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg mb-2">
              Probíhá analýza
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Právě probíhá analýza vaší lokality. Pokud stránku opustíte,
              analýza bude přerušena a ztratíte dosavadní průběh.
            </p>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onStay}
            className="flex-1 px-4 py-2.5 bg-gradient-to-br from-purple-500 via-purple-600/100 to-purple-700 border border-purple-600/20 cursor-pointer hover:from-purple-400 hover:to-purple-600 text-white font-medium rounded-full transition-all shadow-lg"
          >
            Zůstat
          </button>
          <button
            onClick={onLeave}
            className="flex-1 px-4 py-2.5 bg-slate-800 cursor-pointer hover:bg-slate-700 text-white font-medium rounded-full transition-all border border-slate-700"
          >
            Odejít
          </button>
        </div>
      </div>
    </div>
  );
}
