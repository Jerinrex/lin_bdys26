"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QUIZ } from "@/data/quizData";
import { sendQuizResults } from "@/lib/emailjs";
import useUnlockGuard from "@/hooks/useUnlockGuard";
import PageTransition from "@/components/common/PageTransition";
import SectionHeading from "@/components/common/SectionHeading";
import GoldenBird from "@/components/bird/GoldenBird";
import HeartBurst from "@/components/effects/HeartBurst";
import QuizProgress from "@/components/quiz/QuizProgress";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizComplete from "@/components/quiz/QuizComplete";

const RESPONSE_MS = 2200;

function Quiz() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null); // option id for the current question
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [origin, setOrigin] = useState({ x: 50, y: 60 });
  const [reactKey, setReactKey] = useState(0);

  const wrapRef = useRef(null);
  const timerRef = useRef(null);
  const sentRef = useRef(false); // guarantees exactly one email per completed quiz

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const question = QUIZ[index];

  const handleSelect = (optionIdOrText, event) => {
    if (selected) return;

    let answerText = "";
    if (question.type === "input") {
      answerText = optionIdOrText;
      setSelected("input-submitted");
    } else {
      const option = question.options?.find((o) => o.id === optionIdOrText);
      answerText = option ? option.text : optionIdOrText;
      setSelected(optionIdOrText);
    }

    // heart burst from where she tapped
    const wrap = wrapRef.current?.getBoundingClientRect();
    const target = event?.currentTarget?.getBoundingClientRect();
    if (wrap && target) {
      setOrigin({
        x: ((target.left + target.width / 2 - wrap.left) / wrap.width) * 100,
        y: ((target.top + target.height / 2 - wrap.top) / wrap.height) * 100,
      });
    }
    setBurstKey((k) => k + 1);
    setReactKey((k) => k + 1);

    const nextAnswers = [...answers, { id: question.id, question: question.question, answer: answerText }];
    setAnswers(nextAnswers);

    const delay = question.type === "input" ? 3000 : RESPONSE_MS;
    timerRef.current = setTimeout(() => {
      if (index + 1 >= QUIZ.length) {
        setFinished(true);
        if (!sentRef.current) {
          sentRef.current = true;
          sendQuizResults(nextAnswers); // fire and forget, never blocks or shows errors
        }
      } else {
        setIndex((i) => i + 1);
        setSelected(null);
      }
    }, delay);
  };

  return (
    <PageTransition className="flex flex-col items-center px-5 pb-12 pt-16">
      <div className="w-full max-w-md">
        {!finished && (
          <>
            <SectionHeading title="Our Moments & Us" className="mb-5" />
            <QuizProgress total={QUIZ.length} answered={answers.length} />
            <div className="mt-3 flex justify-center">
              <GoldenBird size={64} reactKey={reactKey} />
            </div>
          </>
        )}

        <div ref={wrapRef} className="relative mt-4">
          <HeartBurst burstKey={burstKey} origin={origin} />
          <AnimatePresence mode="wait">
            {finished ? (
              <QuizComplete key="complete" />
            ) : (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
              >
                <QuizQuestion question={question} selectedId={selected} disabled={!!selected} onSelect={handleSelect} />
                <div className="mt-5 min-h-[64px] text-center" aria-live="polite">
                  <AnimatePresence>
                    {selected && (
                      <motion.p
                        key={selected}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="font-script text-3xl leading-snug text-gold-light"
                      >
                        {question.type === "input"
                          ? question.responses?.default
                          : question.responses?.[selected]}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}

export default function QuizPage() {
  const allowed = useUnlockGuard();
  if (!allowed) return null;
  return <Quiz />;
}
