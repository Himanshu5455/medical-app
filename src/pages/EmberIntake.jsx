import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, useMediaQuery, useTheme, Button } from "@mui/material";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ChatHeader from "../components/chat/ChatHeader";
import ChatMessage from "../components/chat/ChatMessage";
import ChatInput from "../components/chat/ChatInput";

const WELCOME_TEXT =
  "Hello, my name is Ember.\nI am your triage assistant here at Marham Fertility Centre. It is a pleasure to have you here with us! To begin the process, please tell me your Name, last name, phone number.";

const extractNameAndPhone = (input) => {
  if (!input) return { name: "", phone: "" };
  const phoneMatch = String(input).match(/(\+?\d[\d\s\-]{6,}\d)/);
  const phone = phoneMatch ? phoneMatch[1].replace(/\s|\-/g, "") : "";
  const namePart = String(input)
    .replace(phoneMatch ? phoneMatch[1] : "", "")
    .replace(/[,;\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { name: namePart, phone };
};

const computeAge = (dobStr) => {
  if (!dobStr) return null;
  let d;
  if (typeof dobStr === "string" && dobStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [dd, mm, yyyy] = dobStr.split("/");
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  } else {
    d = new Date(dobStr);
  }
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
};

const EmberIntake = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const chatContainerRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState("intro");
  const [awaiting, setAwaiting] = useState({ type: "text" });
  const [data, setData] = useState({
    name: "",
    phone: "",
    consent: null,
    referral: "",
    email: "",
    dob: "",
    ageFlag: "", // Advanced Age if 35+
    sexAtBirth: "",
    address: "",
    healthCardFiles: [],
    ohipProvided: null,
    ohipNumber: "",
    insurance: "", // blue_cross | out_province | out_country | none
    blueCrossFiles: [],
    paymentAccepted: null,
    reasonRaw: "",
    reasonTags: [],
    ttcDuration: "", // trying to conceive duration
    returningWithinYear: null,
    medicalRecords: [],
    hasPartner: null,
    partner: {
      name: "",
      dob: "",
      healthCard: "",
      healthCardFiles: [],
      sexAtBirth: "",
      email: "",
      address: "",
      phone: "",
    },
    flags: {
      humanEscalation: false,
      referral: false,
      sprout: false,
      noReferral: false,
      blueCross: false,
      outProvince: false,
      outCountry: false,
    },
  });

  // Auto-scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    // Don't save if messages is empty (initial state)
    if (messages.length === 0) return;

    const dataToSave = {
      step,
      awaiting,
      data,
      messages,
    };
    localStorage.setItem("emberIntake", JSON.stringify(dataToSave));
  }, [step, awaiting, data, messages]);

  // Load from localStorage on mount, or initialize welcome message
  useEffect(() => {
    try {
      const saved = localStorage.getItem("emberIntake");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.step) setStep(parsed.step);
        if (parsed.awaiting) setAwaiting(parsed.awaiting);
        if (parsed.data) setData(parsed.data);
        if (parsed.messages && parsed.messages.length > 0) {
          setMessages(parsed.messages);
          return; // Don't initialize welcome if we loaded saved data
        }
      }
      // If no saved data or no saved messages, initialize welcome
      setMessages([
        {
          type: "bot",
          message: WELCOME_TEXT,
          timestamp: new Date().toISOString(),
          questionId: "intro",
          shouldStream: true,
        },
      ]);
      setAwaiting({ type: "text", questionId: "intro" });
    } catch (error) {
      console.error(
        "Failed to load ember intake data from localStorage:",
        error
      );
      // Initialize welcome on error too
      setMessages([
        {
          type: "bot",
          message: WELCOME_TEXT,
          timestamp: new Date().toISOString(),
          questionId: "intro",
          shouldStream: true,
        },
      ]);
      setAwaiting({ type: "text", questionId: "intro" });
    }
  }, []);

  const pushBot = (message, options) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "bot",
        message,
        timestamp: new Date().toISOString(),
        questionId: options?.questionId || "",
        shouldStream: true,
        options: options?.options,
        showBooleanOptions: options?.showBooleanOptions,
      },
    ]);
  };

  const clearOptionsForQuestion = (qid) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.questionId === qid
          ? { ...m, options: undefined, showBooleanOptions: undefined }
          : m
      )
    );
  };

  const pushUser = (message, questionId) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        message,
        timestamp: new Date().toISOString(),
        questionId,
      },
    ]);
  };

  const proceed = (nextStep, nextAwaiting) => {
    setStep(nextStep);
    setAwaiting(nextAwaiting);
  };

  const setFlag = (key, value = true) => {
    setData((d) => ({ ...d, flags: { ...d.flags, [key]: value } }));
  };

  const handleStreamingComplete = () => {};

  const handleOptionClick = (value, label, questionId) => {
    // Centralized option handling for steps with buttons
    if (step === "consent" && questionId === "consent") {
      pushUser(label, questionId);
      setData((d) => ({ ...d, consent: !!value }));
      if (!value) {
        pushBot(
          `I understand, ${
            data.name || "there"
          }.\nIf you don't feel comfortable sharing your information with me, we’ll refer you to one of our specialists to get in touch with you.`,
          { questionId: "consent-escalate" }
        );
        setFlag("humanEscalation", true);
        proceed("end", { type: "none" });
        return;
      }
      // Next: referral
      pushBot("Do you have a referral?", {
        questionId: "referral",
        options: [
          { value: "referral", label: "Yes I do" },
          { value: "sprout", label: "Yes, from Sprout" },
          { value: "none", label: "No, I don’t" },
        ],
      });
      proceed("referral", { type: "option", questionId: "referral" });
      return;
    }

    if (step === "referral" && questionId === "referral") {
      pushUser(label, questionId);
      const flags = {
        referral: value === "referral",
        sprout: value === "sprout",
        noReferral: value === "none",
      };
      setData((d) => ({
        ...d,
        referral: value,
        flags: { ...d.flags, ...flags },
      }));
      // Next email
      pushBot(`Okay ${data.name || ""}. Please tell me your e-mail.`, {
        questionId: "email",
      });
      proceed("email", { type: "text", questionId: "email" });
      return;
    }

    if (step === "ohipOptions" && questionId === "ohipOptions") {
      pushUser(label, questionId);
      if (value === "blue_cross") {
        setFlag("blueCross", true);
        setData((d) => ({ ...d, insurance: "blue_cross" }));
        pushBot("Do you have your Blue Cross ID to be uploaded?", {
          questionId: "blueCrossChoice",
          options: [
            { value: "upload", label: "Upload Blue Cross ID" },
            { value: "no_have", label: "I don’t have it right now" },
          ],
        });
        proceed("blueCrossChoice", {
          type: "option",
          questionId: "blueCrossChoice",
        });
        return;
      }
      if (value === "out_province" || value === "out_country") {
        if (value === "out_province") setFlag("outProvince", true);
        if (value === "out_country") setFlag("outCountry", true);
        setData((d) => ({ ...d, insurance: value }));
        pushBot(
          "In this case, the patient is responsible for paying for the consultation, okay? 200 CAD",
          {
            questionId: "payment",
            options: [
              { value: "yes", label: "Yes, proceed" },
              { value: "no", label: "No" },
            ],
          }
        );
        proceed("paymentConfirm", { type: "option", questionId: "payment" });
        return;
      }
    }

    if (step === "blueCrossChoice" && questionId === "blueCrossChoice") {
      pushUser(label, questionId);
      if (value === "upload") {
        pushBot("Please upload your Blue Cross ID", {
          questionId: "blueCrossUpload",
        });
        proceed("blueCrossUpload", {
          type: "file",
          questionId: "blueCrossUpload",
          accept: "image/*,application/pdf",
          multiple: true,
        });
        return;
      }
      if (value === "no_have") {
        // proceed directly to reason options
        pushBot(
          "Thank you for providing your information. To help us connect you with the right specialist and schedule the appropriate time, could you please tell us the main reason you are contacting the clinic today?",
          {
            questionId: "reason",
            options: [
              {
                value: "infertility",
                label: "Infertility Evaluation or Multiple Losses",
              },
              {
                value: "future_planning",
                label:
                  "Future family planning: Egg preservation, Genetic inquiries, Preconception planning",
              },
              {
                value: "donor",
                label: "Need use of donor embrios / egg / sperm",
              },
              {
                value: "medical_preservation",
                label: "Preservation for medical need",
              },
              { value: "ivf", label: "IVF" },
              {
                value: "transfer_second_opinion",
                label: "Transfer care from another clinic / Second opinion",
              },
              { value: "returning", label: "Returning patient" },
              { value: "cancer", label: "Cancer" },
              { value: "detail", label: "Detail specific symptoms" },
              { value: "other", label: "Other" },
            ],
          }
        );
        proceed("reason", { type: "option", questionId: "reason" });
        return;
      }
    }

    if (step === "paymentConfirm" && questionId === "payment") {
      pushUser(label, questionId);
      const ok = value === "yes";
      setData((d) => ({ ...d, paymentAccepted: ok }));
      if (!ok) {
        pushBot(
          `I understand, ${
            data.name || "there"
          }.\nWe’ll transfer you to one of our specialist so we can better understand your situation`,
          { questionId: "payment-escalate" }
        );
        setFlag("humanEscalation", true);
        proceed("end", { type: "none" });
        return;
      }
      // proceed to reasons
      pushBot(
        "Thank you for providing your information. To help us connect you with the right specialist and schedule the appropriate time, could you please tell us the main reason you are contacting the clinic today?",
        {
          questionId: "reason",
          options: [
            {
              value: "infertility",
              label: "Infertility Evaluation or Multiple Losses",
            },
            {
              value: "future_planning",
              label:
                "Future family planning: Egg preservation, Genetic inquiries, Preconception planning",
            },
            {
              value: "donor",
              label: "Need use of donor embrios / egg / sperm",
            },
            {
              value: "medical_preservation",
              label: "Preservation for medical need",
            },
            { value: "ivf", label: "IVF" },
            {
              value: "transfer_second_opinion",
              label: "Transfer care from another clinic / Second opinion",
            },
            { value: "returning", label: "Returning patient" },
            { value: "cancer", label: "Cancer" },
            { value: "detail", label: "Detail specific symptoms" },
            { value: "other", label: "Other" },
          ],
        }
      );
      proceed("reason", { type: "option", questionId: "reason" });
      return;
    }
    if (step === "reason" && questionId === "reason") {
      // Selectable reasons path
      pushUser(label, questionId);
      const valueToLabel = (v) => {
        switch (v) {
          case "infertility":
            return "Infertility Evaluation or Multiple Losses";
          case "future_planning":
            return "Future family planning";
          case "donor":
            return "Need use of donor embrios / egg / sperm";
          case "medical_preservation":
            return "Preservation for medical need";
          case "ivf":
            return "IVF";
          case "transfer_second_opinion":
            return "Transfer care from another clinic / Second opinion";
          case "returning":
            return "Returning patient";
          case "cancer":
            return "Cancer";
          case "immune_service":
            return "Immune Service";
          case "general_surgery":
            return "General Surgery";
          case "ginecology":
            return "Ginecology";
          case "already_pregnant":
            return "Already Preagnant";
          default:
            return String(label || value || "");
        }
      };

      const tagLabel = valueToLabel(value);
      setData((d) => ({ ...d, reasonRaw: tagLabel, reasonTags: [tagLabel] }));

      if (value === "returning") {
        pushBot("Was your last consultation within a year?", {
          questionId: "returning",
          options: [
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ],
        });
        proceed("returning", { type: "option", questionId: "returning" });
        return;
      }

      if (value === "infertility") {
        pushBot("And how long have you been trying to conceive?", {
          questionId: "ttc",
          options: [
            { value: "12+ months", label: "12 months or more" },
            { value: "6 months", label: "6 months" },
            { value: "3 months", label: "3 months" },
            { value: "<3 months", label: "Less than 3 months" },
          ],
        });
        proceed("ttc", { type: "option", questionId: "ttc" });
        return;
      }

      if (value === "cancer") {
        pushBot(
          `Okay, ${
            data.name || "there"
          }.\nI will refer you to one of our specialists right now! \nHe will be able to clarify any points related to your case ok?\nThank you very much for speaking with me and until next time!`,
          { questionId: "escalate-cancer" }
        );
        setFlag("humanEscalation", true);
        proceed("end", { type: "none" });
        return;
      }

      if (value === "detail") {
        pushBot("Please describe your specific symptoms in a few words:", {
          questionId: "reasonDetail",
        });
        proceed("reasonDetail", { type: "text", questionId: "reasonDetail" });
        return;
      }

      if (value === "other") {
        pushBot("Please select one of the following options:", {
          questionId: "otherOptions",
          options: [
            { value: "immune_service", label: "Immune Service" },
            { value: "general_surgery", label: "General Surgery" },
            { value: "ginecology", label: "Ginecology" },
            { value: "already_pregnant", label: "Already Pregnant" },
          ],
        });
        proceed("otherOptions", { type: "option", questionId: "otherOptions" });
        return;
      }

      // Default next → records upload
      pushBot(
        "Okay. Before proceeding, please send me any medical records you have available. If you don't have any at the moment, just select the “I don't have any” option below.",
        {
          questionId: "recordsChoice",
          options: [
            { value: "upload", label: "Upload Medical Records" },
            { value: "none", label: "I don’t have any" },
          ],
        }
      );
      proceed("recordsChoice", { type: "option", questionId: "recordsChoice" });
      return;
    }

    if (step === "otherOptions" && questionId === "otherOptions") {
      pushUser(label, questionId);

      const valueToLabel = (v) => {
        switch (v) {
          case "immune_service":
            return "Immune Service";
          case "general_surgery":
            return "General Surgery";
          case "ginecology":
            return "Ginecology";
          case "already_pregnant":
            return "Already Preagnant";
          default:
            return String(label || value || "");
        }
      };

      const tagLabel = valueToLabel(value);
      setData((d) => ({ ...d, reasonRaw: tagLabel, reasonTags: [tagLabel] }));

      if (value === "immune_service" || value === "general_surgery") {
        pushBot(
          `Okay, ${
            data.name || "there"
          }.\nI will refer you to one of our specialists right now! \nHe will be able to clarify any points related to your case ok?\nThank you very much for speaking with me and until next time!`,
          { questionId: "escalate-other" }
        );
        setFlag("humanEscalation", true);
        proceed("end", { type: "none" });
        return;
      }

      if (value === "ginecology" || value === "already_pregnant") {
        pushBot(
          `I'm sorry, ${
            data.name || "there"
          }, unfortunately we are unable to help you with your case.\nI recommend contacting your family doctor first, so we can help you in the best way possible!\nWe at Marham Fertility Center appreciate your contact!\nFeel free to contact us whenever you want. Our mission is to help you. I hope to see you soon.`,
          { questionId: "end-sorry" }
        );
        proceed("end", { type: "none" });
        return;
      }
    }

    if (step === "recordsChoice" && questionId === "recordsChoice") {
      // Disable options immediately to prevent double interaction
      clearOptionsForQuestion("recordsChoice");
      pushUser(label, questionId);
      if (value === "none") {
        // proceed to partner
        pushBot(
          "Do you have a partner that will participate the pocedure? (non mandatory)",
          {
            questionId: "partner",
            options: [
              { value: true, label: "Yes, I do" },
              { value: false, label: "No, I don’t" },
            ],
          }
        );
        proceed("partner", { type: "option", questionId: "partner" });
        return;
      }
      if (value === "upload") {
        pushBot("Please upload your medical records", {
          questionId: "recordsUpload",
        });
        proceed("recordsUpload", {
          type: "file",
          questionId: "recordsUpload",
          accept: "image/*,application/pdf",
          multiple: true,
        });
        return;
      }
      return;
    }

    if (step === "partner" && questionId === "partner") {
      pushUser(label, questionId);
      setData((d) => ({ ...d, hasPartner: !!value }));
      if (value) {
        pushBot("Please provide your partner's name:", {
          questionId: "partnerName",
        });
        proceed("partnerName", { type: "text", questionId: "partnerName" });
        return;
      }
      // final message
      endFlow();
      return;
    }

    if (step === "partnerName") {
      pushUser(String(value), "partnerName");
      setData((d) => ({
        ...d,
        partner: { ...d.partner, name: String(value).trim() },
      }));
      pushBot("Please provide your partner's date of birth:", {
        questionId: "partnerDob",
      });
      proceed("partnerDob", { type: "date", questionId: "partnerDob" });
      return;
    }

    if (step === "partnerDob") {
      pushUser(String(value), "partnerDob");
      setData((d) => ({
        ...d,
        partner: { ...d.partner, dob: String(value).trim() },
      }));
      pushBot("Please upload your partner's Health Card:", {
        questionId: "partnerHealthCardUpload",
      });
      proceed("partnerHealthCardUpload", {
        type: "file",
        questionId: "partnerHealthCardUpload",
        accept: "image/*,application/pdf",
        multiple: false,
      });
      return;
    }

    if (step === "partnerHealthCard") {
      // legacy path no longer used; keep for safety
      pushUser(String(value), "partnerHealthCard");
      setData((d) => ({
        ...d,
        partner: { ...d.partner, healthCard: String(value).trim() },
      }));
      pushBot("What's your partner's sex assigned at birth:", {
        questionId: "partnerSex",
        options: [
          { value: "Male", label: "Male" },
          { value: "Female", label: "Female" },
        ],
      });
      proceed("partnerSex", { type: "option", questionId: "partnerSex" });
      return;
    }

    if (step === "partnerSex" && questionId === "partnerSex") {
      pushUser(label, questionId);
      setData((d) => ({
        ...d,
        partner: { ...d.partner, sexAtBirth: String(value) },
      }));
      pushBot("Please provide your partner's e-mail:", {
        questionId: "partnerEmail",
      });
      proceed("partnerEmail", { type: "text", questionId: "partnerEmail" });
      return;
    }

    if (step === "partnerEmail") {
      pushUser(String(value), "partnerEmail");
      setData((d) => ({
        ...d,
        partner: { ...d.partner, email: String(value).trim() },
      }));
      pushBot("Please provide your partner's address:", {
        questionId: "partnerAddress",
      });
      proceed("partnerAddress", {
        type: "text",
        questionId: "partnerAddress",
      });
      return;
    }

    if (step === "partnerAddress") {
      pushUser(String(value), "partnerAddress");
      setData((d) => ({
        ...d,
        partner: { ...d.partner, address: String(value).trim() },
      }));
      pushBot("Please provide your partner's phone number:", {
        questionId: "partnerPhone",
      });
      proceed("partnerPhone", { type: "text", questionId: "partnerPhone" });
      return;
    }

    if (step === "partnerPhone") {
      pushUser(String(value), "partnerPhone");
      setData((d) => ({
        ...d,
        partner: { ...d.partner, phone: String(value).trim() },
      }));
      endFlow();
      return;
    }

    // Fallback: if this option belongs to the current step/question, route it to the generic answer handler
    const activeQuestionId = awaiting?.questionId || step;
    if (questionId === activeQuestionId) {
      // Let the generic answer handler manage adding the user message
      handleAnswer(value);
    }
  };

  const categorizeReason = (text) => {
    const tags = [];
    const t = (text || "").toLowerCase();
    const map = [
      [
        "Infertility Evaluation or Multiple Losses",
        ["infertility", "multiple loss", "miscarriage"],
      ],
      [
        "Future family planning",
        ["egg preservation", "genetic", "preconception"],
      ],
      [
        "Need use of donor embrios / egg / sperm",
        ["donor", "embryo", "sperm", "egg donor"],
      ],
      ["Preservation for medical need", ["medical preservation"]],
      ["IVF", ["ivf"]],
      [
        "Transfer care from another clinic / Second opinion",
        ["transfer care", "second opinion"],
      ],
      ["Returning patient", ["returning", "follow up"]],
      ["Cancer", ["cancer", "oncology"]],
      ["Immune Service", ["immune"]],
      ["General Surgery", ["surgery"]],
      ["Ginecology", ["ginec", "gyne", "gynecology"]],
      ["Already Preagnant", ["pregnant", "pregnancy"]],
    ];
    map.forEach(([label, keys]) => {
      if (keys.some((k) => t.includes(k))) tags.push(label);
    });
    return Array.from(new Set(tags));
  };

  const endFlow = () => {
    pushBot(
      `Thank you very much ${
        data.name || ""
      }!\nThat’s all for now.\nOne of our specialists will contact you to schedule your appointment!\nWe at Marham Fertility Center appreciate your contact!\nFeel free to contact us whenever you want. Our mission is to help you. I hope to see you soon.`,
      { questionId: "final" }
    );
    setStep("end");
    setAwaiting({ type: "none" });
  };

  const handleAnswer = (value) => {
    const q = awaiting?.questionId || step;
    if (awaiting.type === "file") {
      // Convert File objects to metadata for storage
      const fileMetadata = Array.isArray(value)
        ? value.map((file) => ({
            name: file.name || "unknown",
            size: file.size || 0,
            type: file.type || "unknown",
            lastModified: file.lastModified || Date.now(),
          }))
        : [];

      pushUser(`${fileMetadata.length} file(s) uploaded`, q);

      if (step === "blueCrossUpload") {
        setData((d) => ({ ...d, blueCrossFiles: fileMetadata }));
        // proceed to reason
        pushBot(
          "Thank you for providing your information. To help us connect you with the right specialist and schedule the appropriate time, could you please tell us the main reason you are contacting the clinic today?",
          {
            questionId: "reason",
            options: [
              {
                value: "infertility",
                label: "Infertility Evaluation or Multiple Losses",
              },
              {
                value: "future_planning",
                label:
                  "Future family planning: Egg preservation, Genetic inquiries, Preconception planning",
              },
              {
                value: "donor",
                label: "Need use of donor embrios / egg / sperm",
              },
              {
                value: "medical_preservation",
                label: "Preservation for medical need",
              },
              { value: "ivf", label: "IVF" },
              {
                value: "transfer_second_opinion",
                label: "Transfer care from another clinic / Second opinion",
              },
              { value: "returning", label: "Returning patient" },
              { value: "cancer", label: "Cancer" },
              { value: "detail", label: "Detail specific symptoms" },
              { value: "other", label: "Other" },
            ],
          }
        );
        proceed("reason", { type: "option", questionId: "reason" });
        return;
      }
      if (step === "healthCardUpload") {
        setData((d) => ({ ...d, healthCardFiles: fileMetadata }));
        // proceed to sex at birth question
        pushBot("What's your sex assigned at birth:", {
          questionId: "sex",
          options: [
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
          ],
        });
        proceed("sex", { type: "option", questionId: "sex" });
        return;
      }
      if (step === "recordsUpload") {
        setData((d) => ({ ...d, medicalRecords: fileMetadata }));
        // partner question
        pushBot(
          "Do you have a partner that will participate the pocedure? (non mandatory)",
          {
            questionId: "partner",
            options: [
              { value: true, label: "Yes, I do" },
              { value: false, label: "No, I don't" },
            ],
          }
        );
        proceed("partner", { type: "option", questionId: "partner" });
        return;
      }
      if (step === "partnerHealthCardUpload") {
        setData((d) => ({
          ...d,
          partner: { ...d.partner, healthCardFiles: fileMetadata },
        }));
        pushBot("What's your partner's sex assigned at birth:", {
          questionId: "partnerSex",
          options: [
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
          ],
        });
        proceed("partnerSex", { type: "option", questionId: "partnerSex" });
        return;
      }
      return;
    }

    // Push user text
    pushUser(String(value), q);

    if (step === "intro") {
      const { name, phone } = extractNameAndPhone(String(value));
      setData((d) => ({ ...d, name, phone }));
      pushBot(
        `Thank you very much, ${
          name || "there"
        }!\nBefore we move on to the next steps, I would like to know if you consent to sharing your personal information.\nYour data is 100% secure with us and will only be used to provide you the best support, okay?`,
        { questionId: "consent", showBooleanOptions: true }
      );
      proceed("consent", { type: "option", questionId: "consent" });
      return;
    }

    if (step === "email") {
      setData((d) => ({ ...d, email: String(value).trim() }));
      pushBot("Now, tell me your Date of birth:", { questionId: "dob" });
      proceed("dob", { type: "date", questionId: "dob" });
      return;
    }

    if (step === "dob") {
      const dob = String(value).trim();
      const age = computeAge(dob);
      const ageFlag = age !== null && age >= 35 ? "Advanced Age" : "";
      setData((d) => ({ ...d, dob, ageFlag }));
      // Ask for main health card upload (file)
      pushBot("Please upload your Health Card:", {
        questionId: "healthCardUpload",
      });
      proceed("healthCardUpload", {
        type: "file",
        questionId: "healthCardUpload",
        accept: "image/*,application/pdf",
        multiple: false,
      });
      return;
    }

    if (step === "sex") {
      // value comes from option; but safeguard here if typed
      setData((d) => ({ ...d, sexAtBirth: String(value) }));
      pushBot("And finally, what’s your address?", { questionId: "address" });
      proceed("address", { type: "text", questionId: "address" });
      return;
    }

    if (step === "address") {
      setData((d) => ({ ...d, address: String(value) }));
      pushBot("Do you have a OHIP number?", {
        questionId: "ohip",
        options: [
          { value: true, label: "Yes, I do" },
          { value: false, label: "No, I don’t" },
        ],
      });
      proceed("ohip", { type: "option", questionId: "ohip" });
      return;
    }

    if (step === "ohip") {
      const yes = String(value) === "true" || value === true;
      setData((d) => ({ ...d, ohipProvided: yes }));
      if (yes) {
        pushBot("Okay, please tell me your OHIP number.", {
          questionId: "ohipNumber",
        });
        proceed("ohipNumber", { type: "text", questionId: "ohipNumber" });
        return;
      }
      // categorize options
      pushBot("Do you fit any of the available options below?", {
        questionId: "ohipOptions",
        options: [
          { value: "blue_cross", label: "I am Blue Cross insured" },
          { value: "out_province", label: "I am from out of the province" },
          { value: "out_country", label: "I am from out of the country" },
        ],
      });
      proceed("ohipOptions", { type: "option", questionId: "ohipOptions" });
      return;
    }

    if (step === "ohipNumber") {
      setData((d) => ({ ...d, ohipNumber: String(value).trim() }));
      // proceed to reason
      pushBot(
        "Thank you for providing your information. To help us connect you with the right specialist and schedule the appropriate time, could you please tell us the main reason you are contacting the clinic today?",
        {
          questionId: "reason",
          options: [
            {
              value: "infertility",
              label: "Infertility Evaluation or Multiple Losses",
            },
            {
              value: "future_planning",
              label:
                "Future family planning: Egg preservation, Genetic inquiries, Preconception planning",
            },
            {
              value: "donor",
              label: "Need use of donor embrios / egg / sperm",
            },
            {
              value: "medical_preservation",
              label: "Preservation for medical need",
            },
            { value: "ivf", label: "IVF" },
            {
              value: "transfer_second_opinion",
              label: "Transfer care from another clinic / Second opinion",
            },
            { value: "returning", label: "Returning patient" },
            { value: "cancer", label: "Cancer" },
            { value: "detail", label: "Detail specific symptoms" },
            { value: "other", label: "Other" },
          ],
        }
      );
      proceed("reason", { type: "option", questionId: "reason" });
      return;
    }
    if (step === "reasonDetail") {
      // Free-text detail after selecting detail path
      const reasonText = String(value);
      const tags = categorizeReason(reasonText);
      setData((d) => ({
        ...d,
        reasonRaw: reasonText,
        reasonTags: tags.length ? tags : ["Detail specific symptoms"],
      }));
      // proceed to records
      pushBot(
        "Okay. Before proceeding, please send me any medical records you have available. If you don't have any at the moment, just select the “I don't have any” option below.",
        {
          questionId: "recordsChoice",
          options: [
            { value: "upload", label: "Upload Medical Records" },
            { value: "none", label: "I don’t have any" },
          ],
        }
      );
      proceed("recordsChoice", { type: "option", questionId: "recordsChoice" });
      return;
    }

    if (step === "reason") {
      const reasonText = String(value);
      const tags = categorizeReason(reasonText);
      setData((d) => ({ ...d, reasonRaw: reasonText, reasonTags: tags }));

      // Rules
      if (tags.includes("Returning patient")) {
        pushBot("Was your last consultation within a year?", {
          questionId: "returning",
          options: [
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ],
        });
        proceed("returning", { type: "option", questionId: "returning" });
        return;
      }

      if (
        tags.includes("Infertility Evaluation or Multiple Losses") ||
        reasonText.toLowerCase().includes("conceive")
      ) {
        pushBot("And how long have you been trying to conceive?", {
          questionId: "ttc",
          options: [
            { value: "12+ months", label: "12 months or more" },
            { value: "6 months", label: "6 months" },
            { value: "3 months", label: "3 months" },
            { value: "<3 months", label: "Less than 3 months" },
          ],
        });
        proceed("ttc", { type: "option", questionId: "ttc" });
        return;
      }

      if (tags.includes("Immune Service") || tags.includes("General Surgery")) {
        pushBot(
          `Okay, ${
            data.name || "there"
          }.\nI will refer you to one of our specialists right now! \nHe will be able to clarify any points related to your case ok?\nThank you very much for speaking with me and until next time!`,
          { questionId: "escalate-other" }
        );
        setFlag("humanEscalation", true);
        proceed("end", { type: "none" });
        return;
      }

      if (tags.includes("Ginecology") || tags.includes("Already Preagnant")) {
        pushBot(
          `I'm sorry, ${
            data.name || "there"
          }, unfortunately we are unable to help you with your case.\nI recommend contacting your family doctor first, so we can help you in the best way possible!\nWe at Marham Fertility Center appreciate your contact!\nFeel free to contact us whenever you want. Our mission is to help you. I hope to see you soon.`,
          { questionId: "end-sorry" }
        );
        proceed("end", { type: "none" });
        return;
      }

      // Default next → records upload
      pushBot(
        "Okay. Before proceeding, please send me any medical records you have available. If you don't have any at the moment, just select the “I don't have any” option below.",
        {
          questionId: "recordsChoice",
          options: [
            { value: "upload", label: "Upload Medical Records" },
            { value: "none", label: "I don’t have any" },
          ],
        }
      );
      proceed("recordsChoice", { type: "option", questionId: "recordsChoice" });
      return;
    }

    if (step === "returning") {
      const yes = String(value) === "true" || value === true;
      setData((d) => ({ ...d, returningWithinYear: yes }));
      if (!yes) {
        pushBot(
          `Okay, ${
            data.name || "there"
          }.\nI will refer you to one of our specialists right now! \nHe will be able to clarify any points related to your case ok?\nThank you very much for speaking with me and until next time!`,
          { questionId: "returning-escalate" }
        );
        setFlag("humanEscalation", true);
        proceed("end", { type: "none" });
        return;
      }
      // proceed to records
      pushBot(
        "Okay. Before proceeding, please send me any medical records you have available. If you don't have any at the moment, just select the “I don't have any” option below.",
        {
          questionId: "recordsChoice",
          options: [
            { value: "upload", label: "Upload Medical Records" },
            { value: "none", label: "I don’t have any" },
          ],
        }
      );
      proceed("recordsChoice", { type: "option", questionId: "recordsChoice" });
      return;
    }

    if (step === "ttc") {
      setData((d) => ({ ...d, ttcDuration: String(value) }));
      pushBot(
        "Okay. Before proceeding, please send me any medical records you have available. If you don't have any at the moment, just select the “I don't have any” option below.",
        {
          questionId: "recordsChoice",
          options: [
            { value: "upload", label: "Upload Medical Records" },
            { value: "none", label: "I don’t have any" },
          ],
        }
      );
      proceed("recordsChoice", { type: "option", questionId: "recordsChoice" });
      return;
    }

    if (step === "recordsChoice") {
      if (String(value) === "upload") {
        pushBot("Please upload your medical records", {
          questionId: "recordsUpload",
        });
        proceed("recordsUpload", {
          type: "file",
          questionId: "recordsUpload",
          accept: "image/*,application/pdf",
          multiple: true,
        });
        return;
      }
      // none handled in option click to go to partner
      return;
    }

    // Partner field handlers (for text inputs)
    if (step === "partnerName") {
      setData((d) => ({
        ...d,
        partner: { ...d.partner, name: String(value).trim() },
      }));
      pushBot("Please provide your partner's date of birth:", {
        questionId: "partnerDob",
      });
      proceed("partnerDob", { type: "date", questionId: "partnerDob" });
      return;
    }

    if (step === "partnerDob") {
      setData((d) => ({
        ...d,
        partner: { ...d.partner, dob: String(value).trim() },
      }));
      pushBot("Please upload your partner's Health Card:", {
        questionId: "partnerHealthCardUpload",
      });
      proceed("partnerHealthCardUpload", {
        type: "file",
        questionId: "partnerHealthCardUpload",
        accept: "image/*,application/pdf",
        multiple: false,
      });
      return;
    }

    if (step === "partnerEmail") {
      setData((d) => ({
        ...d,
        partner: { ...d.partner, email: String(value).trim() },
      }));
      pushBot("Please provide your partner's address:", {
        questionId: "partnerAddress",
      });
      proceed("partnerAddress", {
        type: "text",
        questionId: "partnerAddress",
      });
      return;
    }

    if (step === "partnerAddress") {
      setData((d) => ({
        ...d,
        partner: { ...d.partner, address: String(value).trim() },
      }));
      pushBot("Please provide your partner's phone number:", {
        questionId: "partnerPhone",
      });
      proceed("partnerPhone", { type: "text", questionId: "partnerPhone" });
      return;
    }

    if (step === "partnerPhone") {
      setData((d) => ({
        ...d,
        partner: { ...d.partner, phone: String(value).trim() },
      }));
      endFlow();
      return;
    }
  };

  const currentQuestion = useMemo(() => {
    // Map to ChatInput question model
    if (awaiting.type === "none") return null;
    const q = { id: awaiting.questionId || step, question: "", type: "text" };
    if (awaiting.type === "option") return null; // options shown in ChatMessage
    if (awaiting.type === "file") {
      return {
        ...q,
        type: "file",
        accept: awaiting.accept,
        multiple: awaiting.multiple,
      };
    }
    if (awaiting.type === "date") {
      return { ...q, type: "date" };
    }
    // default text
    return q;
  }, [awaiting, step]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "#f8f9fa",
      }}
    >
      {!isMobile && <Navbar />}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          pt: isMobile ? 0 : 1,
          pb: isMobile ? 0 : 1,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: "100%",
            maxWidth: isMobile ? "100%" : "800px",
            display: "flex",
            flexDirection: "column",
            bgcolor: "white",
            overflow: "hidden",
            ...(isMobile
              ? {}
              : { borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }),
          }}
        >
          <ChatHeader
            isMobile={isMobile}
            hasUserStartedMessaging={messages.some((m) => m.type === "user")}
            onStartNewChat={() => {
              // Clear localStorage
              localStorage.removeItem("emberIntake");

              setMessages([
                {
                  type: "bot",
                  message: WELCOME_TEXT,
                  timestamp: new Date().toISOString(),
                  questionId: "intro",
                  shouldStream: true,
                },
              ]);
              setData((d) => ({
                ...d,
                name: "",
                phone: "",
                consent: null,
                referral: "",
                email: "",
                dob: "",
                ageFlag: "",
                sexAtBirth: "",
                address: "",
                healthCardFiles: [],
                ohipProvided: null,
                ohipNumber: "",
                insurance: "",
                blueCrossFiles: [],
                paymentAccepted: null,
                reasonRaw: "",
                reasonTags: [],
                ttcDuration: "",
                returningWithinYear: null,
                medicalRecords: [],
                hasPartner: null,
                partner: {
                  name: "",
                  dob: "",
                  healthCard: "",
                  healthCardFiles: [],
                  sexAtBirth: "",
                  email: "",
                  address: "",
                  phone: "",
                },
                flags: {
                  humanEscalation: false,
                  referral: false,
                  sprout: false,
                  noReferral: false,
                  blueCross: false,
                  outProvince: false,
                  outCountry: false,
                },
              }));
              setStep("intro");
              setAwaiting({ type: "text", questionId: "intro" });
            }}
          />

          <Box
            ref={chatContainerRef}
            sx={{
              flexGrow: 1,
              overflow: "auto",
              bgcolor: "#f8f9fa",
              backgroundImage: isMobile
                ? "none"
                : "linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)",
              display: "flex",
              flexDirection: "column",
              px: isMobile ? 1 : 3,
              py: 2,
              minHeight: 0,
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": {
                background: "#dee2e6",
                borderRadius: "3px",
              },
            }}
          >
            {messages.map((m, i) => (
              <ChatMessage
                key={i}
                message={m}
                onOptionClick={handleOptionClick}
                onStreamingComplete={handleStreamingComplete}
              />
            ))}
          </Box>

          {/* Input area: hidden for option-only or end */}
          {step !== "end" && currentQuestion && (
            <Box
              sx={{
                bgcolor: "white",
                borderTop: "1px solid #e0e0e0",
                p: isMobile ? 1 : 2,
                flexShrink: 0,
                ...(isMobile
                  ? {}
                  : { borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }),
              }}
            >
              <ChatInput
                question={currentQuestion}
                currentAnswer={""}
                onAnswer={handleAnswer}
                disabled={false}
                isStreamingActive={false}
              />
            </Box>
          )}
        </Box>
      </Box>
      {!isMobile && <Footer />}
    </Box>
  );
};

export default EmberIntake;
