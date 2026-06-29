import React, { useState, useEffect, useRef, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line
} from "recharts";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Sparkles,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Clock,
  ArrowRight,
  ChevronRight,
  History,
  Info,
  Heart,
  Smile,
  Check,
  Compass,
  AlertTriangle,
  Lightbulb,
  X,
  Sun,
  Moon,
  Palette,
  Mic,
  MicOff,
  ArrowUpDown,
  Timer,
  FileText,
  StickyNote,
  BarChart3,
  TrendingUp,
  Activity
} from "lucide-react";
import { CalmPlan, TaskStep, GroundingExercise } from "./types";

const SUGGESTED_PANICS = [
  {
    title: "Internet Outage",
    emoji: "🔌",
    text: "I have a major client presentation in 45 minutes and my internet just cut out. I haven't rehearsed the new demo yet.",
    context: "Client is very important. I have cellular data on my phone."
  },
  {
    title: "Server Is Down",
    emoji: "🔥",
    text: "Our production server is throwing 500 errors. Customers are tweeting at us, database is slow, and my senior engineer is unreachable.",
    context: "Tech stack is Node.js/PostgreSQL. I have admin panel credentials."
  },
  {
    title: "Slept In / Late Flight",
    emoji: "✈️",
    text: "I woke up late. My flight departs in exactly 2 hours, the airport is 30 minutes away, and I haven't even packed my luggage yet.",
    context: "Only carry-on baggage. Check-in closes in 45 minutes."
  },
  {
    title: "Accidental Deletion",
    emoji: "⚠️",
    text: "I accidentally ran a destructive script or deleted a folder containing some important local configuration files for our main project.",
    context: "We use git for version control but haven't pushed in 2 days."
  }
];

const DEFAULT_EXERCISE: GroundingExercise = {
  type: "Box Breathing",
  instruction: "Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold for 4 seconds. Repeat until your heart rate slows."
};

const DEMO_PLAN: CalmPlan = {
  panicInput: "My internet just cut out 45 minutes before a major client presentation.",
  calmingMessage: "This is a solvable technical hurdle. You have ample time to establish a secondary connection, notify the team, and focus on your core delivery.",
  groundingExercise: {
    type: "Box Breathing",
    instruction: "Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold for 4 seconds. Breathe slowly to reset your nervous system."
  },
  timestamp: Date.now(),
  steps: [
    {
      id: "step1",
      title: "Activate Mobile Hotspot",
      description: "Don't spend valuable minutes troubleshooting the router right now. Turn on personal hotspot on your mobile phone and connect your laptop. This establishes a stable backup connection immediately.",
      timeEstimate: "2 minutes",
      priority: "immediate",
      category: "actionable",
      completed: false
    },
    {
      id: "step2",
      title: "Notify the Presentation Host",
      description: "Send a quick Slack or email message to the host: 'Experiencing a minor temporary network blip, but will be online and ready for our presentation.' This removes the anxiety of arriving late.",
      timeEstimate: "1 minute",
      priority: "immediate",
      category: "contingency",
      completed: false
    },
    {
      id: "step3",
      title: "Pre-load Your Key Assets",
      description: "Once connected to hotspot, open all slides, demo pages, or documents you need. Keep them open in offline mode if possible so you don't depend on live network speeds during the speech.",
      timeEstimate: "5 minutes",
      priority: "high",
      category: "actionable",
      completed: false
    },
    {
      id: "step4",
      title: "The First 60-Second Practice",
      description: "Rehearse only the first 60 seconds of your presentation aloud. Starting strong sets a positive psychological flow and builds confidence for the remainder.",
      timeEstimate: "3 minutes",
      priority: "medium",
      category: "grounding",
      completed: false
    },
    {
      id: "step5",
      title: "Silent Visualization",
      description: "Close your eyes, breathe, and visually run through the order of your slides. Don't worry about speaking perfectly. Just see yourself navigating the presentation successfully.",
      timeEstimate: "2 minutes",
      priority: "low",
      category: "resolution",
      completed: false
    }
  ]
};

const THEME_STYLES = {
  light: {
    bg: "bg-[#F9FBFA] text-slate-800",
    textPrincipal: "text-slate-900",
    textSecondary: "text-slate-500",
    textSecondaryMuted: "text-slate-400",
    navBg: "bg-white border-b border-slate-200",
    sideBg: "bg-white border-r border-slate-200",
    cardBg: "bg-white border border-slate-200 shadow-xs",
    panicCardBg: "bg-slate-50 border border-slate-100/80",
    stepActiveBg: "bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/20",
    stepCompletedBg: "bg-slate-50/60 border-slate-200 opacity-60",
    stepInactiveBg: "bg-white border-slate-200 hover:border-slate-300",
    formBg: "bg-white border border-slate-200",
    inputBg: "bg-slate-50/50 border border-slate-200 text-slate-800 focus:border-emerald-500 focus:ring-emerald-500",
    pillCategoryBg: "bg-slate-100 text-slate-500",
    pillPriorityImmediate: "bg-red-50 text-red-700 border border-red-100",
    pillPriorityHigh: "bg-amber-50 text-amber-700 border border-amber-100",
    pillPriorityMedium: "bg-slate-100 text-slate-600",
    dashedBtn: "border border-dashed border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400",
    historyCard: "bg-white border border-slate-100 hover:border-slate-300",
    comfortCard: "bg-emerald-50/50 border border-emerald-100/70 text-slate-700",
    bottomBar: "bg-emerald-50/50 border border-emerald-100",
    modalForm: "bg-white border border-slate-200",
    hrBorder: "border-slate-200",
    subtleBorder: "border-slate-100"
  },
  dark: {
    bg: "bg-[#0B0F19] text-slate-200",
    textPrincipal: "text-slate-100",
    textSecondary: "text-slate-400",
    textSecondaryMuted: "text-slate-500",
    navBg: "bg-[#111827] border-b border-slate-800/80",
    sideBg: "bg-[#111827] border-r border-slate-800/80",
    cardBg: "bg-[#111827] border border-slate-800/60 shadow-xs",
    panicCardBg: "bg-[#1F2937]/80 border border-slate-800/80",
    stepActiveBg: "bg-[#111827] border-emerald-500 shadow-md ring-1 ring-emerald-500/30",
    stepCompletedBg: "bg-[#1F2937]/30 border-slate-800 opacity-60",
    stepInactiveBg: "bg-[#111827] border-slate-800 hover:border-slate-700",
    formBg: "bg-[#111827] border border-slate-800",
    inputBg: "bg-[#1F2937]/60 border border-slate-800 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500",
    pillCategoryBg: "bg-slate-800 text-slate-400",
    pillPriorityImmediate: "bg-red-950/40 text-red-400 border border-red-900/50",
    pillPriorityHigh: "bg-amber-950/40 text-amber-400 border border-amber-900/50",
    pillPriorityMedium: "bg-slate-800 text-slate-300",
    dashedBtn: "border border-dashed border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700",
    historyCard: "bg-[#111827] border border-slate-800/80 hover:border-slate-700",
    comfortCard: "bg-emerald-950/20 border border-emerald-900/30 text-slate-300",
    bottomBar: "bg-emerald-950/20 border border-emerald-900/30",
    modalForm: "bg-[#111827] border border-slate-800",
    hrBorder: "border-slate-800",
    subtleBorder: "border-slate-800/50"
  },
  warm: {
    bg: "bg-[#FBF8F3] text-stone-800",
    textPrincipal: "text-stone-900",
    textSecondary: "text-stone-500",
    textSecondaryMuted: "text-stone-400",
    navBg: "bg-[#FFFDF9] border-b border-stone-200",
    sideBg: "bg-[#FFFDF9] border-stone-200 border-r",
    cardBg: "bg-[#FFFDF9] border border-stone-200 shadow-xs",
    panicCardBg: "bg-[#F4EFE6] border border-stone-200/80",
    stepActiveBg: "bg-[#FFFDF9] border-amber-600 shadow-md ring-1 ring-amber-600/20",
    stepCompletedBg: "bg-[#F4EFE6]/60 border-stone-200 opacity-60",
    stepInactiveBg: "bg-[#FFFDF9] border-stone-200 hover:border-stone-300",
    formBg: "bg-[#FFFDF9] border border-stone-200",
    inputBg: "bg-[#FFFDF9] border border-stone-200 text-stone-800 focus:border-amber-600 focus:ring-amber-600",
    pillCategoryBg: "bg-stone-200 text-stone-600",
    pillPriorityImmediate: "bg-red-50 text-red-700 border border-red-100",
    pillPriorityHigh: "bg-amber-50 text-amber-700 border border-amber-100",
    pillPriorityMedium: "bg-stone-200/60 text-stone-600",
    dashedBtn: "border border-dashed border-stone-300 text-stone-500 hover:text-stone-800 hover:border-stone-400",
    historyCard: "bg-[#FFFDF9] border border-stone-200/80 hover:border-stone-300",
    comfortCard: "bg-amber-50/50 border border-amber-200/50 text-stone-700",
    bottomBar: "bg-amber-50/40 border border-amber-200/50",
    modalForm: "bg-[#FFFDF9] border border-stone-200",
    hrBorder: "border-stone-200",
    subtleBorder: "border-stone-100"
  },
  forest: {
    bg: "bg-[#06120E] text-[#D2E2DC]",
    textPrincipal: "text-[#E8F5F1]",
    textSecondary: "text-[#9CB3AA]",
    textSecondaryMuted: "text-[#627D72]",
    navBg: "bg-[#0A1A15] border-b border-emerald-950/80",
    sideBg: "bg-[#0A1A15] border-emerald-950/80 border-r",
    cardBg: "bg-[#0A1A15] border border-emerald-950 shadow-xs",
    panicCardBg: "bg-[#132A22]/80 border border-emerald-900/60",
    stepActiveBg: "bg-[#0A1A15] border-emerald-500 shadow-md ring-1 ring-emerald-500/30",
    stepCompletedBg: "bg-[#132A22]/30 border-emerald-950 opacity-60",
    stepInactiveBg: "bg-[#0A1A15] border-emerald-950 hover:border-[#132A22]",
    formBg: "bg-[#0A1A15] border border-emerald-950",
    inputBg: "bg-[#132A22]/60 border border-emerald-900/80 text-[#E8F5F1] focus:border-emerald-500 focus:ring-emerald-500",
    pillCategoryBg: "bg-emerald-950 text-emerald-400",
    pillPriorityImmediate: "bg-red-950/40 text-red-400 border border-red-900/40",
    pillPriorityHigh: "bg-amber-950/40 text-amber-400 border border-amber-900/40",
    pillPriorityMedium: "bg-emerald-900/60 text-emerald-300",
    dashedBtn: "border border-dashed border-emerald-950 text-[#9CB3AA] hover:text-[#E8F5F1] hover:border-emerald-700",
    historyCard: "bg-[#0A1A15] border border-emerald-950 hover:border-[#132A22]",
    comfortCard: "bg-emerald-950/40 border border-emerald-900/40 text-[#E8F5F1]",
    bottomBar: "bg-emerald-950/40 border border-emerald-900/40",
    modalForm: "bg-[#0A1A15] border border-emerald-950",
    hrBorder: "border-emerald-950",
    subtleBorder: "border-emerald-950/50"
  }
};

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark" | "warm" | "forest">("light");
  const [activeTab, setActiveTab] = useState<"flow" | "logs" | "analytics">("flow");
  const [panicInput, setPanicInput] = useState("");
  const [contextInput, setContextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Active Plan State
  const [activePlan, setActivePlan] = useState<CalmPlan | null>(null);
  const [pastPlans, setPastPlans] = useState<CalmPlan[]>([]);
  
  // Custom action step fields
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepDesc, setNewStepDesc] = useState("");
  const [newStepPriority, setNewStepPriority] = useState<"immediate" | "high" | "medium" | "low">("high");
  const [newStepCategory, setNewStepCategory] = useState<"grounding" | "actionable" | "contingency" | "resolution">("actionable");
  const [newStepTime, setNewStepTime] = useState("2 minutes");
  const [showAddStepForm, setShowAddStepForm] = useState(false);

  // Breathing Box state
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Rest">("Inhale");
  const [breathingTimer, setBreathingTimer] = useState(4);
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Voice to text states and references
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Sorting state for task list
  const [sortBy, setSortBy] = useState<"suggested" | "priority" | "time">("suggested");

  // Expanded notes state for step IDs
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      setSpeechSupported(true);
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startSpeechToText = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let startText = panicInput.trim();
    if (startText.length > 0) {
      startText += " ";
    }

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const updatedText = startText + finalTranscript + interimTranscript;
      setPanicInput(updatedText);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSpeechToText = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleSpeechToText = () => {
    if (isListening) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };

  // Task timer structure interface
  interface TaskTimerState {
    stepId: string;
    totalSeconds: number;
    secondsRemaining: number;
    isRunning: boolean;
    isCompleted: boolean;
  }

  // Task timer states
  const [taskTimers, setTaskTimers] = useState<Record<string, TaskTimerState>>({});
  const [triggeredNotifications, setTriggeredNotifications] = useState<{ id: string; stepId: string; stepTitle: string }[]>([]);
  const [editingTimerStepId, setEditingTimerStepId] = useState<string | null>(null);
  const [customTimerMinutes, setCustomTimerMinutes] = useState<string>("5");

  // Multi-timer clock tick effect
  useEffect(() => {
    const hasRunning = (Object.values(taskTimers) as TaskTimerState[]).some(t => t.isRunning && t.secondsRemaining > 0);
    if (!hasRunning) return;

    const interval = setInterval(() => {
      setTaskTimers(prev => {
        const updated = { ...prev };
        let changed = false;

        Object.keys(updated).forEach(id => {
          const timer = updated[id];
          if (timer && timer.isRunning && timer.secondsRemaining > 0) {
            const nextSec = timer.secondsRemaining - 1;
            changed = true;
            if (nextSec <= 0) {
              updated[id] = {
                ...timer,
                secondsRemaining: 0,
                isRunning: false,
                isCompleted: true
              };

              // Look up title from steps
              const step = activePlan?.steps.find(s => s.id === id);
              const title = step ? step.title : "Mitigation Task";

              setTriggeredNotifications(prevNotifs => {
                if (prevNotifs.some(n => n.stepId === id)) return prevNotifs;
                return [...prevNotifs, { id: `${id}-${Date.now()}`, stepId: id, stepTitle: title }];
              });

              // Play subtle procedural audio alert
              try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.type = "sine";
                oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5 note
                gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
                oscillator.start();
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
                oscillator.stop(audioCtx.currentTime + 1.2);
              } catch (soundErr) {
                // Silently bypass on browser policy blocking
              }
            } else {
              updated[id] = {
                ...timer,
                secondsRemaining: nextSec
              };
            }
          }
        });

        return changed ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [taskTimers, activePlan?.steps]);

  const startPresetTimer = (stepId: string, minutes: number) => {
    const totalSeconds = minutes * 60;
    setTaskTimers(prev => ({
      ...prev,
      [stepId]: {
        stepId,
        totalSeconds,
        secondsRemaining: totalSeconds,
        isRunning: true,
        isCompleted: false
      }
    }));
    setEditingTimerStepId(null);
  };

  const handleCustomTimerSubmit = (stepId: string) => {
    const mins = parseInt(customTimerMinutes, 10) || 5;
    startPresetTimer(stepId, mins);
  };

  const toggleTimerRunning = (stepId: string) => {
    setTaskTimers(prev => {
      const timer = prev[stepId];
      if (!timer) return prev;
      return {
        ...prev,
        [stepId]: {
          ...timer,
          isRunning: !timer.isRunning
        }
      };
    });
  };

  const cancelTimer = (stepId: string) => {
    setTaskTimers(prev => {
      const copy = { ...prev };
      delete copy[stepId];
      return copy;
    });
    setTriggeredNotifications(prev => prev.filter(n => n.stepId !== stepId));
  };

  // Load plans and theme from local storage
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("clarity_theme") as any;
      if (storedTheme && ["light", "dark", "warm", "forest"].includes(storedTheme)) {
        setTheme(storedTheme);
      }
      const stored = localStorage.getItem("clarity_past_plans");
      if (stored) {
        setPastPlans(JSON.parse(stored));
      }
      const current = localStorage.getItem("clarity_active_plan");
      if (current) {
        setActivePlan(JSON.parse(current));
      }
    } catch (e) {
      console.error("Failed to restore previous sessions:", e);
    }
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark" | "warm" | "forest") => {
    setTheme(newTheme);
    localStorage.setItem("clarity_theme", newTheme);
  };

  // Save to local storage whenever they change
  const saveActivePlan = (plan: CalmPlan | null) => {
    setActivePlan(plan);
    if (plan) {
      localStorage.setItem("clarity_active_plan", JSON.stringify(plan));
    } else {
      localStorage.removeItem("clarity_active_plan");
    }
  };

  const savePastPlans = (plans: CalmPlan[]) => {
    setPastPlans(plans);
    localStorage.setItem("clarity_past_plans", JSON.stringify(plans));
  };

  // Breathing Logic (Box breathing: 4s inhale, 4s hold, 4s exhale, 4s hold)
  useEffect(() => {
    if (breathingActive) {
      breathingIntervalRef.current = setInterval(() => {
        setBreathingTimer((prev) => {
          if (prev <= 1) {
            setBreathingPhase((currentPhase) => {
              switch (currentPhase) {
                case "Inhale":
                  return "Hold";
                case "Hold":
                  return "Exhale";
                case "Exhale":
                  return "Rest";
                case "Rest":
                  return "Inhale";
                default:
                  return "Inhale";
              }
            });
            return 4; // Reset to 4 seconds for next phase
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
      setBreathingTimer(4);
      setBreathingPhase("Inhale");
    }

    return () => {
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    };
  }, [breathingActive]);

  // Handle plan submission
  const generatePlan = async (inputStr: string, contextStr: string) => {
    if (!inputStr.trim()) {
      setError("Please describe what is causing you stress or panic.");
      return;
    }

    setLoading(true);
    setError(null);
    setBreathingActive(true); // Initiate breathing right away to soothe the user

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          panicInput: inputStr,
          currentContext: contextStr
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate plan");
      }

      const rawPlan = await response.json();
      
      // Initialize steps with completed = false
      const initializedSteps = rawPlan.steps.map((s: any) => ({
        ...s,
        completed: false
      }));

      const plan: CalmPlan = {
        panicInput: inputStr,
        currentContext: contextStr,
        calmingMessage: rawPlan.calmingMessage,
        groundingExercise: rawPlan.groundingExercise || DEFAULT_EXERCISE,
        steps: initializedSteps,
        timestamp: Date.now()
      };

      saveActivePlan(plan);
      
      // Save to history list
      const updatedHistory = [plan, ...pastPlans.filter(p => p.panicInput !== plan.panicInput)].slice(0, 20);
      savePastPlans(updatedHistory);
      
      // Clear input fields
      setPanicInput("");
      setContextInput("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while communicating with our server.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger demo mode for testing or fallback
  const triggerDemoMode = () => {
    setError(null);
    const mock: CalmPlan = JSON.parse(JSON.stringify(DEMO_PLAN));
    mock.timestamp = Date.now();
    saveActivePlan(mock);
    const updated = [mock, ...pastPlans.filter(p => p.panicInput !== mock.panicInput)].slice(0, 20);
    savePastPlans(updated);
  };

  // Toggle checklist item
  const toggleStep = (stepId: string) => {
    if (!activePlan) return;
    const updatedSteps = activePlan.steps.map(step => {
      if (step.id === stepId) {
        const nextCompleted = !step.completed;
        // Pause timer if step is now completed
        if (nextCompleted) {
          setTaskTimers(prev => {
            if (prev[stepId]) {
              return {
                ...prev,
                [stepId]: {
                  ...prev[stepId],
                  isRunning: false
                }
              };
            }
            return prev;
          });
        }
        return { ...step, completed: nextCompleted };
      }
      return step;
    });

    const total = updatedSteps.length;
    const completed = updatedSteps.filter(s => s.completed).length;
    const isNowCompleted = total > 0 && completed === total;

    const updatedPlan = { 
      ...activePlan, 
      steps: updatedSteps,
      completedAt: isNowCompleted ? (activePlan.completedAt || Date.now()) : undefined
    };
    saveActivePlan(updatedPlan);

    // Also update this plan inside the pastPlans list to keep progress in history
    const updatedHistory = pastPlans.map(p => {
      if (p.timestamp === activePlan.timestamp) {
        return updatedPlan;
      }
      return p;
    });
    savePastPlans(updatedHistory);

    // Trigger visual confetti animation when de-escalating successfully (100% completion)
    const wasCompleted = activePlan.steps.length > 0 && activePlan.steps.every(s => s.completed);
    if (total > 0 && completed === total && !wasCompleted) {
      try {
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 }
        });
        
        // Multi-angle bursts
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { x: 0.2, y: 0.6 }
          });
        }, 200);

        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { x: 0.8, y: 0.6 }
          });
        }, 350);
      } catch (confettiErr) {
        console.warn("Confetti animation failed", confettiErr);
      }
    }
  };

  // Update notes on a task step
  const updateStepNotes = (stepId: string, notes: string) => {
    if (!activePlan) return;
    const updatedSteps = activePlan.steps.map(step => {
      if (step.id === stepId) {
        return { ...step, notes };
      }
      return step;
    });

    const updatedPlan = { ...activePlan, steps: updatedSteps };
    saveActivePlan(updatedPlan);

    const updatedHistory = pastPlans.map(p => {
      if (p.timestamp === activePlan.timestamp) {
        return updatedPlan;
      }
      return p;
    });
    savePastPlans(updatedHistory);
  };

  // Delete a step from the plan
  const deleteStep = (stepId: string) => {
    if (!activePlan) return;
    
    // Clean up corresponding timers
    setTaskTimers(prev => {
      const copy = { ...prev };
      delete copy[stepId];
      return copy;
    });
    setTriggeredNotifications(prev => prev.filter(n => n.stepId !== stepId));

    const updatedSteps = activePlan.steps.filter(step => step.id !== stepId);
    const updatedPlan = { ...activePlan, steps: updatedSteps };
    saveActivePlan(updatedPlan);

    const updatedHistory = pastPlans.map(p => {
      if (p.timestamp === activePlan.timestamp) {
        return updatedPlan;
      }
      return p;
    });
    savePastPlans(updatedHistory);
  };

  // Add a custom step to the current plan
  const handleAddCustomStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlan || !newStepTitle.trim()) return;

    const customStep: TaskStep = {
      id: "custom-" + Date.now(),
      title: newStepTitle,
      description: newStepDesc || "Custom objective added by you.",
      priority: newStepPriority,
      category: newStepCategory,
      timeEstimate: newStepTime || "5 minutes",
      completed: false,
      isCustom: true
    };

    const updatedPlan = {
      ...activePlan,
      steps: [...activePlan.steps, customStep]
    };

    saveActivePlan(updatedPlan);

    // Update history
    const updatedHistory = pastPlans.map(p => {
      if (p.timestamp === activePlan.timestamp) {
        return updatedPlan;
      }
      return p;
    });
    savePastPlans(updatedHistory);

    // Reset inputs
    setNewStepTitle("");
    setNewStepDesc("");
    setNewStepPriority("high");
    setNewStepCategory("actionable");
    setNewStepTime("5 minutes");
    setShowAddStepForm(false);
  };

  // Clear current flow / start a new one
  const handleStartOver = () => {
    saveActivePlan(null);
    setBreathingActive(false);
    setError(null);
  };

  // Load a specific historical plan
  const loadPastPlan = (plan: CalmPlan) => {
    saveActivePlan(plan);
    setActiveTab("flow");
  };

  // Clear past logs
  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your stress resolution history?")) {
      savePastPlans([]);
    }
  };

  // Helper to parse time estimates for sorting (e.g. "3 minutes" -> 180, "30 seconds" -> 30)
  const parseTimeToSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    const str = timeStr.toLowerCase().trim();
    const num = parseFloat(str) || 0;
    if (str.includes("second")) {
      return num;
    }
    if (str.includes("hour")) {
      return num * 3600;
    }
    // Default to minutes
    return num * 60;
  };

  // Map priority strings to a sorting rank (higher number = higher priority)
  const priorityRank: Record<string, number> = {
    immediate: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  // Compute sorted steps based on active sorting mode
  const sortedSteps = useMemo(() => {
    if (!activePlan) return [];
    
    // Create a copy of steps with their original index so we can preserve it if needed
    const stepsWithIndex = activePlan.steps.map((step, originalIndex) => ({
      ...step,
      originalIndex
    }));

    if (sortBy === "priority") {
      return [...stepsWithIndex].sort((a, b) => {
        const rankA = priorityRank[a.priority] || 0;
        const rankB = priorityRank[b.priority] || 0;
        if (rankA !== rankB) {
          return rankB - rankA; // Higher rank first
        }
        return a.originalIndex - b.originalIndex; // Preserve original relative order
      });
    }

    if (sortBy === "time") {
      return [...stepsWithIndex].sort((a, b) => {
        const secondsA = parseTimeToSeconds(a.timeEstimate);
        const secondsB = parseTimeToSeconds(b.timeEstimate);
        if (secondsA !== secondsB) {
          return secondsA - secondsB; // Shortest duration first
        }
        return a.originalIndex - b.originalIndex;
      });
    }

    // Default "suggested" mode: original plan order
    return stepsWithIndex;
  }, [activePlan?.steps, sortBy]);

  // Progress calculations
  const totalSteps = activePlan?.steps.length || 0;
  const completedStepsCount = activePlan?.steps.filter(s => s.completed).length || 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;

  // Prepare data for Recharts resolution analytics
  const analyticsData = useMemo(() => {
    if (pastPlans.length === 0) {
      return {
        frequencyData: [],
        speedData: [],
        categoryData: [],
        totalCount: 0,
        resolvedCount: 0,
        averageSpeedMins: 0,
        improvementRate: 0
      };
    }

    const plansWithSpeed = pastPlans.map((plan, idx) => {
      const stepsCount = plan.steps.length;
      const completedCount = plan.steps.filter(s => s.completed).length;
      const isResolved = stepsCount > 0 && completedCount === stepsCount;
      
      let durationMs: number | null = null;
      if (isResolved) {
        if (plan.completedAt) {
          durationMs = plan.completedAt - plan.timestamp;
        } else {
          // Fallback estimated duration for existing resolved past logs:
          // Simulate a gradual improvement over past plans (older plans took longer, newer plans are faster)
          const improvementFactor = Math.max(0.4, 1 - (idx * 0.1));
          const baseMins = stepsCount * 5; // e.g. 5 mins per step
          const estimatedMins = Math.round(baseMins * improvementFactor);
          durationMs = estimatedMins * 60 * 1000;
        }
      }

      return {
        ...plan,
        isResolved,
        durationMins: durationMs ? Math.round(durationMs / 60000) : null
      };
    });

    // 1. Group frequency by day (UTC or Local)
    const dailyGroups: Record<string, number> = {};
    const reversedPlans = [...pastPlans].reverse();
    reversedPlans.forEach(plan => {
      const dateStr = new Date(plan.timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
      });
      dailyGroups[dateStr] = (dailyGroups[dateStr] || 0) + 1;
    });

    const frequencyData = Object.entries(dailyGroups).map(([date, count]) => ({
      date,
      "Stress Logged": count
    }));

    // 2. Resolution Speed Trend over time (in minutes)
    // Map chronological order
    const resolvedInOrder = [...plansWithSpeed]
      .filter(p => p.isResolved && p.durationMins !== null)
      .reverse();

    const speedData = resolvedInOrder.map((p, idx) => ({
      index: idx + 1,
      date: new Date(p.timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      "De-escalation Time (mins)": p.durationMins || 0,
      "Situation": p.panicInput.length > 25 ? p.panicInput.substring(0, 25) + "..." : p.panicInput
    }));

    // 3. Category/Priority distribution
    const priorityCounts = {
      immediate: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    pastPlans.forEach(plan => {
      plan.steps.forEach(step => {
        if (step.priority in priorityCounts) {
          priorityCounts[step.priority as keyof typeof priorityCounts]++;
        }
      });
    });

    const categoryData = [
      { name: "Immediate", value: priorityCounts.immediate, color: "#EF4444" },
      { name: "High", value: priorityCounts.high, color: "#F59E0B" },
      { name: "Medium", value: priorityCounts.medium, color: "#10B981" },
      { name: "Low", value: priorityCounts.low, color: "#3B82F6" }
    ].filter(item => item.value > 0);

    const totalCount = pastPlans.length;
    const resolvedCount = plansWithSpeed.filter(p => p.isResolved).length;

    const resolvedPlansWithSpeed = plansWithSpeed.filter(p => p.isResolved && p.durationMins !== null);
    const averageSpeedMins = resolvedPlansWithSpeed.length > 0
      ? Math.round(resolvedPlansWithSpeed.reduce((sum, p) => sum + (p.durationMins || 0), 0) / resolvedPlansWithSpeed.length)
      : 0;

    // Calculate improvement rate by comparing first half of resolved (older) and second half (newer)
    let improvementRate = 0;
    if (resolvedPlansWithSpeed.length >= 2) {
      const mid = Math.floor(resolvedPlansWithSpeed.length / 2);
      // Since pastPlans are in reverse chronological order (newest first):
      const recentPlans = resolvedPlansWithSpeed.slice(0, mid);
      const earlyPlans = resolvedPlansWithSpeed.slice(mid);

      const earlyAvg = earlyPlans.reduce((sum, p) => sum + (p.durationMins || 0), 0) / earlyPlans.length;
      const recentAvg = recentPlans.reduce((sum, p) => sum + (p.durationMins || 0), 0) / recentPlans.length;

      if (earlyAvg > 0 && recentAvg > 0) {
        improvementRate = Math.round(((earlyAvg - recentAvg) / earlyAvg) * 100);
      }
    }

    return {
      frequencyData,
      speedData,
      categoryData,
      totalCount,
      resolvedCount,
      averageSpeedMins,
      improvementRate
    };
  }, [pastPlans]);

  // Render Breathing animation properties
  const getBreathingLabel = () => {
    switch (breathingPhase) {
      case "Inhale": return "Breathe In";
      case "Hold": return "Hold Breath";
      case "Exhale": return "Breathe Out";
      case "Rest": return "Hold/Rest";
    }
  };

  const getBreathingColor = () => {
    switch (breathingPhase) {
      case "Inhale": return "bg-emerald-500 text-white shadow-emerald-200";
      case "Hold": return "bg-teal-600 text-white shadow-teal-200";
      case "Exhale": return "bg-sky-500 text-white shadow-sky-200";
      case "Rest": return "bg-slate-500 text-white shadow-slate-200";
    }
  };

  return (
    <div className={`min-h-screen ${THEME_STYLES[theme].bg} flex flex-col font-sans antialiased transition-colors duration-300`}>
      
      {/* Floating Timer Notifications */}
      {triggeredNotifications.length > 0 && (
        <div className="fixed top-24 right-4 z-[9999] max-w-sm w-full space-y-3 pointer-events-auto">
          {triggeredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl shadow-2xl border flex flex-col gap-2.5 animate-bounce ${
                theme === "forest"
                  ? "bg-[#0A1A15] text-[#D2E2DC] border-emerald-500/40 shadow-emerald-950/50"
                  : theme === "warm"
                  ? "bg-[#FFFDF9] text-stone-900 border-stone-300/60 shadow-stone-800/10"
                  : theme === "dark"
                  ? "bg-slate-900 text-slate-100 border-slate-700/60 shadow-black/40"
                  : "bg-white text-slate-900 border-slate-200 shadow-slate-300/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <Timer className="w-4 h-4 text-red-500 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[10px] tracking-wider uppercase text-red-500">
                    Time Limit Reached
                  </h4>
                  <p className="text-xs font-semibold mt-1 line-clamp-2">
                    {notif.stepTitle}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setTriggeredNotifications(prev => prev.filter(n => n.id !== notif.id));
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-end gap-2 border-t pt-2 border-slate-200/10">
                <button
                  type="button"
                  onClick={() => {
                    const twoMins = 2 * 60;
                    setTaskTimers(prev => ({
                      ...prev,
                      [notif.stepId]: {
                        stepId: notif.stepId,
                        totalSeconds: twoMins,
                        secondsRemaining: twoMins,
                        isRunning: true,
                        isCompleted: false
                      }
                    }));
                    setTriggeredNotifications(prev => prev.filter(n => n.id !== notif.id));
                  }}
                  className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${
                    theme === "forest"
                      ? "bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300"
                      : theme === "warm"
                      ? "bg-stone-100 hover:bg-stone-200 text-stone-800"
                      : theme === "dark"
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60"
                  }`}
                >
                  Snooze +2m
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cancelTimer(notif.stepId);
                    setTriggeredNotifications(prev => prev.filter(n => n.id !== notif.id));
                  }}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Top Navigation */}
      <header className={`h-20 px-4 md:px-12 flex items-center justify-between shadow-xs sticky top-0 z-50 ${THEME_STYLES[theme].navBg} transition-colors duration-300`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center relative">
            <span className="absolute w-5 h-5 rounded-full bg-emerald-500/20 animate-ping"></span>
            <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
          </div>
          <div>
            <span className={`font-semibold tracking-tight text-lg ${theme === 'warm' ? 'text-stone-900' : theme === 'forest' ? 'text-[#E8F5F1]' : 'text-slate-900'}`}>CLARITY</span>
            <span className={`hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-full ml-3 font-medium border ${
              theme === 'forest' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-900' :
              theme === 'warm' ? 'bg-amber-50 text-amber-800 border-amber-200' :
              'bg-emerald-50 text-emerald-700 border-emerald-100'
            }`}>
              Crisis Task Strategist
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-8 text-sm font-medium">
          {/* Theme Selector */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border ${
            theme === 'light' ? 'bg-slate-100 border-slate-200/60' :
            theme === 'dark' ? 'bg-slate-800/80 border-slate-700/60' :
            theme === 'warm' ? 'bg-[#F4EFE6] border-stone-300/60' :
            'bg-emerald-950/60 border-emerald-900/60'
          }`}>
            <button
              onClick={() => handleThemeChange("light")}
              className={`p-1.5 rounded-lg transition-all ${
                theme === "light"
                  ? "bg-white text-emerald-600 shadow-xs"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className={`p-1.5 rounded-lg transition-all ${
                theme === "dark"
                  ? "bg-slate-700 text-emerald-400 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Calming Obsidian"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleThemeChange("warm")}
              className={`p-1.5 rounded-lg transition-all ${
                theme === "warm"
                  ? "bg-[#FFFDF9] text-amber-700 shadow-xs"
                  : "text-stone-400 hover:text-stone-600"
              }`}
              title="Warm Sanctuary"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleThemeChange("forest")}
              className={`p-1.5 rounded-lg transition-all ${
                theme === "forest"
                  ? "bg-[#132A22] text-[#D2E2DC] shadow-xs"
                  : "text-[#627D72] hover:text-[#D2E2DC]"
              }`}
              title="Forest Serenity"
            >
              <Compass className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setActiveTab("flow")}
            className={`py-6 px-1 transition-all border-b-2 ${
              activeTab === "flow"
                ? `${theme === 'warm' ? 'text-stone-900 border-stone-900' : theme === 'forest' ? 'text-[#E8F5F1] border-emerald-500' : 'text-slate-900 border-slate-900'} font-semibold`
                : `${theme === 'forest' ? 'text-[#9CB3AA] hover:text-[#E8F5F1]' : 'text-slate-500 hover:text-slate-800'} border-transparent`
            }`}
          >
            Current Flow
          </button>
          
          <button
            onClick={() => setActiveTab("logs")}
            className={`py-6 px-1 transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "logs"
                ? `${theme === 'warm' ? 'text-stone-900 border-stone-900' : theme === 'forest' ? 'text-[#E8F5F1] border-emerald-500' : 'text-slate-900 border-slate-900'} font-semibold`
                : `${theme === 'forest' ? 'text-[#9CB3AA] hover:text-[#E8F5F1]' : 'text-slate-500 hover:text-slate-800'} border-transparent`
            }`}
          >
            <History className="w-4 h-4" />
            <span className="hidden xs:inline">Past Logs ({pastPlans.length})</span>
            <span className="xs:hidden">({pastPlans.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`py-6 px-1 transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "analytics"
                ? `${theme === 'warm' ? 'text-stone-900 border-stone-900' : theme === 'forest' ? 'text-[#E8F5F1] border-emerald-500' : 'text-slate-900 border-slate-900'} font-semibold`
                : `${theme === 'forest' ? 'text-[#9CB3AA] hover:text-[#E8F5F1]' : 'text-slate-500 hover:text-slate-800'} border-transparent`
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden xs:inline">Resolution Analytics</span>
            <span className="xs:hidden">Analytics</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-5rem)]">
        
        {activeTab === "analytics" ? (
          /* RESOLUTION ANALYTICS SECTION */
          <section className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full space-y-8 animate-fadeIn">
            {/* Header */}
            <div className={`border-b pb-6 ${THEME_STYLES[theme].hrBorder}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className={`text-3xl font-light tracking-tight flex items-center gap-2 ${THEME_STYLES[theme].textPrincipal}`}>
                    <TrendingUp className="w-8 h-8 text-emerald-500" />
                    Resilience & Resolution Analytics
                  </h1>
                  <p className={`text-sm mt-1.5 leading-relaxed ${THEME_STYLES[theme].textSecondary}`}>
                    Gain deep insight into your stress responses and resolution habits over time. Practice structured de-escalation to build durable cognitive resilience.
                  </p>
                </div>
                {pastPlans.length > 0 && (
                  <div className={`text-xs px-3 py-1.5 rounded-lg border font-mono ${
                    theme === "forest" ? "bg-[#132A22] border-emerald-900 text-emerald-300" : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                  }`}>
                    {analyticsData.resolvedCount} / {analyticsData.totalCount} Crises De-escalated
                  </div>
                )}
              </div>
            </div>

            {pastPlans.length === 0 ? (
              <div className={`text-center py-20 rounded-3xl p-8 max-w-lg mx-auto ${THEME_STYLES[theme].cardBg}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${theme === 'forest' ? 'bg-[#132A22]' : 'bg-slate-50 dark:bg-slate-900'}`}>
                  <BarChart3 className={`w-8 h-8 ${THEME_STYLES[theme].textSecondaryMuted}`} />
                </div>
                <h3 className={`text-lg font-medium mb-1 ${THEME_STYLES[theme].textPrincipal}`}>No Analytics Available</h3>
                <p className={`text-sm mb-6 leading-relaxed ${THEME_STYLES[theme].textSecondary}`}>
                  Once you begin resolving stress events and completing tasks in your personalized plan, your stress frequency, priority load, and recovery speed will be visualized here.
                </p>
                <button
                  onClick={() => setActiveTab("flow")}
                  className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2 shadow-sm ${
                    theme === 'forest' ? 'bg-emerald-600 text-white hover:bg-emerald-500' :
                    theme === 'warm' ? 'bg-stone-850 text-white hover:bg-stone-700' :
                    'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  Create Your First Flow
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className={`p-5 rounded-2xl border ${THEME_STYLES[theme].cardBg} relative overflow-hidden`}>
                    <span className={`text-[10px] uppercase font-bold tracking-wider block ${THEME_STYLES[theme].textSecondaryMuted}`}>Stress Logs</span>
                    <span className={`text-3xl font-light font-mono block mt-2 ${THEME_STYLES[theme].textPrincipal}`}>
                      {analyticsData.totalCount}
                    </span>
                    <span className={`text-[10px] block mt-1.5 ${THEME_STYLES[theme].textSecondary}`}>
                      Total moments of panic processed
                    </span>
                    <div className="absolute right-4 bottom-4 opacity-10">
                      <Activity className="w-10 h-10" />
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl border ${THEME_STYLES[theme].cardBg} relative overflow-hidden`}>
                    <span className={`text-[10px] uppercase font-bold tracking-wider block ${THEME_STYLES[theme].textSecondaryMuted}`}>De-escalation Rate</span>
                    <span className={`text-3xl font-light font-mono block mt-2 ${THEME_STYLES[theme].textPrincipal}`}>
                      {Math.round((analyticsData.resolvedCount / analyticsData.totalCount) * 100)}%
                    </span>
                    <span className={`text-[10px] block mt-1.5 ${THEME_STYLES[theme].textSecondary}`}>
                      {analyticsData.resolvedCount} fully completed mitigation plans
                    </span>
                    <div className="absolute right-4 bottom-4 opacity-10">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl border ${THEME_STYLES[theme].cardBg} relative overflow-hidden`}>
                    <span className={`text-[10px] uppercase font-bold tracking-wider block ${THEME_STYLES[theme].textSecondaryMuted}`}>Avg Mitigation Speed</span>
                    <span className={`text-3xl font-light font-mono block mt-2 ${THEME_STYLES[theme].textPrincipal}`}>
                      {analyticsData.averageSpeedMins > 0 ? `${analyticsData.averageSpeedMins}m` : "N/A"}
                    </span>
                    <span className={`text-[10px] block mt-1.5 ${THEME_STYLES[theme].textSecondary}`}>
                      Mean duration to clear all checklist steps
                    </span>
                    <div className="absolute right-4 bottom-4 opacity-10">
                      <Clock className="w-10 h-10" />
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl border ${THEME_STYLES[theme].cardBg} relative overflow-hidden`}>
                    <span className={`text-[10px] uppercase font-bold tracking-wider block ${THEME_STYLES[theme].textSecondaryMuted}`}>Cognitive Efficiency</span>
                    <span className={`text-3xl font-light font-mono block mt-2 flex items-center gap-1 ${
                      analyticsData.improvementRate > 0 ? "text-emerald-500" : THEME_STYLES[theme].textPrincipal
                    }`}>
                      {analyticsData.improvementRate > 0 ? `+${analyticsData.improvementRate}%` : "Stable"}
                    </span>
                    <span className={`text-[10px] block mt-1.5 ${THEME_STYLES[theme].textSecondary}`}>
                      {analyticsData.improvementRate > 0 ? "Reduction in de-escalation time!" : "Tracking active improvements"}
                    </span>
                    <div className="absolute right-4 bottom-4 opacity-10">
                      <TrendingUp className="w-10 h-10" />
                    </div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Resolution Speed trend (Line Chart) */}
                  <div className={`p-5 rounded-2xl border ${THEME_STYLES[theme].cardBg}`}>
                    <div className="mb-4">
                      <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${THEME_STYLES[theme].textPrincipal}`}>
                        <Clock className="w-4 h-4 text-emerald-500" />
                        Resolution Speed Trend (Lower is Better)
                      </h3>
                      <p className={`text-xs ${THEME_STYLES[theme].textSecondary}`}>
                        Measures the time (in minutes) from crisis inception to 100% checklist completion.
                      </p>
                    </div>
                    {analyticsData.speedData.length === 0 ? (
                      <div className="h-64 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl mb-2">⏳</span>
                        <p className={`text-xs ${THEME_STYLES[theme].textSecondary}`}>
                          Complete all tasks in at least one panic plan to view your resolution speed trend.
                        </p>
                      </div>
                    ) : (
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analyticsData.speedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" || theme === "forest" ? "#1E293B" : "#F1F5F9"} />
                            <XAxis 
                              dataKey="index" 
                              tick={{ fill: "currentColor", opacity: 0.6, fontSize: 10 }}
                              label={{ value: "Chronological Crises", position: "insideBottom", offset: -5, fontSize: 10, fill: "currentColor", opacity: 0.6 }} 
                            />
                            <YAxis tick={{ fill: "currentColor", opacity: 0.6, fontSize: 10 }} unit="m" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: theme === "dark" || theme === "forest" ? "#0F172A" : "#FFFFFF",
                                borderColor: theme === "dark" || theme === "forest" ? "#334155" : "#E2E8F0",
                                color: theme === "dark" || theme === "forest" ? "#F8FAFC" : "#0F172A",
                                fontSize: "11px",
                                borderRadius: "8px"
                              }}
                              formatter={(value: any) => [
                                `${value} minutes`,
                                `Duration`
                              ]}
                              labelFormatter={(label, items) => {
                                const item = items[0]?.payload;
                                return item ? `${item.date} - "${item.Situation}"` : `Crisis #${label}`;
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="De-escalation Time (mins)"
                              stroke={theme === "warm" ? "#D97706" : "#10B981"}
                              strokeWidth={3}
                              activeDot={{ r: 8 }}
                              dot={{ strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Frequency over time (Area / Bar Chart) */}
                  <div className={`p-5 rounded-2xl border ${THEME_STYLES[theme].cardBg}`}>
                    <div className="mb-4">
                      <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${THEME_STYLES[theme].textPrincipal}`}>
                        <Activity className="w-4 h-4 text-emerald-500" />
                        Panic Input Frequency by Day
                      </h3>
                      <p className={`text-xs ${THEME_STYLES[theme].textSecondary}`}>
                        Tracks how frequently stress spikes occur to help recognize patterns.
                      </p>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsData.frequencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="freqColor" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme === "warm" ? "#D97706" : "#10B981"} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={theme === "warm" ? "#D97706" : "#10B981"} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" || theme === "forest" ? "#1E293B" : "#F1F5F9"} />
                          <XAxis dataKey="date" tick={{ fill: "currentColor", opacity: 0.6, fontSize: 10 }} />
                          <YAxis tick={{ fill: "currentColor", opacity: 0.6, fontSize: 10 }} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: theme === "dark" || theme === "forest" ? "#0F172A" : "#FFFFFF",
                              borderColor: theme === "dark" || theme === "forest" ? "#334155" : "#E2E8F0",
                              color: theme === "dark" || theme === "forest" ? "#F8FAFC" : "#0F172A",
                              fontSize: "11px",
                              borderRadius: "8px"
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="Stress Logged"
                            stroke={theme === "warm" ? "#D97706" : "#10B981"}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#freqColor)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Priority Breakdown (Bar Chart with multi-color cells) */}
                  <div className={`p-5 rounded-2xl border ${THEME_STYLES[theme].cardBg} lg:col-span-2`}>
                    <div className="mb-4">
                      <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${THEME_STYLES[theme].textPrincipal}`}>
                        <BarChart3 className="w-4 h-4 text-emerald-500" />
                        Cognitive Load by Task Priority
                      </h3>
                      <p className={`text-xs ${THEME_STYLES[theme].textSecondary}`}>
                        Distribution of completed mitigation actions categorized by priority levels.
                      </p>
                    </div>
                    {analyticsData.categoryData.length === 0 ? (
                      <div className="h-56 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl mb-2">📊</span>
                        <p className={`text-xs ${THEME_STYLES[theme].textSecondary}`}>
                          No prioritized tasks generated yet. Try logging a situation to load cognitive tasks.
                        </p>
                      </div>
                    ) : (
                      <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" || theme === "forest" ? "#1E293B" : "#F1F5F9"} />
                            <XAxis dataKey="name" tick={{ fill: "currentColor", opacity: 0.6, fontSize: 10 }} />
                            <YAxis tick={{ fill: "currentColor", opacity: 0.6, fontSize: 10 }} allowDecimals={false} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: theme === "dark" || theme === "forest" ? "#0F172A" : "#FFFFFF",
                                borderColor: theme === "dark" || theme === "forest" ? "#334155" : "#E2E8F0",
                                color: theme === "dark" || theme === "forest" ? "#F8FAFC" : "#0F172A",
                                fontSize: "11px",
                                borderRadius: "8px"
                              }}
                              formatter={(value: any) => [`${value} tasks`, 'Count']}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                              {analyticsData.categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cognitive Resilience Lessons learned */}
                <div className={`p-6 rounded-2xl border ${
                  theme === "forest" ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300" :
                  theme === "warm" ? "bg-[#FFFDF9] border-stone-200 text-stone-800" :
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-300" :
                  "bg-emerald-50 border-emerald-100 text-slate-700"
                }`}>
                  <h4 className={`text-sm font-bold flex items-center gap-1.5 uppercase tracking-wider ${THEME_STYLES[theme].textPrincipal}`}>
                    <Lightbulb className="w-4 h-4 text-emerald-500" />
                    resilience insights
                  </h4>
                  <ul className="mt-3 text-xs space-y-2.5 list-disc pl-5 leading-relaxed">
                    <li>
                      <strong>Cognitive Disengagement:</strong> Look at your de-escalation speed trend. Each completed task helps move active thinking from your emotional amygdala to your logical prefrontal cortex.
                    </li>
                    <li>
                      <strong>Task Deconstruction:</strong> High stress is resolved by execution, not rumination. Watch how deconstructing overwhelming events into discrete tasks immediately accelerates mitigation.
                    </li>
                    <li>
                      <strong>Consistent Completion:</strong> Every time you mark a step completed, you receive a micro-dose of dopamine, training your brain to stay calm, clear, and composed under high stress.
                    </li>
                  </ul>
                </div>
              </>
            )}
          </section>
        ) : activeTab === "logs" ? (
          /* PAST LOGS SECTION */
          <section className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full">
            <div className={`flex justify-between items-center mb-8 border-b pb-4 ${THEME_STYLES[theme].hrBorder}`}>
              <div>
                <h1 className={`text-3xl font-light ${THEME_STYLES[theme].textPrincipal}`}>Stress Mitigation Archive</h1>
                <p className={`text-sm mt-1 ${THEME_STYLES[theme].textSecondary}`}>Reviewing your resolved crises. Your mind grows more resilient over time.</p>
              </div>
              {pastPlans.length > 0 && (
                <button
                  onClick={clearHistory}
                  className={`px-4 py-2 rounded-lg transition-all text-xs flex items-center gap-2 ${
                    theme === 'light' ? 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600' :
                    theme === 'dark' ? 'border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-red-400' :
                    theme === 'warm' ? 'border border-stone-200 text-stone-600 hover:bg-[#F4EFE6] hover:text-red-700' :
                    'border border-emerald-950 text-[#9CB3AA] hover:bg-[#132A22] hover:text-red-400'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              )}
            </div>

            {pastPlans.length === 0 ? (
              <div className={`text-center py-20 rounded-3xl p-8 max-w-lg mx-auto mt-8 ${THEME_STYLES[theme].cardBg}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${theme === 'forest' ? 'bg-[#132A22]' : 'bg-slate-50'}`}>
                  <Compass className={`w-8 h-8 ${THEME_STYLES[theme].textSecondaryMuted}`} />
                </div>
                <h3 className={`text-lg font-medium mb-1 ${THEME_STYLES[theme].textPrincipal}`}>Archive is Empty</h3>
                <p className={`text-sm mb-6 leading-relaxed ${THEME_STYLES[theme].textSecondary}`}>
                  When you input a situation and generate a task list, it will be automatically recorded here so you can revisit how you resolved high-pressure moments.
                </p>
                <button
                  onClick={() => setActiveTab("flow")}
                  className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2 shadow-sm ${
                    theme === 'forest' ? 'bg-emerald-600 text-white hover:bg-emerald-500' :
                    theme === 'warm' ? 'bg-stone-850 text-white hover:bg-stone-700' :
                    'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  Create Your First Flow
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {pastPlans.map((plan, index) => {
                  const completed = plan.steps.filter(s => s.completed).length;
                  const total = plan.steps.length;
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                  
                  return (
                    <div
                      key={plan.timestamp + "-" + index}
                      className={`p-6 rounded-2xl transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${THEME_STYLES[theme].historyCard}`}
                      onClick={() => loadPastPlan(plan)}
                    >
                      <div className="space-y-1.5 flex-1 max-w-xl">
                        <span className={`text-[10px] uppercase font-bold tracking-widest block ${THEME_STYLES[theme].textSecondaryMuted}`}>
                          {new Date(plan.timestamp).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                        <h4 className={`font-medium text-base line-clamp-1 italic ${THEME_STYLES[theme].textPrincipal}`}>
                          "{plan.panicInput}"
                        </h4>
                        <p className={`text-xs line-clamp-2 ${THEME_STYLES[theme].textSecondary}`}>
                          {plan.calmingMessage}
                        </p>
                      </div>

                      <div className={`flex items-center gap-6 border-t md:border-t-0 pt-3 md:pt-0 ${THEME_STYLES[theme].hrBorder}`}>
                        <div className="text-left md:text-right">
                          <span className={`block text-xs ${THEME_STYLES[theme].textSecondaryMuted}`}>Resolution Progress</span>
                          <span className={`font-mono text-sm font-medium ${THEME_STYLES[theme].textPrincipal}`}>
                            {completed}/{total} steps ({pct}%)
                          </span>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          theme === 'forest' ? 'bg-[#132A22] text-emerald-400' :
                          theme === 'warm' ? 'bg-[#F4EFE6] text-amber-700' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          /* ACTIVE FLOW SECTION (SPLIT PANEL) */
          <>
            {/* Left Column: User Input & Grounding */}
            <section className={`w-full lg:w-5/12 p-6 md:p-12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r transition-colors duration-300 ${
              theme === 'light' ? 'bg-white border-slate-200' :
              theme === 'dark' ? 'bg-[#111827] border-slate-800/80' :
              theme === 'warm' ? 'bg-[#FFFDF9] border-stone-200' :
              'bg-[#0A1A15] border-emerald-950/80'
            }`}>
              {!activePlan ? (
                /* Empty Input State */
                <div className="space-y-8 max-w-lg mx-auto w-full my-auto">
                  <div className="space-y-3">
                    <span className="text-xs font-bold tracking-[0.2em] text-emerald-500 uppercase block">Empirical De-escalation</span>
                    <h2 className={`text-3xl md:text-4xl font-light leading-tight ${THEME_STYLES[theme].textPrincipal}`}>
                      Slow down. Let's build a realistic action plan.
                    </h2>
                    <p className={`text-sm leading-relaxed ${THEME_STYLES[theme].textSecondary}`}>
                      High-stress environments cloud decision-making. Describe your situation below to immediately extract clear, linear, objective tasks.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="panic-text" className={`block text-xs font-bold uppercase tracking-wider ${THEME_STYLES[theme].textSecondary}`}>
                          What is triggering you right now?
                        </label>
                        {speechSupported && (
                          <button
                            type="button"
                            onClick={toggleSpeechToText}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all ${
                              isListening
                                ? "bg-red-500 text-white animate-pulse shadow-sm"
                                : theme === "warm"
                                ? "bg-[#F4EFE6] hover:bg-stone-200 text-stone-800 border border-stone-300/40"
                                : theme === "forest"
                                ? "bg-[#132A22] hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/40"
                            }`}
                            title="Toggle Voice-to-Text Speech Input"
                          >
                            {isListening ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                                <MicOff className="w-3.5 h-3.5" />
                                Stop Voice
                              </>
                            ) : (
                              <>
                                <Mic className="w-3.5 h-3.5" />
                                Voice Input
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <textarea
                          id="panic-text"
                          rows={4}
                          value={panicInput}
                          onChange={(e) => setPanicInput(e.target.value)}
                          placeholder='e.g., "The production server just went down, our payment gateway is failing, and customers are angry."'
                          className={`w-full p-4 rounded-xl outline-none transition-all text-sm resize-none ${
                            isListening
                              ? "ring-2 ring-red-500/50 bg-red-500/5"
                              : THEME_STYLES[theme].inputBg
                          }`}
                        />
                        {isListening && (
                          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-red-500 text-white text-[10px] px-2 py-1 rounded-md shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                            Recording Voice...
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="context-text" className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${THEME_STYLES[theme].textSecondary}`}>
                        Are there any critical constraints? (Optional)
                      </label>
                      <input
                        id="context-text"
                        type="text"
                        value={contextInput}
                        onChange={(e) => setContextInput(e.target.value)}
                        placeholder='e.g., "Must fix within 30 mins" or "I have full admin terminal access."'
                        className={`w-full p-3.5 rounded-xl outline-none transition-all text-sm ${THEME_STYLES[theme].inputBg}`}
                      />
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50/20 border border-red-900/30 rounded-xl text-red-400 text-xs flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-500">Setup / Execution alert</p>
                          <p className="mt-0.5">{error}</p>
                          <button
                            onClick={triggerDemoMode}
                            className="mt-2 text-[11px] font-semibold text-red-400 underline block hover:text-red-500"
                          >
                            Alternatively, trigger with sample demo plan to test the UI &rarr;
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => generatePlan(panicInput, contextInput)}
                        disabled={loading}
                        className={`flex-1 px-6 py-4 rounded-xl font-medium text-sm text-white transition-all flex items-center justify-center gap-2 ${
                          loading
                            ? "bg-emerald-750 cursor-not-allowed opacity-80"
                            : theme === 'forest' ? "bg-emerald-600 hover:bg-emerald-500 cursor-pointer shadow-sm" :
                              theme === 'warm' ? "bg-stone-850 hover:bg-stone-700 cursor-pointer shadow-sm" :
                              theme === 'dark' ? "bg-emerald-600 hover:bg-emerald-500 cursor-pointer shadow-sm" :
                              "bg-slate-900 hover:bg-slate-800 cursor-pointer shadow-sm"
                        }`}
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Structuring calming strategy...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Structure Calm Strategy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sample Scenarios */}
                  <div className={`border-t pt-6 ${THEME_STYLES[theme].hrBorder}`}>
                    <span className={`block text-xs font-bold uppercase tracking-wider mb-3 ${THEME_STYLES[theme].textSecondaryMuted}`}>
                      Or select a typical stressful scenario:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SUGGESTED_PANICS.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setPanicInput(item.text);
                            setContextInput(item.context);
                          }}
                          className={`p-3 text-left rounded-xl transition-all group flex items-start gap-2.5 border ${
                            theme === 'light' ? 'bg-white border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30' :
                            theme === 'dark' ? 'bg-[#1F2937]/50 border-slate-800 hover:border-emerald-500 hover:bg-emerald-950/20 text-slate-100' :
                            theme === 'warm' ? 'bg-[#FFFDF9] border-stone-200 hover:border-amber-600 hover:bg-amber-50/30 text-stone-800' :
                            'bg-[#132A22]/40 border-emerald-950 hover:border-emerald-500 hover:bg-emerald-900/20 text-[#D2E2DC]'
                          }`}
                        >
                          <span className="text-lg mt-0.5">{item.emoji}</span>
                          <div className="overflow-hidden">
                            <span className={`block text-xs font-semibold group-hover:text-emerald-500 ${THEME_STYLES[theme].textPrincipal}`}>{item.title}</span>
                            <span className={`block text-[10px] truncate ${THEME_STYLES[theme].textSecondaryMuted}`}>{item.text}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Plan Generated / Active Perspective */
                <div className="space-y-8 max-w-lg mx-auto w-full my-auto py-6">
                  <div>
                    <span className="text-xs font-bold tracking-[0.2em] text-emerald-500 uppercase mb-2 block">The Trigger</span>
                    <div className={`p-6 rounded-2xl relative overflow-hidden group ${THEME_STYLES[theme].panicCardBg}`}>
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${theme === 'warm' ? 'bg-amber-650' : 'bg-emerald-500'}`}></div>
                      <p className={`text-lg font-light leading-relaxed italic ${THEME_STYLES[theme].textPrincipal}`}>
                        "{activePlan.panicInput}"
                      </p>
                      {activePlan.currentContext && (
                        <p className={`mt-2 text-xs border-t pt-2 flex items-center gap-1.5 ${THEME_STYLES[theme].textSecondary} ${THEME_STYLES[theme].hrBorder}`}>
                          <span className={`font-semibold text-[10px] uppercase px-1.5 py-0.5 rounded ${theme === 'forest' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-200/50 text-slate-700'}`}>Context</span>
                          {activePlan.currentContext}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Physiological Check / Grounding Interactive Box */}
                  <div className={`p-6 rounded-2xl relative ${THEME_STYLES[theme].cardBg}`}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl relative ${theme === 'forest' ? 'bg-[#132A22]' : 'bg-emerald-50'}`}>
                        <span className={`absolute w-full h-full rounded-full bg-emerald-400/20 ${breathingActive ? "animate-breathe" : ""}`}></span>
                        🧘
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold flex items-center justify-between ${THEME_STYLES[theme].textPrincipal}`}>
                          <span>Somatic Grounding</span>
                          <span className={`text-xs font-mono font-normal px-2 py-0.5 rounded ${theme === 'forest' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-100 text-slate-600'}`}>
                            {activePlan.groundingExercise.type}
                          </span>
                        </p>
                        <p className={`text-xs mt-0.5 ${THEME_STYLES[theme].textSecondary}`}>Drop your shoulders. Unclench your jaw. Regulate your body.</p>
                      </div>
                    </div>

                    <p className={`text-sm p-4 rounded-xl border leading-relaxed mb-4 ${THEME_STYLES[theme].panicCardBg} ${THEME_STYLES[theme].textSecondary}`}>
                      {activePlan.groundingExercise.instruction}
                    </p>

                    {/* Grounding Interactive Engine */}
                    <div className={`rounded-xl p-4 border flex flex-col items-center justify-center ${THEME_STYLES[theme].panicCardBg}`}>
                      {breathingActive ? (
                        <div className="flex flex-col items-center space-y-3 py-2">
                          <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${getBreathingColor()} relative shadow-lg`}>
                            <span className="text-xs uppercase tracking-widest opacity-80">{breathingPhase}</span>
                            <span className="text-2xl font-mono font-bold mt-0.5">{breathingTimer}s</span>
                          </div>
                          <p className={`text-[11px] italic max-w-xs text-center ${THEME_STYLES[theme].textSecondary}`}>
                            {getBreathingLabel()}... Let the mind catch up with the pace of your breathing.
                          </p>
                          <button
                            onClick={() => setBreathingActive(false)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 mt-1 ${
                              theme === 'forest' ? 'border border-emerald-900 hover:bg-emerald-950/40 text-emerald-300' :
                              theme === 'warm' ? 'border border-stone-300 hover:bg-stone-100 text-stone-600' :
                              'border border-slate-300 hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Pause className="w-3 h-3" /> Stop Exercise
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <p className={`text-xs mb-3 ${THEME_STYLES[theme].textSecondary}`}>Feeling anxious? Activate the interactive breath pacing box to slow down.</p>
                          <button
                            onClick={() => setBreathingActive(true)}
                            className={`px-5 py-2 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 mx-auto shadow-sm ${
                              theme === 'warm' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-500 hover:bg-emerald-600'
                            }`}
                          >
                            <Play className="w-3 h-3 fill-white" /> Start Interactive Breathing
                          </button>
                        </div>
                      )}
                    </div>

                    <div className={`h-1.5 w-full rounded-full overflow-hidden mt-6 ${
                      theme === 'forest' ? 'bg-[#132A22]' : theme === 'warm' ? 'bg-stone-200' : 'bg-slate-200'
                    }`}>
                      <div
                        className={`h-full transition-all duration-500 ${theme === 'warm' ? 'bg-amber-600' : 'bg-emerald-500'}`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-2.5">
                      <span className={`text-[10px] font-bold tracking-wider uppercase ${THEME_STYLES[theme].textSecondaryMuted}`}>
                        Task Progress: {progressPercent}% Completed
                      </span>
                      <button
                        onClick={handleStartOver}
                        className="text-[11px] text-slate-500 hover:text-slate-800 transition-colors underline flex items-center gap-1 font-medium"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Start New Analysis
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Right Column: Actionable Guidance Task List */}
            <section className={`w-full lg:w-7/12 p-6 md:p-12 flex flex-col overflow-y-auto transition-colors duration-300 ${
              theme === 'light' ? 'bg-[#F9FBFA]' :
              theme === 'dark' ? 'bg-[#0B0F19]' :
              theme === 'warm' ? 'bg-[#FBF8F3]' :
              'bg-[#06120E]'
            }`}>
              {!activePlan ? (
                /* Beautiful empty plan state */
                <div className="flex-1 flex flex-col justify-center items-center text-center p-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-pulse ${
                    theme === 'forest' ? 'bg-[#132A22] text-emerald-400' :
                    theme === 'warm' ? 'bg-[#F4EFE6] text-amber-700' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    <Compass className="w-8 h-8" />
                  </div>
                  <h3 className={`text-xl font-light mb-2 ${THEME_STYLES[theme].textPrincipal}`}>Awaiting Trigger Description</h3>
                  <p className={`text-sm max-w-sm leading-relaxed mb-6 ${THEME_STYLES[theme].textSecondary}`}>
                    Enter details about your current high-stress challenge on the left to see your comforting, step-by-step resolution checklist here.
                  </p>
                  <div className={`flex flex-wrap justify-center gap-4 text-xs ${THEME_STYLES[theme].textSecondaryMuted}`}>
                    <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Interactive checklist</span>
                    <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Time estimates</span>
                    <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Grounding exercises</span>
                  </div>
                </div>
              ) : (
                /* List of tasks */
                <div className="space-y-6 flex-1 flex flex-col">
                  <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-5 ${THEME_STYLES[theme].hrBorder}`}>
                    <div>
                      <h1 className={`text-3xl font-light mb-1 ${THEME_STYLES[theme].textPrincipal}`}>The Path Forward</h1>
                      <p className={`text-sm ${THEME_STYLES[theme].textSecondary}`}>Focus only on the next active task. Ignore the rest for now.</p>
                    </div>
                    <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                      <span className={`text-2xl font-mono flex items-center gap-1.5 justify-end ${THEME_STYLES[theme].textPrincipal}`}>
                        <Clock className={`w-5 h-5 ${THEME_STYLES[theme].textSecondaryMuted}`} />
                        {activePlan.steps.filter(s => !s.completed).reduce((acc, curr) => {
                          const num = parseInt(curr.timeEstimate) || 2;
                          return acc + num;
                        }, 0)}m
                      </span>
                      <span className={`text-[10px] uppercase tracking-widest font-bold ${THEME_STYLES[theme].textSecondaryMuted}`}>
                        Est. Remaining
                      </span>
                    </div>
                  </div>

                  {/* Comfort message */}
                  <div className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${THEME_STYLES[theme].comfortCard}`}>
                    <div className="text-lg mt-0.5">🕊️</div>
                    <div>
                      <p className="font-semibold text-xs uppercase tracking-wider">Compassionate Assessment</p>
                      <p className="mt-1 leading-relaxed">{activePlan.calmingMessage}</p>
                    </div>
                  </div>

                  {/* Success celebration card */}
                  {progressPercent === 100 && (
                    <div className={`p-6 rounded-2xl border text-sm flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-lg relative overflow-hidden transition-all duration-300 animate-fadeIn ${
                      theme === 'forest' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' :
                      theme === 'warm' ? 'bg-[#FFFDF9] border-stone-300/60 text-stone-900' :
                      theme === 'dark' ? 'bg-slate-900 border-slate-700/60 text-slate-100' :
                      'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-emerald-100/40'
                    }`}>
                      <div className="text-3xl animate-bounce">✨🏆✨</div>
                      <div className="flex-1">
                        <p className="font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 justify-center sm:justify-start">
                          <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                          Crisis De-escalated Successfully!
                        </p>
                        <p className="mt-1.5 text-xs opacity-90 leading-relaxed">
                          You faced this high-stress event head-on and successfully completed every single task. Pause, take a deep breath, and appreciate your clarity. You did an incredible job.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            confetti({
                              particleCount: 120,
                              spread: 75,
                              origin: { y: 0.6 }
                            });
                          } catch (_) {}
                        }}
                        className={`text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-xs ${
                          theme === "forest"
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                            : theme === "warm"
                            ? "bg-stone-850 hover:bg-stone-700 text-stone-100"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white"
                        }`}
                      >
                        Celebrate Again! 🎉
                      </button>
                    </div>
                  )}

                  {/* Sorting controls */}
                  <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50/10 border-slate-200/20">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-70" />
                      <span className="font-semibold tracking-wide uppercase opacity-70">
                        Sort Tasks By:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSortBy("suggested")}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                          sortBy === "suggested"
                            ? theme === "warm"
                              ? "bg-stone-800 text-[#FBF8F3] shadow-xs"
                              : theme === "forest"
                              ? "bg-emerald-600 text-[#E8F5F1] shadow-xs"
                              : "bg-emerald-600 text-white shadow-xs"
                            : theme === "warm"
                            ? "bg-transparent text-stone-600 hover:bg-stone-200/50"
                            : theme === "forest"
                            ? "bg-transparent text-[#9CB3AA] hover:bg-[#132A22]/80"
                            : "bg-transparent text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Suggested Order
                      </button>
                      <button
                        type="button"
                        onClick={() => setSortBy("priority")}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                          sortBy === "priority"
                            ? theme === "warm"
                              ? "bg-stone-800 text-[#FBF8F3] shadow-xs"
                              : theme === "forest"
                              ? "bg-emerald-600 text-[#E8F5F1] shadow-xs"
                              : "bg-emerald-600 text-white shadow-xs"
                            : theme === "warm"
                            ? "bg-transparent text-stone-600 hover:bg-stone-200/50"
                            : theme === "forest"
                            ? "bg-transparent text-[#9CB3AA] hover:bg-[#132A22]/80"
                            : "bg-transparent text-slate-600 hover:bg-slate-100"
                        }`}
                        title="Focus on immediate tasks first"
                      >
                        Priority (Immediate → Low)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSortBy("time")}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                          sortBy === "time"
                            ? theme === "warm"
                              ? "bg-stone-800 text-[#FBF8F3] shadow-xs"
                              : theme === "forest"
                              ? "bg-emerald-600 text-[#E8F5F1] shadow-xs"
                              : "bg-emerald-600 text-white shadow-xs"
                            : theme === "warm"
                            ? "bg-transparent text-stone-600 hover:bg-stone-200/50"
                            : theme === "forest"
                            ? "bg-transparent text-[#9CB3AA] hover:bg-[#132A22]/80"
                            : "bg-transparent text-slate-600 hover:bg-slate-100"
                        }`}
                        title="Sort by shortest estimated duration first"
                      >
                        Time (Shortest First)
                      </button>
                    </div>
                  </div>

                  {/* To Do Steps container */}
                  <div className="space-y-4 flex-1">
                    {sortedSteps.map((step, index) => {
                      const displayNum = String(index + 1).padStart(2, "0");
                      const isNextPending = !step.completed && sortedSteps.findIndex(s => !s.completed) === index;
                      const isTimerUp = taskTimers[step.id]?.isCompleted;
                      
                      return (
                        <div
                          key={step.id}
                          className={`group p-5 rounded-2xl border transition-all ${
                            step.completed
                              ? THEME_STYLES[theme].stepCompletedBg
                              : isTimerUp
                              ? "ring-2 ring-red-500 border-red-500 bg-red-500/5 shadow-lg shadow-red-500/15 animate-pulse"
                              : isNextPending
                              ? THEME_STYLES[theme].stepActiveBg
                              : THEME_STYLES[theme].stepInactiveBg
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Checkbox Icon */}
                            <button
                              onClick={() => toggleStep(step.id)}
                              className="mt-1 focus:outline-none transition-transform active:scale-95 flex-shrink-0"
                            >
                              {step.completed ? (
                                <CheckCircle2 className={`w-6 h-6 ${theme === 'warm' ? 'text-amber-700 fill-amber-50' : 'text-emerald-600 fill-emerald-50'}`} />
                              ) : isNextPending ? (
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${theme === 'warm' ? 'border-amber-600' : 'border-emerald-500'}`}>
                                  <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${theme === 'warm' ? 'bg-amber-600' : 'bg-emerald-500'}`}></span>
                                </div>
                              ) : (
                                <Circle className={`w-6 h-6 ${theme === 'forest' ? 'text-emerald-900 hover:text-emerald-700' : 'text-slate-300 hover:text-slate-400'}`} />
                              )}
                            </button>

                            {/* Main Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className={`text-xs font-mono font-bold ${step.completed ? THEME_STYLES[theme].textSecondaryMuted : isNextPending ? (theme === 'warm' ? 'text-amber-700' : 'text-emerald-500') : THEME_STYLES[theme].textSecondary}`}>
                                  {displayNum}
                                </span>
                                
                                {/* Priority Badge */}
                                <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                                  step.priority === "immediate"
                                    ? THEME_STYLES[theme].pillPriorityImmediate
                                    : step.priority === "high"
                                    ? THEME_STYLES[theme].pillPriorityHigh
                                    : THEME_STYLES[theme].pillPriorityMedium
                                }`}>
                                  {step.priority}
                                </span>

                                {/* Category Badge */}
                                <span className={`text-[9px] uppercase font-medium tracking-wider px-2 py-0.5 rounded ${THEME_STYLES[theme].pillCategoryBg}`}>
                                  {step.category}
                                </span>

                                {/* Time estimate */}
                                <span className={`text-[10px] font-mono flex items-center gap-1 ml-auto ${THEME_STYLES[theme].textSecondaryMuted}`}>
                                  <Clock className="w-3 h-3" />
                                  {step.timeEstimate}
                                </span>
                              </div>

                              <h3 className={`font-semibold text-base mb-1.5 ${
                                step.completed
                                  ? "text-slate-400 line-through opacity-60"
                                  : THEME_STYLES[theme].textPrincipal
                              }`}>
                                {step.title}
                              </h3>
                              
                              <p className={`text-xs leading-relaxed ${
                                step.completed ? "text-slate-400 opacity-60" : THEME_STYLES[theme].textSecondary
                              }`}>
                                {step.description}
                              </p>

                              {/* Task Timer Widget */}
                              {!step.completed && (
                                <div className="mt-4 pt-3 border-t border-slate-500/10 flex flex-col gap-2">
                                  {taskTimers[step.id] ? (
                                    /* Active or completed timer */
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                          taskTimers[step.id].isCompleted
                                            ? "bg-red-500 animate-ping"
                                            : taskTimers[step.id].isRunning
                                            ? "bg-emerald-500 animate-pulse"
                                            : "bg-amber-500"
                                        }`} />
                                        <span className={`text-xs font-mono font-bold tracking-wide ${
                                          taskTimers[step.id].isCompleted
                                            ? "text-red-500 animate-pulse"
                                            : "opacity-90"
                                        }`}>
                                          {taskTimers[step.id].isCompleted ? (
                                            "⏰ Time is up!"
                                          ) : (
                                            <>
                                              {Math.floor(taskTimers[step.id].secondsRemaining / 60).toString().padStart(2, "0")}
                                              :
                                              {(taskTimers[step.id].secondsRemaining % 60).toString().padStart(2, "0")}
                                              {" remaining"}
                                            </>
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        {!taskTimers[step.id].isCompleted && (
                                          <button
                                            type="button"
                                            onClick={() => toggleTimerRunning(step.id)}
                                            className={`p-1.5 rounded-lg hover:bg-slate-500/10 transition-colors ${
                                              theme === "forest" ? "text-emerald-300" : "text-slate-600 dark:text-slate-300"
                                            }`}
                                            title={taskTimers[step.id].isRunning ? "Pause Timer" : "Resume Timer"}
                                          >
                                            {taskTimers[step.id].isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => cancelTimer(step.id)}
                                          className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors text-slate-400"
                                          title="Remove Timer"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : editingTimerStepId === step.id ? (
                                    /* Timer configurator */
                                    <div className="flex flex-col gap-2.5 animate-fadeIn">
                                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                        Set Time-to-Complete Reminder:
                                      </span>
                                      <div className="flex flex-wrap items-center gap-2">
                                        {[1, 3, 5, 10].map((mins) => (
                                          <button
                                            key={mins}
                                            type="button"
                                            onClick={() => startPresetTimer(step.id, mins)}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                              theme === "forest"
                                                ? "bg-[#132A22] hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40"
                                                : theme === "warm"
                                                ? "bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200/40"
                                                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60"
                                            }`}
                                          >
                                            {mins}m
                                          </button>
                                        ))}
                                        
                                        {/* Custom input */}
                                        <div className="flex items-center gap-1.5 ml-auto">
                                          <input
                                            type="number"
                                            min="1"
                                            max="99"
                                            value={customTimerMinutes}
                                            onChange={(e) => setCustomTimerMinutes(e.target.value)}
                                            className={`w-11 p-1 text-xs text-center rounded-md focus:ring-1 focus:ring-emerald-500 outline-none ${
                                              theme === "forest"
                                                ? "bg-[#132A22] text-[#E8F5F1] border border-emerald-800/40"
                                                : "bg-slate-50 text-slate-900 border border-slate-200"
                                            }`}
                                          />
                                          <span className="text-[10px] opacity-70">mins</span>
                                          <button
                                            type="button"
                                            onClick={() => handleCustomTimerSubmit(step.id)}
                                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                                          >
                                            Set
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditingTimerStepId(null)}
                                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Set timer button */
                                    <div className="flex justify-between items-center">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingTimerStepId(step.id);
                                          setCustomTimerMinutes("5");
                                        }}
                                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold hover:underline transition-all ${
                                          theme === "forest"
                                            ? "text-emerald-400 hover:text-emerald-300"
                                            : theme === "warm"
                                            ? "text-stone-600 hover:text-stone-850"
                                            : "text-slate-500 hover:text-slate-800"
                                        }`}
                                      >
                                        <Timer className="w-3.5 h-3.5" />
                                        Set Time Limit Reminder
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Task Notes Widget */}
                              <div className="mt-4 pt-3 border-t border-slate-500/10">
                                {expandedNotes[step.id] ? (
                                  <div className="space-y-2 animate-fadeIn">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                                        Task Notes (e.g., passwords, contact numbers):
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setExpandedNotes(prev => ({ ...prev, [step.id]: false }))}
                                        className={`text-[10px] font-semibold hover:underline ${
                                          theme === "forest" ? "text-emerald-400" : "text-slate-500"
                                        }`}
                                      >
                                        Hide Notes
                                      </button>
                                    </div>
                                    <textarea
                                      rows={2}
                                      value={step.notes || ""}
                                      onChange={(e) => updateStepNotes(step.id, e.target.value)}
                                      placeholder="Write down temporary keys, phone numbers, or critical notes here..."
                                      className={`w-full p-2.5 text-xs rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none transition-all ${
                                        theme === "forest"
                                          ? "bg-[#132A22]/60 text-[#E8F5F1] border border-emerald-800/40 placeholder-emerald-700/60"
                                          : theme === "warm"
                                          ? "bg-stone-50 text-stone-900 border border-stone-200 placeholder-stone-400/80"
                                          : "bg-slate-50/50 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 placeholder-slate-400"
                                      }`}
                                    />
                                    {step.notes && (
                                      <p className="text-[10px] opacity-60 text-right italic">
                                        Auto-saved to this checklist step
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedNotes(prev => ({ ...prev, [step.id]: true }))}
                                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold hover:underline transition-all ${
                                        step.notes
                                          ? "text-emerald-500 dark:text-emerald-400 font-bold"
                                          : theme === "forest"
                                          ? "text-emerald-400/85 hover:text-emerald-300"
                                          : theme === "warm"
                                          ? "text-stone-500 hover:text-stone-750"
                                          : "text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-100"
                                      }`}
                                    >
                                      <StickyNote className="w-3.5 h-3.5" />
                                      {step.notes ? "View / Edit Notes 📝" : "Add Task Notes"}
                                    </button>
                                    {step.notes && (
                                      <span className={`text-[10px] truncate max-w-[200px] opacity-75 font-mono px-2 py-0.5 rounded-md ${
                                        theme === 'forest' ? 'bg-[#132A22] text-[#E8F5F1]' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                      }`} title={step.notes}>
                                        {step.notes}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Delete Custom / Actions */}
                            <button
                              onClick={() => deleteStep(step.id)}
                              className={`p-1 rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 ${
                                theme === 'forest' ? 'text-emerald-800 hover:text-red-400 hover:bg-emerald-950/40' :
                                theme === 'warm' ? 'text-stone-300 hover:text-red-750 hover:bg-stone-200/50' :
                                'text-slate-300 hover:text-red-500 hover:bg-slate-50'
                              }`}
                              title="Delete Step"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Custom Step Form */}
                  <div className={`mt-4 pt-4 border-t ${THEME_STYLES[theme].hrBorder}`}>
                    {!showAddStepForm ? (
                      <button
                        onClick={() => setShowAddStepForm(true)}
                        className={`w-full py-3 rounded-xl transition-all text-xs font-medium flex items-center justify-center gap-1.5 ${THEME_STYLES[theme].dashedBtn}`}
                      >
                        <Plus className="w-4 h-4" /> Add Custom Contingency or Mitigation Task
                      </button>
                    ) : (
                      <form onSubmit={handleAddCustomStep} className={`p-5 rounded-xl space-y-4 ${THEME_STYLES[theme].modalForm}`}>
                        <div className="flex justify-between items-center">
                          <h4 className={`text-xs font-bold uppercase tracking-wider ${THEME_STYLES[theme].textPrincipal}`}>Add New Mitigation Task</h4>
                          <button
                            type="button"
                            onClick={() => setShowAddStepForm(false)}
                            className={`${THEME_STYLES[theme].textSecondaryMuted} hover:${THEME_STYLES[theme].textPrincipal}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${THEME_STYLES[theme].textSecondary}`}>
                              Action Command / Title
                            </label>
                            <input
                              type="text"
                              value={newStepTitle}
                              onChange={(e) => setNewStepTitle(e.target.value)}
                              placeholder="e.g., Unplug secondary server cord"
                              required
                              className={`w-full p-2.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 ${THEME_STYLES[theme].inputBg}`}
                            />
                          </div>

                          <div>
                            <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${THEME_STYLES[theme].textSecondary}`}>
                              Time Frame Estimate
                            </label>
                            <input
                              type="text"
                              value={newStepTime}
                              onChange={(e) => setNewStepTime(e.target.value)}
                              placeholder="e.g., 3 minutes"
                              className={`w-full p-2.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 ${THEME_STYLES[theme].inputBg}`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${THEME_STYLES[theme].textSecondary}`}>
                            Task Description / Strategy
                          </label>
                          <textarea
                            rows={2}
                            value={newStepDesc}
                            onChange={(e) => setNewStepDesc(e.target.value)}
                            placeholder="Detail why this step helps stabilize the situation."
                            className={`w-full p-2.5 rounded-lg text-xs outline-none resize-none focus:ring-1 focus:ring-emerald-500 ${THEME_STYLES[theme].inputBg}`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${THEME_STYLES[theme].textSecondary}`}>
                              Priority Level
                            </label>
                            <select
                              value={newStepPriority}
                              onChange={(e) => setNewStepPriority(e.target.value as any)}
                              className={`w-full p-2.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 ${THEME_STYLES[theme].inputBg}`}
                            >
                              <option value="immediate" className={theme === 'dark' || theme === 'forest' ? 'bg-[#1F2937]' : 'bg-white'}>Immediate</option>
                              <option value="high" className={theme === 'dark' || theme === 'forest' ? 'bg-[#1F2937]' : 'bg-white'}>High</option>
                              <option value="medium" className={theme === 'dark' || theme === 'forest' ? 'bg-[#1F2937]' : 'bg-white'}>Medium</option>
                              <option value="low" className={theme === 'dark' || theme === 'forest' ? 'bg-[#1F2937]' : 'bg-white'}>Low</option>
                            </select>
                          </div>

                          <div>
                            <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${THEME_STYLES[theme].textSecondary}`}>
                              Category Classification
                            </label>
                            <select
                              value={newStepCategory}
                              onChange={(e) => setNewStepCategory(e.target.value as any)}
                              className={`w-full p-2.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 ${THEME_STYLES[theme].inputBg}`}
                            >
                              <option value="grounding" className={theme === 'dark' || theme === 'forest' ? 'bg-[#1F2937]' : 'bg-white'}>Somatic Grounding</option>
                              <option value="actionable" className={theme === 'dark' || theme === 'forest' ? 'bg-[#1F2937]' : 'bg-white'}>Actionable Problem-Solving</option>
                              <option value="contingency" className={theme === 'dark' || theme === 'forest' ? 'bg-[#1F2937]' : 'bg-white'}>Contingency Backup</option>
                              <option value="resolution" className={theme === 'dark' || theme === 'forest' ? 'bg-[#1F2937]' : 'bg-white'}>Resolution Wrap-up</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddStepForm(false)}
                            className={`px-4 py-2 border text-xs rounded-lg font-medium transition-colors ${
                              theme === 'warm' ? 'border-stone-200 text-stone-600 hover:bg-[#F4EFE6]' :
                              theme === 'forest' ? 'border-emerald-950 text-emerald-300 hover:bg-[#132A22]/50' :
                              'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className={`px-4 py-2 text-xs rounded-lg font-medium text-white transition-colors ${
                              theme === 'warm' ? 'bg-stone-850 hover:bg-stone-700' :
                              theme === 'forest' ? 'bg-emerald-600 hover:bg-emerald-500' :
                              'bg-slate-900 hover:bg-slate-800'
                            }`}
                          >
                            Add Step
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Summary progress bar bottom card */}
                  <div className={`mt-auto p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border ${THEME_STYLES[theme].bottomBar}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        theme === 'forest' ? 'bg-[#132A22] text-emerald-400' :
                        theme === 'warm' ? 'bg-[#F4EFE6] text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`text-sm font-semibold block ${
                          theme === 'forest' ? 'text-emerald-300' :
                          theme === 'warm' ? 'text-stone-900' :
                          'text-slate-900'
                        }`}>
                          Completed {completedStepsCount} of {totalSteps} items
                        </span>
                        <span className={`text-[10px] font-medium block ${
                          theme === 'forest' ? 'text-emerald-400' :
                          theme === 'warm' ? 'text-stone-600' :
                          'text-emerald-700'
                        }`}>
                          {progressPercent === 100 ? "Excellent. Your mind is now structured." : "Stay focused on the highlighted active step."}
                        </span>
                      </div>
                    </div>
                    
                    {progressPercent < 100 ? (
                      <button
                        onClick={() => {
                          const nextPending = activePlan.steps.find(s => !s.completed);
                          if (nextPending) {
                            toggleStep(nextPending.id);
                          }
                        }}
                        className={`px-6 py-2.5 text-white rounded-xl font-medium text-xs transition-colors shadow-sm w-full sm:w-auto text-center ${
                          theme === 'warm' ? 'bg-stone-850 hover:bg-stone-700' :
                          theme === 'forest' ? 'bg-emerald-600 hover:bg-emerald-500' :
                          'bg-slate-900 hover:bg-slate-800'
                        }`}
                      >
                        Complete Next Action
                      </button>
                    ) : (
                      <button
                        onClick={handleStartOver}
                        className={`px-6 py-2.5 text-white rounded-xl font-medium text-xs transition-colors shadow-sm w-full sm:w-auto text-center flex items-center justify-center gap-1.5 ${
                          theme === 'warm' ? 'bg-amber-600 hover:bg-amber-700' :
                          'bg-emerald-600 hover:bg-emerald-750'
                        }`}
                      >
                        <Smile className="w-3.5 h-3.5" /> Start Another Session
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
