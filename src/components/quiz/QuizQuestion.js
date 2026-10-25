"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// One question: either gold-outlined option cards or a heartfelt text input box.
export default function QuizQuestion({ question, selectedId, disabled, onSelect }) {
  const [inputText, setInputText] = useState("");
  const isInput = question.type === "input";

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || disabled) return;
    onSelect(inputText.trim(), e);
  };

  return (
    <div className="w-full">
      <h2 className="text-center font-heading text-2xl leading-snug text-gold-light sm:text-3xl">
        {question.question}
      </h2>
      <p className="mt-2 text-center font-body text-xs text-ink/60">
        {isInput ? "Type from your heart, my girl" : "Pick one, my girl"}
      </p>

      {isInput ? (
        <form onSubmit={handleInputSubmit} className="mt-6 flex flex-col items-center gap-4">
          <textarea
            value={inputText}
            disabled={disabled}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={question.placeholder || "Tell me whatever is on your heart, I'm listening..."}
            rows={4}
            className="w-full rounded-2xl border border-gold/55 bg-bg-soft/80 p-4 font-body text-base text-ink placeholder:text-ink/40 focus:border-gold-light focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-75 resize-none transition-all duration-300"
          />
          {!selectedId && (
            <motion.button
              type="submit"
              disabled={disabled || !inputText.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="min-h-[48px] rounded-full border border-gold-light bg-gold/20 px-8 py-2.5 font-body text-sm font-medium tracking-wide text-gold-light shadow-glow transition-all hover:bg-gold/30 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue 💛
            </motion.button>
          )}
        </form>
      ) : (
        <ul className="mt-6 grid gap-3">
          {question.options?.map((opt, i) => {
            const selected = selectedId === opt.id;
            const dim = selectedId && !selected;
            return (
              <motion.li
                key={opt.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: dim ? 0.4 : 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.45 }}
              >
                <button
                  type="button"
                  disabled={disabled}
                  onClick={(e) => onSelect(opt.id, e)}
                  aria-pressed={selected}
                  className={`min-h-[56px] w-full rounded-2xl border px-5 py-3 text-left font-body text-base transition-all duration-300 ${
                    selected
                      ? "scale-[1.02] border-gold-light bg-gold/15 text-gold-light shadow-glow-lg"
                      : "border-gold/55 bg-bg-soft/70 text-ink hover:border-gold-light hover:bg-gold/10 hover:shadow-glow active:scale-[0.98]"
                  } disabled:cursor-default`}
                >
                  {opt.text}
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
