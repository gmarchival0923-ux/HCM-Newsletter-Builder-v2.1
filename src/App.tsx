import React, { useState, useEffect, useRef } from "react";
import { 
  Settings, 
  Mail, 
  FileText, 
  Layers, 
  Activity, 
  Image as ImageIcon, 
  Send, 
  RefreshCw, 
  Check, 
  Copy, 
  ExternalLink, 
  Eye, 
  EyeOff,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Smartphone, 
  Monitor, 
  Download, 
  Award, 
  HelpCircle, 
  ListTodo, 
  Layout, 
  Sparkles,
  CheckCircle2,
  Trash2,
  Plus,
  Link as LinkIcon,
  Bold,
  Italic,
  Underline,
  ListOrdered
} from "lucide-react";
import { NewsletterFields, AwardItem } from "./types";
import { defaultNewsletterFields } from "./defaultData";
import { renderModernHTML, renderLegacyHTML } from "./templateRenderer";

export default function App() {
  const [fields, setFields] = useState<NewsletterFields>(defaultNewsletterFields);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [openSection, setOpenSection] = useState<string>("header");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<{
    success: boolean;
    filename: string;
    path: string;
    htmlContent: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const editorParagraphsRef = useRef<HTMLTextAreaElement>(null);
  const hotTakesParagraphsRef = useRef<HTMLTextAreaElement>(null);
  const leadStoryParagraphsRef = useRef<HTMLTextAreaElement>(null);

  const [linkUrl, setLinkUrl] = useState("");
  const [linkPrompt, setLinkPrompt] = useState<{
    activeField: "editorParagraphs" | "hotTakesParagraphs" | "leadStoryParagraphs";
    selectedText: string;
    selectionStart: number;
    selectionEnd: number;
  } | null>(null);

  const handleOpenLinkPrompt = (
    fieldKey: "editorParagraphs" | "hotTakesParagraphs" | "leadStoryParagraphs",
    ref: React.RefObject<HTMLTextAreaElement | null>
  ) => {
    const textarea = ref.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const val = textarea.value || "";
    const selectedText = val.substring(start, end);

    setLinkPrompt({
      activeField: fieldKey,
      selectedText,
      selectionStart: start,
      selectionEnd: end
    });
    setLinkUrl("");
  };

  const insertLink = (fieldKey: "editorParagraphs" | "hotTakesParagraphs" | "leadStoryParagraphs") => {
    if (!linkPrompt) return;
    let url = linkUrl.trim();
    if (url && !/^https?:\/\//i.test(url) && !url.startsWith("#") && !url.startsWith("mailto:")) {
      url = "https://" + url;
    }
    const text = linkPrompt.selectedText || "Link";
    const linkHtml = `<a href="${url || '#'}" target="_blank" style="color: #2563eb; text-decoration: underline;">${text}</a>`;
    const currentValue = fields[fieldKey] || "";
    const start = linkPrompt.selectionStart;
    const end = linkPrompt.selectionEnd;
    const newValue = currentValue.substring(0, start) + linkHtml + currentValue.substring(end);

    setFields(prev => ({
      ...prev,
      [fieldKey]: newValue
    }));
    setLinkPrompt(null);
    setLinkUrl("");

    const textareaRef = fieldKey === "editorParagraphs" 
      ? editorParagraphsRef 
      : fieldKey === "hotTakesParagraphs" 
      ? hotTakesParagraphsRef 
      : leadStoryParagraphsRef;

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = start + linkHtml.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 50);
  };

  // Bullet points formatting helper
  const handleInsertBulletPoints = (
    fieldKey: "editorParagraphs" | "hotTakesParagraphs" | "leadStoryParagraphs",
    ref: React.RefObject<HTMLTextAreaElement | null>
  ) => {
    const textarea = ref.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const val = textarea.value || "";
    
    const selectedText = val.substring(start, end);
    let bulletedText = "";
    
    if (selectedText) {
      bulletedText = selectedText
        .split("\n")
        .map(line => {
          const trimmed = line.trim();
          if (!trimmed) return "";
          if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
            return line;
          }
          return `• ${line}`;
        })
        .join("\n");
    } else {
      bulletedText = "• ";
    }
    
    const newValue = val.substring(0, start) + bulletedText + val.substring(end);
    setFields(prev => ({
      ...prev,
      [fieldKey]: newValue
    }));
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newCursorPos = start + bulletedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 50);
  };

  // Text formatting helper for bold, italic, underline tags
  const handleFormatText = (
    fieldKey: "editorParagraphs" | "hotTakesParagraphs" | "leadStoryParagraphs",
    ref: React.RefObject<HTMLTextAreaElement | null>,
    tag: "b" | "i" | "u"
  ) => {
    const textarea = ref.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const val = textarea.value || "";
    const selectedText = val.substring(start, end);

    const openTag = `<${tag}>`;
    const closeTag = `</${tag}>`;
    const formattedText = `${openTag}${selectedText}${closeTag}`;

    const newValue = val.substring(0, start) + formattedText + val.substring(end);
    setFields(prev => ({
      ...prev,
      [fieldKey]: newValue
    }));

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        if (selectedText) {
          const newEnd = start + formattedText.length;
          textarea.setSelectionRange(newEnd, newEnd);
        } else {
          const newCursorPos = start + openTag.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
      }
    }, 50);
  };

  // Numbered list formatting helper
  const handleInsertNumberedList = (
    fieldKey: "editorParagraphs" | "hotTakesParagraphs" | "leadStoryParagraphs",
    ref: React.RefObject<HTMLTextAreaElement | null>
  ) => {
    const textarea = ref.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const val = textarea.value || "";
    const selectedText = val.substring(start, end);

    let numberedText = "";
    if (selectedText) {
      let count = 1;
      numberedText = selectedText
        .split("\n")
        .map(line => {
          const trimmed = line.trim();
          if (!trimmed) return "";
          if (/^\d+[\.\)]/.test(trimmed)) {
            return line;
          }
          const formatted = `${count}. ${line}`;
          count++;
          return formatted;
        })
        .join("\n");
    } else {
      numberedText = "1. ";
    }

    const newValue = val.substring(0, start) + numberedText + val.substring(end);
    setFields(prev => ({
      ...prev,
      [fieldKey]: newValue
    }));

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newCursorPos = start + numberedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 50);
  };

  // Move Awards/Nominations Card Up/Down in the dynamic cards order
  const handleMoveAwardsCard = (direction: "up" | "down") => {
    setFields(prev => {
      const currentPos = prev.awardsPositionIndex !== undefined ? prev.awardsPositionIndex : prev.spotlightCards.length;
      let newPos = currentPos;
      if (direction === "up") {
        newPos = Math.max(0, currentPos - 1);
      } else {
        newPos = Math.min(prev.spotlightCards.length, currentPos + 1);
      }
      return {
        ...prev,
        awardsPositionIndex: newPos
      };
    });
  };

  // Add a new poll choice option
  const handleAddPollChoice = () => {
    setFields(prev => {
      const currentChoices = prev.pollChoices || [];
      return {
        ...prev,
        pollChoices: [...currentChoices, { text: "", url: "" }]
      };
    });
  };

  // Remove a poll choice option
  const handleRemovePollChoice = (index: number) => {
    setFields(prev => {
      const currentChoices = prev.pollChoices || [];
      const updatedChoices = currentChoices.filter((_, i) => i !== index);
      return {
        ...prev,
        pollChoices: updatedChoices
      };
    });
  };

  // Edit individual poll choice fields
  const handlePollChoiceChange = (index: number, key: "text" | "url", value: string) => {
    setFields(prev => {
      const currentChoices = prev.pollChoices || [];
      const updatedChoices = currentChoices.map((choice, i) => {
        if (i === index) {
          return { ...choice, [key]: value };
        }
        return choice;
      });
      return {
        ...prev,
        pollChoices: updatedChoices
      };
    });
  };

  // Section reordering and movement handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const sequence = [...(fields.sectionsOrder || ["editor", "topAd", "leadStory", "hotTakes", "columns", "bottomAd", "poll"])];
    const draggedItem = sequence[draggedIndex];
    sequence.splice(draggedIndex, 1);
    sequence.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setFields(prev => ({ ...prev, sectionsOrder: sequence }));
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const sequence = [...(fields.sectionsOrder || ["editor", "topAd", "leadStory", "hotTakes", "columns", "bottomAd", "poll"])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < sequence.length) {
      const temp = sequence[index];
      sequence[index] = sequence[targetIndex];
      sequence[targetIndex] = temp;
      setFields(prev => ({ ...prev, sectionsOrder: sequence }));
    }
  };

  // Swap spotlight card positions
  const handleMoveCard = (index: number, direction: "up" | "down") => {
    const updated = [...fields.spotlightCards];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < updated.length) {
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      handleChange("spotlightCards", updated);
    }
  };

  // Add new spotlight card
  const handleAddCard = () => {
    const uniqueId = `card_${Date.now()}`;
    const newCard = {
      id: uniqueId,
      label: "New Spotlight Card",
      title: "New Spotlight Title",
      img: "https://public-cdn.hr.com/remoteimages/website-images/community-emailer/2025/2026/hcm-sales-and-marketing/March/podcast-spotlight-350x70.jpg",
      content: "This is a new spotlight card description. Customize it with your content.",
      buttonText: "WATCH NOW ▶",
      buttonUrl: "https://web.hr.com",
      badgeClass: "badge-podcast"
    };
    const updated = [...fields.spotlightCards, newCard];
    handleChange("spotlightCards", updated);
  };

  // Delete/Remove a spotlight card
  const handleDeleteCard = (index: number) => {
    if (window.confirm("Are you sure you want to remove this feature card?")) {
      const updated = fields.spotlightCards.filter((_, i) => i !== index);
      handleChange("spotlightCards", updated);
    }
  };

  // Dynamic card input field changes
  const handleCardFieldChange = (index: number, key: string, value: string) => {
    const updated = [...fields.spotlightCards];
    updated[index] = {
      ...updated[index],
      [key]: value
    };
    handleChange("spotlightCards", updated);
  };

  // Section undo snapshots
  const [sectionBackups, setSectionBackups] = useState<Record<string, any>>({});

  const handleClearSection = (sectionId: string, keys: (keyof NewsletterFields)[]) => {
    // Save backup snapshot
    const backup: Record<string, any> = {};
    keys.forEach(k => {
      backup[k] = fields[k];
    });
    setSectionBackups(prev => ({
      ...prev,
      [sectionId]: backup
    }));

    // Clear specific fields
    setFields(prev => {
      const updated = { ...prev };
      keys.forEach(k => {
        if (k === "awardsList" || k === "pollChoices") {
          updated[k] = [];
        } else if (k === "theme") {
          // do not clear theme selection
        } else {
          (updated as any)[k] = "";
        }
      });
      return updated;
    });

    setStatusMessage({ type: "success", text: `Cleared section fields! Click Undo to restore.` });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleUndoSection = (sectionId: string) => {
    const backup = sectionBackups[sectionId];
    if (!backup) return;

    setFields(prev => ({
      ...prev,
      ...backup
    }));

    // Remove backup once restored
    setSectionBackups(prev => {
      const updated = { ...prev };
      delete updated[sectionId];
      return updated;
    });

    setStatusMessage({ type: "success", text: `Restored section fields!` });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Clear/Undo for individual spotlight cards
  const handleClearSpotlightCard = (cardId: string, index: number) => {
    const card = fields.spotlightCards[index];
    if (!card) return;

    // Backup current card
    setSectionBackups(prev => ({
      ...prev,
      [`card-${cardId}`]: { ...card }
    }));

    // Clear fields
    const updatedCards = [...fields.spotlightCards];
    updatedCards[index] = {
      ...card,
      label: "",
      title: "",
      img: "",
      content: "",
      buttonText: "READ MORE ▶",
      buttonUrl: ""
    };
    handleChange("spotlightCards", updatedCards);

    setStatusMessage({ type: "success", text: `Cleared card fields! Click Undo to restore.` });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleUndoSpotlightCard = (cardId: string, index: number) => {
    const backup = sectionBackups[`card-${cardId}`];
    if (!backup) return;

    const updatedCards = [...fields.spotlightCards];
    updatedCards[index] = { ...backup };
    handleChange("spotlightCards", updatedCards);

    setSectionBackups(prev => {
      const updated = { ...prev };
      delete updated[`card-${cardId}`];
      return updated;
    });

    setStatusMessage({ type: "success", text: `Restored card fields!` });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Auto-generate safe filename from the date field
  const getSafeFilename = (dateStr: string) => {
    // Strip prefix like "Week of", "Week of " case-insensitively
    let datePart = dateStr.replace(/week of/gi, "").trim();
    
    let yyyymmdd = "";
    
    // Check if it's already in YYYY-MM-DD format (e.g., 2026-07-06)
    const matchYYYYMMDD = datePart.match(/^(\d{4})[-\/\s](\d{1,2})[-\/\s](\d{1,2})$/);
    if (matchYYYYMMDD) {
      const y = matchYYYYMMDD[1];
      const m = matchYYYYMMDD[2].padStart(2, "0");
      const d = matchYYYYMMDD[3].padStart(2, "0");
      yyyymmdd = `${y}-${m}-${d}`;
    } else {
      // Check for formats like "July 6, 2026" or "6 July 2026" or "Jul 6, 2026"
      const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      const monthsFull = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
      
      const lowerPart = datePart.toLowerCase();
      let monthIndex = -1;
      
      // Find month
      for (let i = 0; i < 12; i++) {
        if (lowerPart.includes(monthsFull[i]) || lowerPart.includes(months[i])) {
          monthIndex = i;
          break;
        }
      }
      
      if (monthIndex !== -1) {
        // Extract numbers from the string
        const numbers = datePart.match(/\d+/g);
        if (numbers && numbers.length >= 2) {
          let day = "";
          let year = "";
          if (numbers[0].length === 4) {
            year = numbers[0];
            day = numbers[1];
          } else if (numbers[numbers.length - 1].length === 4) {
            year = numbers[numbers.length - 1];
            day = numbers[0];
          } else {
            day = numbers[0];
            year = numbers[1];
          }
          const monthStr = String(monthIndex + 1).padStart(2, "0");
          const dayStr = day.padStart(2, "0");
          yyyymmdd = `${year}-${monthStr}-${dayStr}`;
        }
      }
    }
    
    if (!yyyymmdd || yyyymmdd.includes("undefined")) {
      // Fallback: simple sanitization of the dateStr
      const sanitized = dateStr
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") // remove punctuation
        .replace(/\s+/g, "-"); // spaces to hyphens
      return `${sanitized || "draft"}-marketing-newsletter.html`;
    }
    
    return `${yyyymmdd}-marketing-newsletter.html`;
  };

  const currentFilename = getSafeFilename(fields.dateText);

  // Compile active template (always use modern card)
  const compiledHTML = renderModernHTML(fields);

  // Handle single input field changes
  const handleChange = (key: keyof NewsletterFields, value: any) => {
    setFields(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle nested Awards change
  const handleAwardChange = (index: number, key: keyof AwardItem, value: string) => {
    const updatedAwards = [...fields.awardsList];
    updatedAwards[index] = {
      ...updatedAwards[index],
      [key]: value
    };
    handleChange("awardsList", updatedAwards);
  };

  // Add award nomination
  const handleAddAward = () => {
    const updatedAwards = [...fields.awardsList, {
      name: "New Award Opportunity",
      deadline: "Deadline: Month Day",
      buttonText: "APPLY NOW »",
      buttonUrl: "https://web.hr.com"
    }];
    handleChange("awardsList", updatedAwards);
  };

  // Delete award nomination
  const handleDeleteAward = (index: number) => {
    const updatedAwards = fields.awardsList.filter((_, i) => i !== index);
    handleChange("awardsList", updatedAwards);
  };

  // Reset to default
  const handleReset = () => {
    if (window.confirm("Are you sure you want to restore the default newsletter sample data? Any unsaved edits will be lost.")) {
      setFields(defaultNewsletterFields);
      setStatusMessage({ type: "success", text: "Successfully restored default sample data!" });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Clear all fields
  const handleClear = () => {
    if (window.confirm("Clear all field values to start a fresh draft?")) {
      const cleared: NewsletterFields = {
        theme: "modern",
        signupText: "",
        signupUrl: "",
        headerTitle: "",
        headerSubtitle: "",
        headerImg: "",
        headerImgAlt: "",
        dateText: "month dd, yyyy",
        editorSalutation: "Dear __FIRST_NAME__,",
        editorParagraphs: "",
        topAdImg: "",
        topAdUrl: "",
        topAdAlt: "",
        leadTitleLabel: "Lead Story",
        leadImg: "",
        leadStoryTitle: "",
        leadStoryAuthor: "",
        leadStoryParagraphs: "",
        leadStoryButtonText: "READ ARTICLE →",
        leadStoryButtonUrl: "",
        hotTakesTitleLabel: "Hot Marketing Takes",
        hotTakesImg: "",
        hotTakesParagraphs: "",
        spotlightCards: [],
        awardsLabel: "HR.com Awards",
        awardsSectionTitle: "Nominate Your Solution for an HR.com Award:",
        awardsList: [],
        bottomAdImg: "",
        bottomAdUrl: "",
        bottomAdAlt: "",
        pollTitle: "Poll Of The Week",
        pollQuestion: "",
        pollChoice1: "",
        pollChoice1Url: "",
        pollChoice2: "",
        pollChoice2Url: "",
        pollChoice3: "",
        pollChoice3Url: "",
        pollChoice4: "",
        pollChoice4Url: "",
        forwardTextContent: "",
        footerFacebookUrl: "",
        footerLinkedinUrl: "",
        footerInstagramUrl: "",
        footerYoutubeUrl: "",
        footerTwitterUrl: "",
        footerClosingText: "",
        footerSubscribeText: "SUBSCRIBE TO OUR OTHER NEWSLETTERS",
        footerSubscribeUrl: "",
        footerUnsubscribeUrl: "",
        footerManageSubscriptionUrl: "",
        footerAdvertiseUrl: "",
        footerPrivacyPolicyUrl: "",
        footerContactUsUrl: "",
        footerCopyrightText: "",
        footerDisclaimerText: ""
      };
      setFields(cleared);
      setStatusMessage({ type: "success", text: "Cleared fields!" });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Copy to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(compiledHTML);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Save the compiled newsletter on the filesystem
  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/save-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: currentFilename,
          htmlContent: compiledHTML
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setGenerationResult({
          success: true,
          filename: data.filename,
          path: data.path,
          htmlContent: compiledHTML
        });
        setStatusMessage({ type: "success", text: `Saved file: ${data.filename}` });
      } else {
        throw new Error(data.error || "Failed to generate newsletter");
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "Failed to communicate with server." });
    } finally {
      setIsGenerating(false);
    }
  };

  // Browser download helper
  const triggerBrowserDownload = () => {
    const blob = new Blob([compiledHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Accordion Toggle
  const toggleSection = (section: string) => {
    setOpenSection(prev => prev === section ? "" : section);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      
      {/* HEADER BAR */}
      <header className="bg-[#0A0A0A] border-b border-white/10 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0">
            <div className="w-4 h-4 bg-black"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl tracking-tighter uppercase italic text-white font-sans">NEWSLETTER BUILDER</h1>
            </div>
          </div>
        </div>


      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDE: INPUT FORM WITH FIELDS */}
        <div className="w-[45%] border-r border-gray-200 bg-gray-50 text-gray-900 flex flex-col overflow-y-auto">
          
          {/* Quick Config Segment */}
          <div className="p-8 border-b border-gray-200 bg-white">
            <div className="flex flex-col gap-2">
              <label className="block text-[10px] font-black tracking-widest text-gray-500 uppercase">Date Text Field</label>
              <div className="flex gap-3">
                <input 
                  type="text"
                  value={fields.dateText}
                  onChange={(e) => handleChange("dateText", e.target.value)}
                  className="flex-1 bg-transparent border-b border-gray-300 pb-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors font-mono rounded-none"
                  placeholder="e.g., June 22, 2026"
                />
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                    handleChange("dateText", today.toLocaleDateString('en-US', options));
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 hover:border-gray-400 px-4 py-2 rounded-none text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Set Today
                </button>
              </div>
              <p className="text-[10px] text-gray-500 italic mt-1">Filename: <strong className="text-gray-800 font-mono">{currentFilename}</strong></p>
            </div>
          </div>

          {/* DYNAMIC FORM COLLAPSABLES */}
          <div className="flex-1 p-8 space-y-6">

            {/* LAYOUT SEQUENCE ORGANIZER */}
            <div className="border border-gray-200 rounded-none overflow-hidden bg-white">
              <div 
                onClick={() => toggleSection("layout")}
                className="w-full flex items-center justify-between px-5 py-4 bg-gray-100 hover:bg-gray-200 transition-colors border-b border-gray-200 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Layout className="w-4 h-4 text-gray-500" />
                  <span className="font-black text-xs tracking-widest uppercase text-gray-900">Layout Sequence Organizer</span>
                </div>
                <span className="text-gray-500 text-xs font-mono">{openSection === "layout" ? "▼" : "▶"}</span>
              </div>
              
              {openSection === "layout" && (
                <div className="p-5 bg-gray-50/50 border-t border-gray-200 space-y-4">
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider leading-relaxed">
                    Drag layout blocks or click the arrows to change sequence (excluding Header & Footer). Toggle the eye icon to show/hide sections.
                  </p>
                  
                  <div className="space-y-2">
                    {/* Fixed Header */}
                    <div className="flex items-center justify-between p-3 bg-gray-200/50 border border-gray-300/60 opacity-70">
                      <div className="flex items-center gap-3">
                        <span className="w-4 text-center text-xs font-bold font-mono text-gray-400">#</span>
                        <span className="font-bold text-xs tracking-wider uppercase text-gray-700">1. Header Settings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mr-2">Fixed Top</span>
                        <button
                          type="button"
                          onClick={() => setFields(prev => ({ ...prev, hideHeader: !prev.hideHeader }))}
                          className={`p-1 rounded-none hover:bg-gray-300/50 transition-colors cursor-pointer ${fields.hideHeader ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
                          title={fields.hideHeader ? "Show Header" : "Hide Header"}
                        >
                          {fields.hideHeader ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Reorderable Items */}
                    {(fields.sectionsOrder || ["editor", "topAd", "leadStory", "hotTakes", "columns", "bottomAd", "poll"]).map((secKey, index, arr) => {
                      const labelsMap: Record<string, string> = {
                        editor: "Editor's Note",
                        topAd: "Top Sponsor Ad",
                        leadStory: "Lead Story Setup",
                        hotTakes: "Hot Marketing Takes",
                        columns: "Spotlight Cards & Awards",
                        bottomAd: "Bottom Sponsor Ad",
                        poll: "Poll"
                      };

                      const hideFlagMap: Record<string, keyof NewsletterFields> = {
                        editor: "hideEditor",
                        topAd: "hideTopAd",
                        leadStory: "hideLeadStory",
                        hotTakes: "hideHotTakes",
                        columns: "hideColumns",
                        bottomAd: "hideBottomAd",
                        poll: "hidePollSection"
                      };

                      const isHidden = !!fields[hideFlagMap[secKey]];

                      return (
                        <div
                          key={secKey}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-center justify-between p-3 bg-white border transition-all ${
                            draggedIndex === index 
                              ? "border-gray-900 border-dashed bg-gray-50 opacity-40 scale-95" 
                              : "border-gray-200 hover:border-gray-400"
                          } ${isHidden ? "bg-red-50/10" : ""}`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-0.5">
                              <GripVertical className="w-4 h-4 shrink-0" />
                            </div>
                            <span className="w-4 text-center text-xs font-bold font-mono text-gray-400">{index + 2}</span>
                            <span className={`font-bold text-xs tracking-wider uppercase text-gray-800 ${isHidden ? "line-through text-gray-400" : ""}`}>
                              {labelsMap[secKey]}
                            </span>
                            {isHidden && (
                              <span className="text-[7px] bg-red-100 text-red-600 px-1 py-0.2 font-bold tracking-widest rounded-none">HIDDEN</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleMoveSection(index, "up")}
                              disabled={index === 0}
                              className={`p-1 rounded-none hover:bg-gray-100 transition-colors cursor-pointer ${index === 0 ? "text-gray-200 cursor-not-allowed" : "text-gray-500 hover:text-gray-800"}`}
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSection(index, "down")}
                              disabled={index === arr.length - 1}
                              className={`p-1 rounded-none hover:bg-gray-100 transition-colors cursor-pointer ${index === arr.length - 1 ? "text-gray-200 cursor-not-allowed" : "text-gray-500 hover:text-gray-800"}`}
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const flagKey = hideFlagMap[secKey];
                                setFields(prev => ({ ...prev, [flagKey]: !prev[flagKey] }));
                              }}
                              className={`p-1 rounded-none hover:bg-gray-100 transition-colors cursor-pointer ${isHidden ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
                              title={isHidden ? "Show Section" : "Hide Section"}
                            >
                              {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Fixed Footer */}
                    <div className="flex items-center justify-between p-3 bg-gray-200/50 border border-gray-300/60 opacity-70">
                      <div className="flex items-center gap-3">
                        <span className="w-4 text-center text-xs font-bold font-mono text-gray-400">7</span>
                        <span className="font-bold text-xs tracking-wider uppercase text-gray-700">Footer & Socials</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mr-2">Fixed Bottom</span>
                        <button
                          type="button"
                          onClick={() => setFields(prev => ({ ...prev, hideFooter: !prev.hideFooter }))}
                          className={`p-1 rounded-none hover:bg-gray-300/50 transition-colors cursor-pointer ${fields.hideFooter ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
                          title={fields.hideFooter ? "Show Footer" : "Hide Footer"}
                        >
                          {fields.hideFooter ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 1. HEADER SECTION */}
            <div className={`border border-gray-200 rounded-none overflow-hidden bg-white transition-opacity ${fields.hideHeader ? "opacity-60" : ""}`}>
              <div 
                onClick={() => toggleSection("header")}
                className="w-full flex items-center justify-between px-5 py-4 bg-gray-100 hover:bg-gray-200 transition-colors border-b border-gray-200 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span className="font-black text-xs tracking-widest uppercase text-gray-900 flex items-center gap-2">
                    Header Settings
                    {fields.hideHeader && (
                      <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 font-bold tracking-widest rounded-none">HIDDEN</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title={fields.hideHeader ? "Show Section" : "Hide Section"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFields(prev => ({ ...prev, hideHeader: !prev.hideHeader }));
                    }}
                    className={`p-1 hover:bg-gray-200 rounded-none transition-colors cursor-pointer ${fields.hideHeader ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    {fields.hideHeader ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <span className="text-gray-500 text-xs font-mono">{openSection === "header" ? "▼" : "▶"}</span>
                </div>
              </div>
              
              {openSection === "header" && (
                <div className="p-6 space-y-5 border-t border-gray-200 bg-gray-50/50">
                  <div className="flex justify-end gap-2 pb-2 border-b border-gray-200/60">
                    <button
                      type="button"
                      onClick={() => handleClearSection("header", ["signupText", "signupUrl", "headerTitle", "headerSubtitle", "headerImg", "headerImgAlt"])}
                      className="px-2.5 py-1 text-[10px] font-black tracking-wider text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 uppercase transition-colors rounded-none cursor-pointer"
                    >
                      Clear Section
                    </button>
                    {sectionBackups["header"] && (
                      <button
                        type="button"
                        onClick={() => handleUndoSection("header")}
                        className="px-2.5 py-1 text-[10px] font-black tracking-wider text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 uppercase transition-colors rounded-none cursor-pointer"
                      >
                        Undo Clear
                      </button>
                    )}
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black tracking-widest text-gray-500 mb-2 uppercase">Main Title Text</label>
                    <input 
                      type="text"
                      value={fields.headerTitle}
                      onChange={(e) => handleChange("headerTitle", e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 pb-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black tracking-widest text-gray-500 mb-2 uppercase">Subtitle Slogan Text</label>
                    <textarea 
                      value={fields.headerSubtitle}
                      onChange={(e) => handleChange("headerSubtitle", e.target.value)}
                      rows={2}
                      className="w-full bg-transparent border border-gray-300 p-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black tracking-widest text-gray-500 mb-2 uppercase">Header Image URL</label>
                    <input 
                      type="text"
                      value={fields.headerImg}
                      onChange={(e) => handleChange("headerImg", e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 pb-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none font-mono"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black tracking-widest text-gray-500 mb-2 uppercase">Header Image Alt Text</label>
                    <input 
                      type="text"
                      value={fields.headerImgAlt}
                      onChange={(e) => handleChange("headerImgAlt", e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 pb-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-[10px] font-black tracking-widest text-gray-500 mb-2 uppercase">Signup Button Text</label>
                      <input 
                        type="text"
                        value={fields.signupText}
                        onChange={(e) => handleChange("signupText", e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 pb-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black tracking-widest text-gray-500 mb-2 uppercase">Signup Button Link</label>
                      <input 
                        type="text"
                        value={fields.signupUrl}
                        onChange={(e) => handleChange("signupUrl", e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 pb-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. EDITOR'S NOTE SECTION */}
            <div className={`border border-gray-200 rounded-none overflow-hidden bg-white transition-opacity ${fields.hideEditor ? "opacity-60" : ""}`}>
              <div 
                onClick={() => toggleSection("editor")}
                className="w-full flex items-center justify-between px-5 py-4 bg-gray-100 hover:bg-gray-200 transition-colors border-b border-gray-200 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="font-black text-xs tracking-widest uppercase text-gray-900 flex items-center gap-2">
                    Editor's Note
                    {fields.hideEditor && (
                      <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 font-bold tracking-widest rounded-none">HIDDEN</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title={fields.hideEditor ? "Show Section" : "Hide Section"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFields(prev => ({ ...prev, hideEditor: !prev.hideEditor }));
                    }}
                    className={`p-1 hover:bg-gray-200 rounded-none transition-colors cursor-pointer ${fields.hideEditor ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    {fields.hideEditor ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <span className="text-gray-500 text-xs font-mono">{openSection === "editor" ? "▼" : "▶"}</span>
                </div>
              </div>
              
              {openSection === "editor" && (
                <div className="p-6 space-y-5 border-t border-gray-200 bg-gray-50/50">
                  <div className="flex justify-end gap-2 pb-2 border-b border-gray-200/60">
                    <button
                      type="button"
                      onClick={() => handleClearSection("editor", ["editorSalutation", "editorParagraphs"])}
                      className="px-2.5 py-1 text-[10px] font-black tracking-wider text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 uppercase transition-colors rounded-none cursor-pointer"
                    >
                      Clear Section
                    </button>
                    {sectionBackups["editor"] && (
                      <button
                        type="button"
                        onClick={() => handleUndoSection("editor")}
                        className="px-2.5 py-1 text-[10px] font-black tracking-wider text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 uppercase transition-colors rounded-none cursor-pointer"
                      >
                        Undo Clear
                      </button>
                    )}
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black tracking-widest text-gray-500 mb-2 uppercase">Salutation Greeting</label>
                    <input 
                      type="text"
                      value={fields.editorSalutation}
                      onChange={(e) => handleChange("editorSalutation", e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 pb-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none"
                    />
                  </div>
                  <div className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <label className="block text-[10px] font-black tracking-widest text-gray-500 uppercase mr-1">Letter Body Paragraphs</label>
                        
                        {/* Bold */}
                        <button
                          type="button"
                          onClick={() => handleFormatText("editorParagraphs", editorParagraphsRef, "b")}
                          className="flex items-center justify-center w-5 h-5 text-[9px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none bg-white cursor-pointer"
                          title="Bold"
                        >
                          <Bold className="w-2.5 h-2.5" />
                        </button>

                        {/* Italic */}
                        <button
                          type="button"
                          onClick={() => handleFormatText("editorParagraphs", editorParagraphsRef, "i")}
                          className="flex items-center justify-center w-5 h-5 text-[9px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none bg-white cursor-pointer"
                          title="Italic"
                        >
                          <Italic className="w-2.5 h-2.5" />
                        </button>

                        {/* Underline */}
                        <button
                          type="button"
                          onClick={() => handleFormatText("editorParagraphs", editorParagraphsRef, "u")}
                          className="flex items-center justify-center w-5 h-5 text-[9px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none bg-white cursor-pointer"
                          title="Underline"
                        >
                          <Underline className="w-2.5 h-2.5" />
                        </button>

                        {/* Add Link */}
                        <button
                          type="button"
                          onClick={() => handleOpenLinkPrompt("editorParagraphs", editorParagraphsRef)}
                          className="flex items-center justify-center w-5 h-5 text-[9px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none bg-white cursor-pointer"
                          title="Make highlighted text into a link"
                        >
                          <LinkIcon className="w-2.5 h-2.5" />
                        </button>

                        {/* Bullet Points */}
                        <button
                          type="button"
                          onClick={() => handleInsertBulletPoints("editorParagraphs", editorParagraphsRef)}
                          className="flex items-center justify-center w-5 h-5 text-[9px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none bg-white cursor-pointer"
                          title="Format lines with bullet points"
                        >
                          <ListTodo className="w-2.5 h-2.5" />
                        </button>

                        {/* Numbered List */}
                        <button
                          type="button"
                          onClick={() => handleInsertNumberedList("editorParagraphs", editorParagraphsRef)}
                          className="flex items-center justify-center w-5 h-5 text-[9px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none bg-white cursor-pointer"
                          title="Format lines with a numbered list"
                        >
                          <ListOrdered className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <span className="text-[9px] text-gray-400 italic font-medium">Empty line separates paragraphs</span>
                    </div>
                    <textarea 
                      ref={editorParagraphsRef}
                      value={fields.editorParagraphs}
                      onChange={(e) => handleChange("editorParagraphs", e.target.value)}
                      rows={6}
                      className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors font-mono rounded-none"
                      placeholder="Write letter text content..."
                    />
                    {linkPrompt && linkPrompt.activeField === "editorParagraphs" && (
                      <div className="bg-white border border-gray-300 p-3 space-y-3 mt-2 rounded-none shadow-sm">
                        <div className="text-[10px] font-black tracking-widest text-gray-500 uppercase">Insert Hyperlink</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8px] font-black tracking-widest text-gray-500 uppercase mb-1">Link Text</label>
                            <input
                              type="text"
                              value={linkPrompt.selectedText}
                              onChange={(e) => setLinkPrompt(prev => prev ? { ...prev, selectedText: e.target.value } : null)}
                              className="w-full bg-gray-50 border border-gray-300 p-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none"
                              placeholder="e.g. Click Here"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-black tracking-widest text-gray-500 uppercase mb-1">URL</label>
                            <input
                              type="text"
                              value={linkUrl}
                              onChange={(e) => setLinkUrl(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 p-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none"
                              placeholder="https://example.com"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              setLinkPrompt(null);
                              setLinkUrl("");
                            }}
                            className="px-2.5 py-1 text-gray-500 hover:text-gray-950 hover:bg-gray-100 border border-transparent transition-colors uppercase font-mono cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => insertLink("editorParagraphs")}
                            className="px-2.5 py-1 bg-gray-900 text-white hover:bg-gray-800 font-bold transition-colors uppercase font-mono cursor-pointer"
                          >
                            Insert
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2.5 TOP SPONSOR AD SECTION */}
            <div className={`border border-gray-200 rounded-none overflow-hidden bg-white transition-opacity ${fields.hideTopAd ? "opacity-60" : ""}`}>
              <div 
                onClick={() => toggleSection("topAd")}
                className="w-full flex items-center justify-between px-5 py-4 bg-gray-100 hover:bg-gray-200 transition-colors border-b border-gray-200 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  <span className="font-black text-xs tracking-widest uppercase text-gray-900 flex items-center gap-2">
                    Top Sponsor Ad
                    {fields.hideTopAd && (
                      <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 font-bold tracking-widest rounded-none">HIDDEN</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title={fields.hideTopAd ? "Show Section" : "Hide Section"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFields(prev => ({ ...prev, hideTopAd: !prev.hideTopAd }));
                    }}
                    className={`p-1 hover:bg-gray-200 rounded-none transition-colors cursor-pointer ${fields.hideTopAd ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    {fields.hideTopAd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <span className="text-gray-500 text-xs font-mono">{openSection === "topAd" ? "▼" : "▶"}</span>
                </div>
              </div>
              
              {openSection === "topAd" && (
                <div className="p-6 space-y-5 border-t border-gray-200 bg-gray-50/50">
                  <div className="flex justify-end gap-2 pb-2 border-b border-gray-200/60">
                    <button
                      type="button"
                      onClick={() => handleClearSection("topAd", ["topAdImg", "topAdUrl", "topAdAlt"])}
                      className="px-2.5 py-1 text-[10px] font-black tracking-wider text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 uppercase transition-colors rounded-none cursor-pointer"
                    >
                      Clear Section
                    </button>
                    {sectionBackups["topAd"] && (
                      <button
                        type="button"
                        onClick={() => handleUndoSection("topAd")}
                        className="px-2.5 py-1 text-[10px] font-black tracking-wider text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 uppercase transition-colors rounded-none cursor-pointer"
                      >
                        Undo Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <span className="block text-[10px] font-black tracking-widest uppercase text-gray-800">Top Sponsor Ad (300x250)</span>
                    <div className="group">
                      <label className="block text-[9px] font-black tracking-wider text-gray-500 mb-1.5 uppercase">Ad Image URL</label>
                      <input 
                        type="text"
                        value={fields.topAdImg}
                        onChange={(e) => handleChange("topAdImg", e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 pb-1 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black tracking-wider text-gray-500 mb-1.5 uppercase">Ad Target Link</label>
                      <input 
                        type="text"
                        value={fields.topAdUrl}
                        onChange={(e) => handleChange("topAdUrl", e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 pb-1 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black tracking-wider text-gray-500 mb-1.5 uppercase">Ad Alternative Text</label>
                      <input 
                        type="text"
                        value={fields.topAdAlt}
                        onChange={(e) => handleChange("topAdAlt", e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 pb-1 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. LEAD STORY SECTION */}
            <div className={`border border-gray-200 rounded-none overflow-hidden bg-white transition-opacity ${fields.hideLeadStory ? "opacity-60" : ""}`}>
              <div 
                onClick={() => toggleSection("leadStory")}
                className="w-full flex items-center justify-between px-5 py-4 bg-gray-100 hover:bg-gray-200 transition-colors border-b border-gray-200 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="font-black text-xs tracking-widest uppercase text-gray-900 flex items-center gap-2">
                    Lead Story Setup
                    {fields.hideLeadStory && (
                      <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 font-bold tracking-widest rounded-none">HIDDEN</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title={fields.hideLeadStory ? "Show Section" : "Hide Section"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFields(prev => ({ ...prev, hideLeadStory: !prev.hideLeadStory }));
                    }}
                    className={`p-1 hover:bg-gray-200 rounded-none transition-colors cursor-pointer ${fields.hideLeadStory ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    {fields.hideLeadStory ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <span className="text-gray-500 text-xs font-mono">{openSection === "leadStory" ? "▼" : "▶"}</span>
                </div>
              </div>
              
              {openSection === "leadStory" && (
                <div className="p-6 space-y-5 border-t border-gray-200 bg-gray-50/50">
                  <div className="flex justify-end gap-2 pb-2 border-b border-gray-200/60">
                    <button
                      type="button"
                      onClick={() => handleClearSection("leadStory", ["leadTitleLabel", "leadImg", "leadStoryTitle", "leadStoryAuthor", "leadStoryParagraphs", "leadStoryButtonText", "leadStoryButtonUrl"])}
                      className="px-2.5 py-1 text-[10px] font-black tracking-wider text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 uppercase transition-colors rounded-none cursor-pointer"
                    >
                      Clear Section
                    </button>
                    {sectionBackups["leadStory"] && (
                      <button
                        type="button"
                        onClick={() => handleUndoSection("leadStory")}
                        className="px-2.5 py-1 text-[10px] font-black tracking-wider text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 uppercase transition-colors rounded-none cursor-pointer"
                      >
                        Undo Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-[10px] font-black tracking-widest text-gray-500 mb-2 uppercase">Badge Label</label>
                      <input 
                        type="text"
                        value={fields.leadTitleLabel}
                        onChange={(e) => handleChange("leadTitleLabel", e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 pb-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black tracking-widest text-gray-500 mb-2 uppercase">Cover Image URL</label>
                      <input 
                        type="text"
                        value={fields.leadImg}
                        onChange={(e) => handleChange("leadImg", e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 pb-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none font-mono"
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black tracking-widest text-gray-500 mb-2 uppercase">Headline Title</label>
                    <input 
                      type="text"
                      value={fields.leadStoryTitle}
                      onChange={(e) => handleChange("leadStoryTitle", e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 pb-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black tracking-widest text-gray-500 mb-2 uppercase">Story Author</label>
                    <input 
                      type="text"
                      value={fields.leadStoryAuthor}
                      onChange={(e) => handleChange("leadStoryAuthor", e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 pb-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none"
                    />
                  </div>
                  <div className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <label className="block text-[10px] font-black tracking-widest text-gray-500 uppercase mr-1">Lead Article Body</label>
                        
                        {/* Bold */}
                        <button
                          type="button"
                          onClick={() => handleFormatText("leadStoryParagraphs", leadStoryParagraphsRef, "b")}
                          className="flex items-center justify-center w-5 h-5 text-[9px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none bg-white cursor-pointer"
                          title="Bold"
                        >
                          <Bold className="w-2.5 h-2.5" />
                        </button>

                        {/* Italic */}
                        <button
                          type="button"
                          onClick={() => handleFormatText("leadStoryParagraphs", leadStoryParagraphsRef, "i")}
                          className="flex items-center justify-center w-5 h-5 text-[9px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none bg-white cursor-pointer"
                          title="Italic"
                        >
                          <Italic className="w-2.5 h-2.5" />
                        </button>

                        {/* Underline */}
                        <button
                          type="button"
                          onClick={() => handleFormatText("leadStoryParagraphs", leadStoryParagraphsRef, "u")}
                          className="flex items-center justify-center w-5 h-5 text-[9px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none bg-white cursor-pointer"
                          title="Underline"
                        >
                          <Underline className="w-2.5 h-2.5" />
                        </button>

                        {/* Add Link */}
                        <button
                          type="button"
                          onClick={() => handleOpenLinkPrompt("leadStoryParagraphs", leadStoryParagraphsRef)}
                          className="flex items-center justify-center w-5 h-5 text-[9px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none bg-white cursor-pointer"
                          title="Make highlighted text into a link"
                        >
                          <LinkIcon className="w-2.5 h-2.5" />
                        </button>

                        {/* Bullet Points */}
                        <button
                          type="button"
                          onClick={() => handleInsertBulletPoints("leadStoryParagraphs", leadStoryParagraphsRef)}
                          className="flex items-center justify-center w-5 h-5 text-[9px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none bg-white cursor-pointer"
                          title="Format lines with bullet points"
                        >
                          <ListTodo className="w-2.5 h-2.5" />
                        </button>

                        {/* Numbered List */}
                        <button
                          type="button"
                          onClick={() => handleInsertNumberedList("leadStoryParagraphs", leadStoryParagraphsRef)}
                          className="flex items-center justify-center w-5 h-5 text-[9px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none bg-white cursor-pointer"
                          title="Format lines with a numbered list"
                        >
                          <ListOrdered className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                    <textarea 
                      ref={leadStoryParagraphsRef}
                      value={fields.leadStoryParagraphs}
                      onChange={(e) => handleChange("leadStoryParagraphs", e.target.value)}
                      rows={5}
                      className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors font-mono rounded-none"
                      placeholder="Write lead story content..."
                    />
                    {linkPrompt && linkPrompt.activeField === "leadStoryParagraphs" && (
                      <div className="bg-white border border-gray-300 p-3 space-y-3 mt-2 rounded-none shadow-sm">
                        <div className="text-[10px] font-black tracking-widest text-gray-500 uppercase">Insert Hyperlink</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8px] font-black tracking-widest text-gray-500 uppercase mb-1">Link Text</label>
                            <input
                              type="text"
                              value={linkPrompt.selectedText}
                              onChange={(e) => setLinkPrompt(prev => prev ? { ...prev, selectedText: e.target.value } : null)}
                              className="w-full bg-gray-50 border border-gray-300 p-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none"
                              placeholder="e.g. Click Here"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-black tracking-widest text-gray-500 uppercase mb-1">URL</label>
                            <input
                              type="text"
                              value={linkUrl}
                              onChange={(e) => setLinkUrl(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 p-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none"
                              placeholder="https://example.com"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              setLinkPrompt(null);
                              setLinkUrl("");
                            }}
                            className="px-2.5 py-1 text-gray-500 hover:text-gray-950 hover:bg-gray-100 border border-transparent transition-colors uppercase font-mono cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => insertLink("leadStoryParagraphs")}
                            className="px-2.5 py-1 bg-gray-900 text-white hover:bg-gray-800 font-bold transition-colors uppercase font-mono cursor-pointer"
                          >
                            Insert
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-[10px] font-black tracking-widest text-gray-500 mb-2 uppercase">Button CTA Text</label>
                      <input 
                        type="text"
                        value={fields.leadStoryButtonText}
                        onChange={(e) => handleChange("leadStoryButtonText", e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 pb-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black tracking-widest text-gray-500 mb-2 uppercase">Button target link</label>
                      <input 
                        type="text"
                        value={fields.leadStoryButtonUrl}
                        onChange={(e) => handleChange("leadStoryButtonUrl", e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 pb-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. HOT TAKES SECTION */}
            <div className={`border border-gray-200 rounded-none overflow-hidden bg-white transition-opacity ${fields.hideHotTakes ? "opacity-60" : ""}`}>
              <div 
                onClick={() => toggleSection("hotTakes")}
                className="w-full flex items-center justify-between px-5 py-4 bg-gray-100 hover:bg-gray-200 transition-colors border-b border-gray-200 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-gray-500" />
                  <span className="font-black text-xs tracking-widest uppercase text-gray-900 flex items-center gap-2">
                    Hot Marketing Takes
                    {fields.hideHotTakes && (
                      <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 font-bold tracking-widest rounded-none">HIDDEN</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title={fields.hideHotTakes ? "Show Section" : "Hide Section"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFields(prev => ({ ...prev, hideHotTakes: !prev.hideHotTakes }));
                    }}
                    className={`p-1 hover:bg-gray-200 rounded-none transition-colors cursor-pointer ${fields.hideHotTakes ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    {fields.hideHotTakes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <span className="text-gray-500 text-xs font-mono">{openSection === "hotTakes" ? "▼" : "▶"}</span>
                </div>
              </div>
              
              {openSection === "hotTakes" && (
                <div className="p-6 space-y-5 border-t border-gray-200 bg-gray-50/50">
                  <div className="flex justify-end gap-2 pb-2 border-b border-gray-200/60">
                    <button
                      type="button"
                      onClick={() => handleClearSection("hotTakes", ["hotTakesTitleLabel", "hotTakesImg", "hotTakesParagraphs"])}
                      className="px-2.5 py-1 text-[10px] font-black tracking-wider text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 uppercase transition-colors rounded-none cursor-pointer"
                    >
                      Clear Section
                    </button>
                    {sectionBackups["hotTakes"] && (
                      <button
                        type="button"
                        onClick={() => handleUndoSection("hotTakes")}
                        className="px-2.5 py-1 text-[10px] font-black tracking-wider text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 uppercase transition-colors rounded-none cursor-pointer"
                      >
                        Undo Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-[10px] font-black tracking-widest text-gray-500 mb-2 uppercase">Section Label</label>
                      <input 
                        type="text"
                        value={fields.hotTakesTitleLabel}
                        onChange={(e) => handleChange("hotTakesTitleLabel", e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 pb-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black tracking-widest text-gray-500 mb-2 uppercase">Header Cover Image</label>
                      <input 
                        type="text"
                        value={fields.hotTakesImg}
                        onChange={(e) => handleChange("hotTakesImg", e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 pb-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none font-mono"
                      />
                    </div>
                  </div>
                  <div className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <label className="block text-[10px] font-black tracking-widest text-gray-500 uppercase mr-1">Takes Content Paragraphs</label>
                        
                        {/* Bold */}
                        <button
                          type="button"
                          onClick={() => handleFormatText("hotTakesParagraphs", hotTakesParagraphsRef, "b")}
                          className="flex items-center justify-center w-5 h-5 text-[9px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none bg-white cursor-pointer"
                          title="Bold"
                        >
                          <Bold className="w-2.5 h-2.5" />
                        </button>

                        {/* Italic */}
                        <button
                          type="button"
                          onClick={() => handleFormatText("hotTakesParagraphs", hotTakesParagraphsRef, "i")}
                          className="flex items-center justify-center w-5 h-5 text-[9px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none bg-white cursor-pointer"
                          title="Italic"
                        >
                          <Italic className="w-2.5 h-2.5" />
                        </button>

                        {/* Underline */}
                        <button
                          type="button"
                          onClick={() => handleFormatText("hotTakesParagraphs", hotTakesParagraphsRef, "u")}
                          className="flex items-center justify-center w-5 h-5 text-[9px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none bg-white cursor-pointer"
                          title="Underline"
                        >
                          <Underline className="w-2.5 h-2.5" />
                        </button>

                        {/* Add Link */}
                        <button
                          type="button"
                          onClick={() => handleOpenLinkPrompt("hotTakesParagraphs", hotTakesParagraphsRef)}
                          className="flex items-center justify-center w-5 h-5 text-[9px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none bg-white cursor-pointer"
                          title="Make highlighted text into a link"
                        >
                          <LinkIcon className="w-2.5 h-2.5" />
                        </button>

                        {/* Bullet Points */}
                        <button
                          type="button"
                          onClick={() => handleInsertBulletPoints("hotTakesParagraphs", hotTakesParagraphsRef)}
                          className="flex items-center justify-center w-5 h-5 text-[9px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none bg-white cursor-pointer"
                          title="Format lines with bullet points"
                        >
                          <ListTodo className="w-2.5 h-2.5" />
                        </button>

                        {/* Numbered List */}
                        <button
                          type="button"
                          onClick={() => handleInsertNumberedList("hotTakesParagraphs", hotTakesParagraphsRef)}
                          className="flex items-center justify-center w-5 h-5 text-[9px] font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-none bg-white cursor-pointer"
                          title="Format lines with a numbered list"
                        >
                          <ListOrdered className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                    <textarea 
                      ref={hotTakesParagraphsRef}
                      value={fields.hotTakesParagraphs}
                      onChange={(e) => handleChange("hotTakesParagraphs", e.target.value)}
                      rows={6}
                      className="w-full bg-white border border-gray-300 p-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors font-mono rounded-none"
                      placeholder="Write marketing takes content..."
                    />
                    {linkPrompt && linkPrompt.activeField === "hotTakesParagraphs" && (
                      <div className="bg-white border border-gray-300 p-3 space-y-3 mt-2 rounded-none shadow-sm">
                        <div className="text-[10px] font-black tracking-widest text-gray-500 uppercase">Insert Hyperlink</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8px] font-black tracking-widest text-gray-500 uppercase mb-1">Link Text</label>
                            <input
                              type="text"
                              value={linkPrompt.selectedText}
                              onChange={(e) => setLinkPrompt(prev => prev ? { ...prev, selectedText: e.target.value } : null)}
                              className="w-full bg-gray-50 border border-gray-300 p-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none"
                              placeholder="e.g. Click Here"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-black tracking-widest text-gray-500 uppercase mb-1">URL</label>
                            <input
                              type="text"
                              value={linkUrl}
                              onChange={(e) => setLinkUrl(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 p-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none"
                              placeholder="https://example.com"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              setLinkPrompt(null);
                              setLinkUrl("");
                            }}
                            className="px-2.5 py-1 text-gray-500 hover:text-gray-950 hover:bg-gray-100 border border-transparent transition-colors uppercase font-mono cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => insertLink("hotTakesParagraphs")}
                            className="px-2.5 py-1 bg-gray-900 text-white hover:bg-gray-800 font-bold transition-colors uppercase font-mono cursor-pointer"
                          >
                            Insert
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 5. SPOTLIGHT COLUMNS SECTION */}
            <div className={`border border-gray-200 rounded-none overflow-hidden bg-white transition-opacity ${fields.hideColumns ? "opacity-60" : ""}`}>
              <div 
                onClick={() => toggleSection("columns")}
                className="w-full flex items-center justify-between px-5 py-4 bg-gray-100 hover:bg-gray-200 transition-colors border-b border-gray-200 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Layout className="w-4 h-4 text-gray-500" />
                  <span className="font-black text-xs tracking-widest uppercase text-gray-900 flex items-center gap-2">
                    Feature Spotlight Cards
                    {fields.hideColumns && (
                      <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 font-bold tracking-widest rounded-none">HIDDEN</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title={fields.hideColumns ? "Show Section" : "Hide Section"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFields(prev => ({ ...prev, hideColumns: !prev.hideColumns }));
                    }}
                    className={`p-1 hover:bg-gray-200 rounded-none transition-colors cursor-pointer ${fields.hideColumns ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    {fields.hideColumns ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <span className="text-gray-500 text-xs font-mono">{openSection === "columns" ? "▼" : "▶"}</span>
                </div>
              </div>
              
              {openSection === "columns" && (
                <div className="p-6 space-y-6 border-t border-gray-200 bg-gray-50/50 max-h-[600px] overflow-y-auto">
                  
                  {/* Section action bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                      Dynamic Cards Count: {fields.spotlightCards.length}
                    </span>
                    <button 
                      type="button" 
                      onClick={handleAddCard}
                      className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-none transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Card
                    </button>
                  </div>

                  {/* Dynamic Loop over spotlightCards */}
                  {fields.spotlightCards.map((card, i) => (
                    <div key={card.id || i} className="bg-white p-5 rounded-none border border-gray-200 space-y-3.5 relative">
                      
                      {/* Card Header Actions */}
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-gray-900"></span>
                          <span className="text-[10px] font-black uppercase text-gray-900 tracking-widest">
                            {i + 1}. {card.label || "Feature Card"}
                          </span>
                        </div>
                        
                        {/* Control buttons for this card */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={i === 0}
                            onClick={() => handleMoveCard(i, "up")}
                            className="p-1 border border-gray-200 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer leading-none"
                            title="Move Card Up"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={i === fields.spotlightCards.length - 1}
                            onClick={() => handleMoveCard(i, "down")}
                            className="p-1 border border-gray-200 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer leading-none"
                            title="Move Card Down"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClearSpotlightCard(card.id, i)}
                            className="px-1.5 py-0.5 border border-gray-200 text-[9px] font-black uppercase tracking-wider text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer leading-none"
                            title="Clear this card's fields"
                          >
                            Clear
                          </button>
                          {sectionBackups[`card-${card.id}`] && (
                            <button
                              type="button"
                              onClick={() => handleUndoSpotlightCard(card.id, i)}
                              className="px-1.5 py-0.5 border border-green-200 text-[9px] font-black uppercase tracking-wider text-green-600 hover:text-green-700 hover:bg-green-50 transition-all cursor-pointer leading-none"
                              title="Restore card fields"
                            >
                              Undo
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card Inputs */}
                      <div className="group">
                        <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Card Label / Badge</label>
                        <input 
                          type="text" 
                          value={card.label} 
                          onChange={(e) => handleCardFieldChange(i, "label", e.target.value)} 
                          className="w-full bg-transparent border-b border-gray-300 pb-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none" 
                        />
                      </div>

                      {/* SWAPPED POSITION: Image URL is now ABOVE Title! */}
                      <div className="group">
                        <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Image URL</label>
                        <input 
                          type="text" 
                          value={card.img} 
                          onChange={(e) => handleCardFieldChange(i, "img", e.target.value)} 
                          className="w-full bg-transparent border-b border-gray-300 pb-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none font-mono" 
                        />
                      </div>

                      <div className="group">
                        <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Title</label>
                        <input 
                          type="text" 
                          value={card.title} 
                          onChange={(e) => handleCardFieldChange(i, "title", e.target.value)} 
                          className="w-full bg-transparent border-b border-gray-300 pb-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="group">
                          <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Button Text (CTA)</label>
                          <input 
                            type="text" 
                            value={card.buttonText} 
                            onChange={(e) => handleCardFieldChange(i, "buttonText", e.target.value)} 
                            className="w-full bg-transparent border-b border-gray-300 pb-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none font-semibold" 
                          />
                        </div>
                        <div className="group">
                          <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Button Link</label>
                          <input 
                            type="text" 
                            value={card.buttonUrl} 
                            onChange={(e) => handleCardFieldChange(i, "buttonUrl", e.target.value)} 
                            className="w-full bg-transparent border-b border-gray-300 pb-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none font-mono" 
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Description Content</label>
                        <textarea 
                          value={card.content} 
                          onChange={(e) => handleCardFieldChange(i, "content", e.target.value)} 
                          rows={2} 
                          className="w-full bg-white border border-gray-300 p-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-gray-900 rounded-none" 
                        />
                      </div>
                    </div>
                  ))}

                  {/* Card 6: Awards Program Nominations */}
                  <div className="bg-white p-5 rounded-none border border-gray-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2.5 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-500" />
                        <span className="text-[10px] font-black uppercase text-gray-900 tracking-widest">6. Nominations List</span>
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-none font-mono">
                          Pos: {(fields.awardsPositionIndex !== undefined ? fields.awardsPositionIndex : fields.spotlightCards.length) + 1} of {fields.spotlightCards.length + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={(fields.awardsPositionIndex !== undefined ? fields.awardsPositionIndex : fields.spotlightCards.length) === 0}
                          onClick={() => handleMoveAwardsCard("up")}
                          className="p-1 border border-gray-200 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer leading-none"
                          title="Move Nominations Card Up"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={(fields.awardsPositionIndex !== undefined ? fields.awardsPositionIndex : fields.spotlightCards.length) === fields.spotlightCards.length}
                          onClick={() => handleMoveAwardsCard("down")}
                          className="p-1 border border-gray-200 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer leading-none"
                          title="Move Nominations Card Down"
                        >
                          ▼
                        </button>
                        <button 
                          type="button" 
                          onClick={handleAddAward}
                          className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-none transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Award
                        </button>
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Card Label / Badge</label>
                      <input type="text" value={fields.awardsLabel} onChange={(e) => handleChange("awardsLabel", e.target.value)} className="w-full bg-transparent border-b border-gray-300 pb-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none" />
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black text-gray-500 uppercase mb-1.5">Awards Section Heading</label>
                      <input type="text" value={fields.awardsSectionTitle} onChange={(e) => handleChange("awardsSectionTitle", e.target.value)} className="w-full bg-transparent border-b border-gray-300 pb-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none" />
                    </div>
                    
                    {fields.awardsList.map((award, i) => (
                      <div key={i} className="bg-gray-50 p-4 rounded-none border border-gray-200 relative space-y-3 mt-3">
                        <button 
                          type="button" 
                          onClick={() => handleDeleteAward(i)}
                          className="absolute top-2 right-2.5 text-gray-400 hover:text-red-600 p-0.5 text-lg font-black transition-colors cursor-pointer"
                          title="Delete nomination item"
                        >
                          &times;
                        </button>
                        <span className="text-[9px] font-black font-mono tracking-wider text-gray-500">NOMINATION ITEM #{i+1}</span>
                        <div className="group">
                          <label className="block text-[8px] font-black text-gray-500 uppercase mb-1">Award Title Name</label>
                          <input type="text" value={award.name} onChange={(e) => handleAwardChange(i, "name", e.target.value)} className="w-full bg-transparent border-b border-gray-300 pb-1 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="group">
                            <label className="block text-[8px] font-black text-gray-500 uppercase mb-1">Deadline text</label>
                            <input type="text" value={award.deadline} onChange={(e) => handleAwardChange(i, "deadline", e.target.value)} className="w-full bg-transparent border-b border-gray-300 pb-1 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none" />
                          </div>
                          <div className="group">
                            <label className="block text-[8px] font-black text-gray-500 uppercase mb-1">Apply Link</label>
                            <input type="text" value={award.buttonUrl} onChange={(e) => handleAwardChange(i, "buttonUrl", e.target.value)} className="w-full bg-transparent border-b border-gray-300 pb-1 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none font-mono" />
                          </div>
                          <div className="group">
                            <label className="block text-[8px] font-black text-gray-500 uppercase mb-1">Image URL</label>
                            <input type="text" value={award.imageUrl || ""} onChange={(e) => handleAwardChange(i, "imageUrl", e.target.value)} className="w-full bg-transparent border-b border-gray-300 pb-1 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none font-mono" placeholder="https://..." />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>

            {/* 6. BOTTOM SPONSOR AD SECTION */}
            <div className={`border border-gray-200 rounded-none overflow-hidden bg-white transition-opacity ${fields.hideBottomAd ? "opacity-60" : ""}`}>
              <div 
                onClick={() => toggleSection("bottomAd")}
                className="w-full flex items-center justify-between px-5 py-4 bg-gray-100 hover:bg-gray-200 transition-colors border-b border-gray-200 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  <span className="font-black text-xs tracking-widest uppercase text-gray-900 flex items-center gap-2">
                    Bottom Sponsor Ad
                    {fields.hideBottomAd && (
                      <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 font-bold tracking-widest rounded-none">HIDDEN</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title={fields.hideBottomAd ? "Show Section" : "Hide Section"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFields(prev => ({ ...prev, hideBottomAd: !prev.hideBottomAd }));
                    }}
                    className={`p-1 hover:bg-gray-200 rounded-none transition-colors cursor-pointer ${fields.hideBottomAd ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    {fields.hideBottomAd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <span className="text-gray-500 text-xs font-mono">{openSection === "bottomAd" ? "▼" : "▶"}</span>
                </div>
              </div>
              
              {openSection === "bottomAd" && (
                <div className="p-6 space-y-5 border-t border-gray-200 bg-gray-50/50">
                  <div className="flex justify-end gap-2 pb-2 border-b border-gray-200/60">
                    <button
                      type="button"
                      onClick={() => handleClearSection("bottomAd", ["bottomAdImg", "bottomAdUrl", "bottomAdAlt"])}
                      className="px-2.5 py-1 text-[10px] font-black tracking-wider text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 uppercase transition-colors rounded-none cursor-pointer"
                    >
                      Clear Ad
                    </button>
                    {sectionBackups["bottomAd"] && (
                      <button
                        type="button"
                        onClick={() => handleUndoSection("bottomAd")}
                        className="px-2.5 py-1 text-[10px] font-black tracking-wider text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 uppercase transition-colors rounded-none cursor-pointer"
                      >
                        Undo Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <span className="block text-[10px] font-black tracking-widest uppercase text-gray-800">Bottom Sponsor Ad (300x250)</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="group">
                        <label className="block text-[8px] font-black text-gray-500 uppercase mb-1">Ad Image URL</label>
                        <input type="text" value={fields.bottomAdImg} onChange={(e) => handleChange("bottomAdImg", e.target.value)} className="w-full bg-transparent border-b border-gray-300 pb-1 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none font-mono" />
                      </div>
                      <div className="group">
                        <label className="block text-[8px] font-black text-gray-500 uppercase mb-1">Ad Target Link</label>
                        <input type="text" value={fields.bottomAdUrl} onChange={(e) => handleChange("bottomAdUrl", e.target.value)} className="w-full bg-transparent border-b border-gray-300 pb-1 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none font-mono" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[8px] font-black text-gray-500 uppercase mb-1">Ad Alternative Alt Text</label>
                      <input type="text" value={fields.bottomAdAlt} onChange={(e) => handleChange("bottomAdAlt", e.target.value)} className="w-full bg-transparent border-b border-gray-300 pb-1 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 7. POLL SECTION */}
            <div className={`border border-gray-200 rounded-none overflow-hidden bg-white transition-opacity ${fields.hidePollSection ? "opacity-60" : ""}`}>
              <div 
                onClick={() => toggleSection("poll")}
                className="w-full flex items-center justify-between px-5 py-4 bg-gray-100 hover:bg-gray-200 transition-colors border-b border-gray-200 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                  <span className="font-black text-xs tracking-widest uppercase text-gray-900 flex items-center gap-2">
                    Poll Settings
                    {fields.hidePollSection && (
                      <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 font-bold tracking-widest rounded-none">HIDDEN</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title={fields.hidePollSection ? "Show Section" : "Hide Section"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFields(prev => ({ ...prev, hidePollSection: !prev.hidePollSection }));
                    }}
                    className={`p-1 hover:bg-gray-200 rounded-none transition-colors cursor-pointer ${fields.hidePollSection ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    {fields.hidePollSection ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <span className="text-gray-500 text-xs font-mono">{openSection === "poll" ? "▼" : "▶"}</span>
                </div>
              </div>
              
              {openSection === "poll" && (
                <div className="p-6 space-y-6 border-t border-gray-200 bg-gray-50/50 max-h-[450px] overflow-y-auto">
                  
                  {/* Weekly Interactive Poll Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 flex-wrap gap-2">
                      <span className="block text-[10px] font-black text-gray-800 uppercase tracking-widest">Weekly Interactive Poll</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleClearSection("poll", ["pollTitle", "pollQuestion", "pollChoices", "pollChoice1", "pollChoice1Url", "pollChoice2", "pollChoice2Url", "pollChoice3", "pollChoice3Url", "pollChoice4", "pollChoice4Url"])}
                          className="px-2.5 py-1 text-[10px] font-black tracking-wider text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 uppercase transition-colors rounded-none cursor-pointer"
                        >
                          Clear Poll
                        </button>
                        {sectionBackups["poll"] && (
                          <button
                            type="button"
                            onClick={() => handleUndoSection("poll")}
                            className="px-2.5 py-1 text-[10px] font-black tracking-wider text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 uppercase transition-colors rounded-none cursor-pointer"
                          >
                            Undo Clear
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-[8px] font-black text-gray-500 uppercase mb-1">Poll Title Label</label>
                      <input type="text" value={fields.pollTitle} onChange={(e) => handleChange("pollTitle", e.target.value)} className="w-full bg-transparent border-b border-gray-300 pb-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none" />
                    </div>
                    <div className="group">
                      <label className="block text-[8px] font-black text-gray-500 uppercase mb-1">Question Text</label>
                      <input type="text" value={fields.pollQuestion} onChange={(e) => handleChange("pollQuestion", e.target.value)} className="w-full bg-transparent border-b border-gray-300 pb-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none" />
                    </div>

                    {/* Dynamic Poll Choices */}
                    <div className="space-y-3">
                      <span className="block text-[9px] font-black text-gray-500 uppercase tracking-wider">Choice Options</span>
                      
                      {(fields.pollChoices || []).map((choice, i) => (
                        <div key={i} className="bg-white p-3 rounded-none border border-gray-200 space-y-2 relative group">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-black font-mono tracking-wider text-gray-400">OPTION #{i+1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePollChoice(i)}
                              className="text-gray-400 hover:text-red-600 font-bold transition-colors cursor-pointer text-[10px] uppercase tracking-wider"
                              title="Delete this option"
                            >
                              &times; Remove
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            <input 
                              type="text" 
                              value={choice.text} 
                              onChange={(e) => handlePollChoiceChange(i, "text", e.target.value)} 
                              className="w-full bg-transparent border-b border-gray-300 pb-1 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none" 
                              placeholder="Choice option text..." 
                            />
                            <input 
                              type="text" 
                              value={choice.url} 
                              onChange={(e) => handlePollChoiceChange(i, "url", e.target.value)} 
                              className="w-full bg-transparent border-b border-gray-300 pb-1 text-[10px] text-gray-600 focus:outline-none focus:border-gray-900 rounded-none font-mono" 
                              placeholder="Target link (e.g., Google Form URL)..." 
                            />
                          </div>
                        </div>
                      ))}

                      {(!fields.pollChoices || fields.pollChoices.length === 0) && (
                        <div className="text-center py-4 text-xs text-gray-400 italic bg-white border border-dashed border-gray-200">
                          No choice options. Click the button below to add one.
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleAddPollChoice}
                        className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-[10px] font-black uppercase tracking-widest rounded-none transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Choice Option
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* 7. FOOTER SECTION */}
            <div className={`border border-gray-200 rounded-none overflow-hidden bg-white transition-opacity ${fields.hideFooter ? "opacity-60" : ""}`}>
              <div 
                onClick={() => toggleSection("footer")}
                className="w-full flex items-center justify-between px-5 py-4 bg-gray-100 hover:bg-gray-200 transition-colors border-b border-gray-200 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <ListTodo className="w-4 h-4 text-gray-500" />
                  <span className="font-black text-xs tracking-widest uppercase text-gray-900 flex items-center gap-2">
                    Footer & Socials
                    {fields.hideFooter && (
                      <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 font-bold tracking-widest rounded-none">HIDDEN</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title={fields.hideFooter ? "Show Section" : "Hide Section"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFields(prev => ({ ...prev, hideFooter: !prev.hideFooter }));
                    }}
                    className={`p-1 hover:bg-gray-200 rounded-none transition-colors cursor-pointer ${fields.hideFooter ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    {fields.hideFooter ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <span className="text-gray-500 text-xs font-mono">{openSection === "footer" ? "▼" : "▶"}</span>
                </div>
              </div>
              
              {openSection === "footer" && (
                <div className="p-6 space-y-5 border-t border-gray-200 bg-gray-50/50 max-h-[400px] overflow-y-auto">
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Social Media URLs</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={fields.footerFacebookUrl} onChange={(e) => handleChange("footerFacebookUrl", e.target.value)} className="bg-transparent border-b border-gray-300 pb-1 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none font-mono" placeholder="Facebook" />
                      <input type="text" value={fields.footerLinkedinUrl} onChange={(e) => handleChange("footerLinkedinUrl", e.target.value)} className="bg-transparent border-b border-gray-300 pb-1 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none font-mono" placeholder="LinkedIn" />
                      <input type="text" value={fields.footerInstagramUrl} onChange={(e) => handleChange("footerInstagramUrl", e.target.value)} className="bg-transparent border-b border-gray-300 pb-1 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none font-mono" placeholder="Instagram" />
                      <input type="text" value={fields.footerYoutubeUrl} onChange={(e) => handleChange("footerYoutubeUrl", e.target.value)} className="bg-transparent border-b border-gray-300 pb-1 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none font-mono" placeholder="YouTube" />
                      <input type="text" value={fields.footerTwitterUrl} onChange={(e) => handleChange("footerTwitterUrl", e.target.value)} className="bg-transparent border-b border-gray-300 pb-1 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none font-mono" placeholder="X (Twitter)" />
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Footer Closing Text</label>
                    <textarea value={fields.footerClosingText} onChange={(e) => handleChange("footerClosingText", e.target.value)} rows={3} className="w-full bg-white border border-gray-300 p-2 text-xs text-gray-900 focus:outline-none focus:border-gray-900 font-mono rounded-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Subscribe Button Text</label>
                      <input type="text" value={fields.footerSubscribeText} onChange={(e) => handleChange("footerSubscribeText", e.target.value)} className="w-full bg-transparent border-b border-gray-300 pb-1 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none" />
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Subscribe Link</label>
                      <input type="text" value={fields.footerSubscribeUrl} onChange={(e) => handleChange("footerSubscribeUrl", e.target.value)} className="w-full bg-transparent border-b border-gray-300 pb-1 text-xs text-gray-900 focus:outline-none focus:border-gray-900 rounded-none font-mono" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-500 uppercase">Footer Small Text Disclaimer</label>
                    <textarea value={fields.footerCopyrightText} onChange={(e) => handleChange("footerCopyrightText", e.target.value)} rows={2} className="w-full bg-white border border-gray-300 p-2 text-xs text-gray-900 focus:outline-none focus:border-gray-900 font-mono rounded-none" />
                    <textarea value={fields.footerDisclaimerText} onChange={(e) => handleChange("footerDisclaimerText", e.target.value)} rows={2} className="w-full bg-white border border-gray-300 p-2 text-xs text-gray-900 focus:outline-none focus:border-gray-900 font-mono rounded-none" />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* CTA Generate Buttons Footer */}
          <div className="p-6 border-t border-gray-200 bg-white sticky bottom-0 z-10 space-y-3.5">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-4 px-6 rounded-none font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
                isGenerating 
                  ? "bg-gray-150 text-gray-400 border-gray-200 cursor-not-allowed" 
                  : "bg-gray-900 text-white hover:bg-gray-800 border-gray-900 cursor-pointer"
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  Saving to Workspace...
                </>
              ) : (
                <>
                  <Send className="w-4.5 h-4.5" />
                  Generate & Save {currentFilename}
                </>
              )}
            </button>

          </div>

        </div>

        {/* RIGHT SIDE: REAL-TIME PREVIEW PANEL */}
        <div className="flex-1 bg-[#090909] flex flex-col overflow-hidden relative border-l border-white/10">
          
          {/* TAB BAR */}
          <div className="bg-[#111111] px-6 py-4 border-b border-white/10 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-4 py-2 rounded-none text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                  activeTab === "preview" 
                    ? "bg-white text-black border-white" 
                    : "text-white/60 hover:text-white border-transparent"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Live Preview
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`px-4 py-2 rounded-none text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                  activeTab === "code" 
                    ? "bg-white text-black border-white" 
                    : "text-white/60 hover:text-white border-transparent"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                HTML VIEW
              </button>
            </div>

            {/* PREVIEW LAYOUT DIMENSIONS */}
            {activeTab === "preview" && (
              <div className="flex items-center gap-1 bg-[#1A1A1A] p-1 border border-white/10 rounded-none">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-2 rounded-none transition-colors border ${
                    previewDevice === "desktop" ? "bg-white text-black border-white" : "text-white/50 hover:text-white border-transparent"
                  }`}
                  title="Show Desktop View (650px)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-2 rounded-none transition-colors border ${
                    previewDevice === "mobile" ? "bg-white text-black border-white" : "text-white/50 hover:text-white border-transparent"
                  }`}
                  title="Show Mobile Width (380px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* QUICK ACTIONS */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest bg-transparent hover:bg-white/5 text-white transition-all border border-white/20 rounded-none"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/60" />}
                {isCopied ? "Copied!" : "Copy HTML"}
              </button>
              
              <button
                onClick={triggerBrowserDownload}
                className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest bg-white hover:bg-white/90 text-black transition-all border border-white rounded-none"
              >
                <Download className="w-3.5 h-3.5" />
                Download File
              </button>
            </div>
          </div>

          {/* PREVIEW CONTAINER STAGE */}
          <div className="flex-1 overflow-auto p-8 flex justify-center items-start bg-[#0D0D0D]">
            
            {statusMessage && (
              <div className={`fixed top-20 right-8 z-50 px-4 py-3 rounded-none flex items-center gap-2.5 text-[10px] uppercase font-bold tracking-widest border font-mono animate-bounce ${
                statusMessage.type === "success" 
                  ? "bg-black border-emerald-500 text-emerald-400" 
                  : "bg-black border-red-500 text-red-400"
              }`}>
                {statusMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <HelpCircle className="w-4 h-4 text-red-400" />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {activeTab === "preview" ? (
              <div 
                className={`transition-all duration-300 bg-white border border-white/10 overflow-hidden rounded-none shadow-2xl ${
                  previewDevice === "mobile" 
                    ? "w-[390px] h-[780px] max-h-[780px] border-[16px] border-[#161616]" 
                    : "w-full max-w-[670px] h-full min-h-[600px]"
                }`}
              >
                <iframe
                  title="Newsletter Preview Render"
                  srcDoc={compiledHTML}
                  className="w-full h-full bg-white border-0"
                  sandbox="allow-popups allow-scripts"
                />
              </div>
            ) : (
              <div className="w-full max-w-3xl bg-[#111] border border-white/10 rounded-none overflow-hidden h-full flex flex-col">
                <div className="bg-[#161616] px-5 py-3.5 border-b border-white/10 flex justify-between items-center text-[10px] text-white/50 font-mono uppercase tracking-wider">
                  <span>RAW HTML EXPORT &bull; {currentFilename}</span>
                  <span>{compiledHTML.length.toLocaleString()} bytes</span>
                </div>
                <textarea
                  readOnly
                  value={compiledHTML}
                  className="flex-1 w-full bg-[#111111] p-6 text-white/80 font-mono text-xs focus:outline-none resize-none leading-relaxed overflow-y-auto"
                />
              </div>
            )}

          </div>

        </div>

      </div>

      {/* GENERATION EXPORT MODAL DIALOG */}
      {generationResult && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-white/20 rounded-none max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-250">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-none bg-white text-black flex items-center justify-center border border-white">
                <Check className="w-8 h-8" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="font-black text-xs tracking-widest uppercase text-white font-sans">Export Complete!</h3>
                <p className="text-[11px] text-white/50 uppercase tracking-wide leading-normal">
                  Your customized HTML email newsletter has been generated and written to your local file tree.
                </p>
              </div>

              <div className="bg-[#1A1A1A] w-full p-5 rounded-none border border-white/10 text-left space-y-3 font-mono">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-white/40 uppercase tracking-wider">Filename:</span>
                  <span className="text-white font-black">{generationResult.filename}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] border-t border-white/5 pt-2.5">
                  <span className="text-white/40 uppercase tracking-wider">Status:</span>
                  <span className="text-white font-black flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-white"></span>
                    SUCCESS
                  </span>
                </div>
                <div className="flex flex-col text-[11px] border-t border-white/5 pt-2.5 space-y-1">
                  <span className="text-white/40 uppercase tracking-wider">Workspace Path:</span>
                  <span className="text-white/70 text-[10px] break-all select-all leading-normal">{generationResult.path}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full pt-2">
                <button
                  onClick={triggerBrowserDownload}
                  className="flex items-center justify-center gap-1.5 bg-white hover:bg-white/90 text-black rounded-none py-3.5 text-xs font-black uppercase tracking-widest transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <a
                  href={`/${generationResult.filename}`}
                  target="_blank"
                  className="flex items-center justify-center gap-1.5 bg-[#1A1A1A] hover:bg-[#222] text-white border border-white/20 rounded-none py-3.5 text-xs font-black uppercase tracking-widest transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Live
                </a>
              </div>

              <button
                onClick={() => setGenerationResult(null)}
                className="text-[10px] text-white/40 hover:text-white transition-colors font-black uppercase tracking-widest pt-2"
              >
                Back to Editor
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
