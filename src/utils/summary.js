
import { QUESTIONS } from "../data/questions";

const getReasonLabel = (reasonValue) => {
  try {
    const reasonQ = QUESTIONS.find((q) => q.id === "referral_reason");
    if (reasonQ && Array.isArray(reasonQ.options)) {
      const opt = reasonQ.options.find((o) => o.value === reasonValue);
      if (opt) return opt.label;
    }
  } catch {}
  return reasonValue;
};

export const buildSummary = (answersLike) => {
  const savedName = answersLike?.name || "";
  const savedEmail = answersLike?.email || "";
  const savedPhone = answersLike?.phone || "";
  const savedDob = answersLike?.dob || "";
  const savedReferral =
    answersLike?.refer_physician_name || answersLike?.physician || "";
  const savedReasonValue = answersLike?.referral_reason || "";
  const savedReasonLabel = getReasonLabel(savedReasonValue);

  const summaryLines = [
    `Great! I have received your information.`,
    `Full name: ${savedName || "N/A"}`,
    `Email: ${savedEmail || "N/A"}`,
    `Phone: ${savedPhone || "N/A"}`,
    `DOB: ${savedDob || "N/A"}`,
    `Referral: ${savedReferral || "N/A"}`,
    `Reason: ${savedReasonLabel || "N/A"}`,
    ``,
    `Is that correct?`,
  ];

  return summaryLines.join("\n");
};

export const mergeWithStoredAnswers = (fallbackAnswers) => {
  let merged = { ...fallbackAnswers };
  try {
    const savedDataRaw = localStorage.getItem("questionnaire");
    if (savedDataRaw) {
      const savedData = JSON.parse(savedDataRaw);
      const a = savedData?.answers || {};
      merged = {
        ...merged,
        name: a.name ?? merged.name,
        email: a.email ?? merged.email,
        phone: a.phone ?? merged.phone,
        dob: a.dob ?? merged.dob,
        refer_physician_name:
          a.refer_physician_name ?? merged.refer_physician_name,
        physician: a.physician ?? merged.physician,
        referral_reason: a.referral_reason ?? merged.referral_reason,
      };
    }
  } catch (e) {
    // ignore parse errors and proceed with fallback
  }
  return merged;
};
