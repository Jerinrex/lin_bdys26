import emailjs from "@emailjs/browser";
import { SITE } from "@/config/site";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

function formatAnswers(answers) {
  return answers.map((a, i) => `${i + 1}. ${a.question}\n   Answer: ${a.answer}`).join("\n\n");
}

function formatTime() {
  try {
    return new Date().toLocaleString("en-IN", { timeZone: SITE.timezone, dateStyle: "medium", timeStyle: "short" }) + " IST";
  } catch {
    return new Date().toISOString();
  }
}

async function attempt(params) {
  await emailjs.send(SERVICE_ID, TEMPLATE_ID, params, { publicKey: PUBLIC_KEY });
}

/**
 * Sends ONE email with every question and her chosen answer.
 * Never throws: on failure it retries once silently, then gives up quietly so she is never shown an error.
 * @param {{id:string, question:string, answer:string}[]} answers
 * @returns {Promise<boolean>} true if the email was sent
 */
export async function sendQuizResults(answers) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn("[emailjs] Missing NEXT_PUBLIC_EMAILJS_* env vars, quiz results were not sent.");
    return false;
  }

  const params = {
    to_name: SITE.senderName,
    her_name: SITE.herName,
    subject: `${SITE.petName} finished the quiz 💛`,
    answers: formatAnswers(answers),
    time: formatTime(),
  };

  try {
    console.log("[emailjs] Attempting to send quiz results email...", params);
    await attempt(params);
    console.log("[emailjs] ✅ Email sent successfully!");
    return true;
  } catch (firstError) {
    console.warn("[emailjs] First attempt failed, retrying in 1.5s...", firstError);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      await attempt(params);
      console.log("[emailjs] ✅ Email sent successfully on retry!");
      return true;
    } catch (secondError) {
      console.error("[emailjs] ❌ Could not send quiz results:", secondError);
      return false;
    }
  }
}
