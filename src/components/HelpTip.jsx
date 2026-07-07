import { useState, useRef, useEffect } from 'react';

/**
 * コンテキストヘルプツールチップ
 * @param {{ text: string, detail?: string }} props
 */
export default function HelpTip({ text, detail }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <span className="relative inline-flex ml-1" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-pointer"
        aria-label="ヘルプ"
      >
        ?
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-xl z-50">
          <p>{text}</p>
          {detail && <p className="mt-1.5 text-gray-300 text-[11px]">{detail}</p>}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
        </div>
      )}
    </span>
  );
}
