import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS Middleware to prevent any possible browser "Failed to fetch" or block issues
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Initialize Gemini client safely using server-side key
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "MOCK_KEY_FOR_LINT",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Heuristic-based local fallback plan generator for peak hours or API interruptions
  function generateLocalFallbackPlan(panicInput: string, currentContext?: string) {
    const input = panicInput.toLowerCase();
    
    // Core default fallback structure
    let calmingMessage = "Deep breaths. Even though things feel overwhelming right now, we can break them down step-by-step. Let's focus purely on what we can control.";
    let groundingType = "Physiological Sigh";
    let groundingInstruction = "Take two quick, deep breaths in through your nose (one full breath, then a sharp extra inhale at the top), then let out a slow, long, relaxed exhale through your mouth. Repeat 3 times to immediately lower your heart rate.";
    
    let steps = [
      {
        id: "fb-step1",
        title: "Step back and take 3 deep breaths",
        description: "Stop typing, click away from the active screen, and sit comfortably. Grounding your body halts the adrenaline loop and restores logical thinking.",
        timeEstimate: "30 seconds",
        priority: "immediate",
        category: "grounding"
      },
      {
        id: "fb-step2",
        title: "Identify the worst-case outcome",
        description: "Define the worst thing that can actually happen. Often, our minds exaggerate the immediate danger. Naming the scenario makes it logical and manageable.",
        timeEstimate: "2 minutes",
        priority: "high",
        category: "grounding"
      },
      {
        id: "fb-step3",
        title: "Isolate a single point of control",
        description: "Find one small action you can complete in the next 5 minutes. If it's a massive task, isolate a tiny part of it to begin progress.",
        timeEstimate: "3 minutes",
        priority: "high",
        category: "actionable"
      },
      {
        id: "fb-step4",
        title: "Establish a safety net or holding status",
        description: "Notify any waiting parties with a brief, calm message to buy time. Communicating a status lowers outer expectations and relieves pressure.",
        timeEstimate: "2 minutes",
        priority: "medium",
        category: "contingency"
      },
      {
        id: "fb-step5",
        title: "Stabilize and review next steps",
        description: "Once the immediate peak of stress passes, write down what worked and what didn't. This builds resilience for future high-pressure moments.",
        timeEstimate: "5 minutes",
        priority: "low",
        category: "resolution"
      }
    ];

    // Tailor based on technology/systems keywords
    if (input.includes("server") || input.includes("production") || input.includes("db") || input.includes("database") || input.includes("deploy") || input.includes("code") || input.includes("bug") || input.includes("crash") || input.includes("error") || input.includes("failure")) {
      calmingMessage = "Technical alerts are highly stressful, but systems can always be redeployed, database backups can be restored, and code can be reverted. This is a technical puzzle, not a permanent emergency.";
      groundingType = "5-4-3-2-1 Sensory Reset";
      groundingInstruction = "Name 5 things you can see on your desk, 4 physical sensations, 3 sounds around you, 2 scents, and 1 positive belief about your troubleshooting capability.";
      steps = [
        {
          id: "tech-fb-step1",
          title: "Pause and stop making blind changes",
          description: "Adrenaline makes us want to apply hotfixes rapidly, which often introduces new bugs. Stop, pause, and let the system sit while you gather telemetry.",
          timeEstimate: "1 minute",
          priority: "immediate",
          category: "grounding"
        },
        {
          id: "tech-fb-step2",
          title: "Identify the last known change or deploy",
          description: "The majority of technical outages are caused by recent changes. Review git logs, environment variables, or packages modified in the last 24 hours.",
          timeEstimate: "3 minutes",
          priority: "high",
          category: "actionable"
        },
        {
          id: "tech-fb-step3",
          title: "Execute a temporary rollback if available",
          description: "If a recent build broke, revert to the last working commit or build immediately rather than debugging live code in a panic.",
          timeEstimate: "5 minutes",
          priority: "high",
          category: "contingency"
        },
        {
          id: "tech-fb-step4",
          title: "Send a composed status update to stakeholders",
          description: "Send a brief note: 'We are actively investigating a service interruption. Expect updates every 15 minutes.' This stops the influx of distracted notifications.",
          timeEstimate: "2 minutes",
          priority: "medium",
          category: "contingency"
        },
        {
          id: "tech-fb-step5",
          title: "Analyze logs systematically",
          description: "Check server stdout/stderr, database connections, and network status. Follow the stack trace step-by-step from top to bottom.",
          timeEstimate: "10 minutes",
          priority: "medium",
          category: "actionable"
        },
        {
          id: "tech-fb-step6",
          title: "Post-Incident review and system stabilization",
          description: "Once the service is stable, verify everything is fully functional, monitor memory metrics, and document the root cause for future reference.",
          timeEstimate: "5 minutes",
          priority: "low",
          category: "resolution"
        }
      ];
    }
    // Tailor based on deadlines, presentations, exams, or tests
    else if (input.includes("deadline") || input.includes("exam") || input.includes("presentation") || input.includes("speech") || input.includes("talk") || input.includes("interview") || input.includes("test") || input.includes("school") || input.includes("class")) {
      calmingMessage = "Performance anxiety is a natural response. Remember: your preparation is already done, or you have exactly enough time to focus on the highest-impact elements right now.";
      groundingType = "Box Breathing";
      groundingInstruction = "Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold empty for 4 seconds. Repeat 4 times to steady your adrenaline and vocal cords.";
      steps = [
        {
          id: "perf-fb-step1",
          title: "Clear your immediate workspace",
          description: "A cluttered workspace feeds a cluttered mind. Put away unnecessary items, close unrelated tabs, and place a glass of water nearby.",
          timeEstimate: "1 minute",
          priority: "immediate",
          category: "grounding"
        },
        {
          id: "perf-fb-step2",
          title: "Draft an ultra-simplified outline of core points",
          description: "Write down 3 key concepts or takeaways on a scratchpad. Keep it simple to prevent cognitive overload during active performance.",
          timeEstimate: "3 minutes",
          priority: "high",
          category: "actionable"
        },
        {
          id: "perf-fb-step3",
          title: "Practice a 1-minute slow-paced dry run",
          description: "Speak your opening line at half-speed out loud. This sets your natural speaking tempo and lowers your heart rate.",
          timeEstimate: "2 minutes",
          priority: "high",
          category: "grounding"
        },
        {
          id: "perf-fb-step4",
          title: "Establish a safety net or notes file",
          description: "Keep bullet points or outline files open and easily accessible. Knowing you have notes to glance at reduces performance anxiety by 90%.",
          timeEstimate: "2 minutes",
          priority: "medium",
          category: "contingency"
        },
        {
          id: "perf-fb-step5",
          title: "Settle and enter the event calmly",
          description: "Do not rush in at the exact second. Sit down, adjust your chair/camera, take a sip of water, and trust your instinctive capability.",
          timeEstimate: "2 minutes",
          priority: "low",
          category: "resolution"
        }
      ];
    }
    // Tailor based on arguments, angry clients, bosses, customers
    else if (input.includes("customer") || input.includes("client") || input.includes("angry") || input.includes("argument") || input.includes("fight") || input.includes("boss") || input.includes("manager") || input.includes("dispute") || input.includes("conflict")) {
      calmingMessage = "When dealing with high emotion from others, remember: their reaction is about their own frustration, not your worth as a person. Keep an objective emotional distance.";
      groundingType = "Mindful Listening Reset";
      groundingInstruction = "Close your eyes for 15 seconds. Listen specifically for the absolute quietest background sound in your room. Focus entirely on that tone.";
      steps = [
        {
          id: "conflict-fb-step1",
          title: "Adopt a neutral listening posture",
          description: "Listen without interrupting. Let them fully discharge their anger or concern. Acknowledging their emotion reduces their defensive response.",
          timeEstimate: "2 minutes",
          priority: "immediate",
          category: "grounding"
        },
        {
          id: "conflict-fb-step2",
          title: "Write down their core complaints objectively",
          description: "Strip away the emotional adjectives and write down the cold facts of what they actually need resolved. This keeps your brain analytical.",
          timeEstimate: "2 minutes",
          priority: "high",
          category: "actionable"
        },
        {
          id: "conflict-fb-step3",
          title: "Validate their stress and mirror it back",
          description: "Say: 'I completely hear your frustration. This is definitely not the experience we want you to have, and I am here to help resolve it.'",
          timeEstimate: "1 minute",
          priority: "high",
          category: "actionable"
        },
        {
          id: "conflict-fb-step4",
          title: "Propose a single clear immediate step",
          description: "Present a path forward: 'Here is what I am doing right now: I will investigate [issue] and message you with a status within 10 minutes.'",
          timeEstimate: "2 minutes",
          priority: "medium",
          category: "contingency"
        },
        {
          id: "conflict-fb-step5",
          title: "Execute the action and follow up calmly",
          description: "Deliver on the promised task. Keep the correspondence brief, professional, and completely free of defensive explanations.",
          timeEstimate: "5 minutes",
          priority: "medium",
          category: "resolution"
        }
      ];
    }
    // Tailor based on money or financial stress
    else if (input.includes("money") || input.includes("bill") || input.includes("bank") || input.includes("pay") || input.includes("cost") || input.includes("fee") || input.includes("expensive") || input.includes("card")) {
      calmingMessage = "Financial issues are extremely distressing, but they are numerical problems that can always be structured, scheduled, or negotiated over time.";
      groundingType = "Grounding Sole Touch";
      groundingInstruction = "Place both feet completely flat on the floor. Focus all of your attention on the feeling of weight and pressure on the soles of your feet for 10 seconds.";
      steps = [
        {
          id: "money-fb-step1",
          title: "Take a deep breath and face the numbers",
          description: "Anxiety prompts us to avoid checking balances or looking at bills. Confront the numbers calmly. Knowing the precise amount is the first step of power.",
          timeEstimate: "2 minutes",
          priority: "immediate",
          category: "grounding"
        },
        {
          id: "money-fb-step2",
          title: "Check your current account safety buffer",
          description: "Verify your exact available liquidity. Know exactly how much time you have before any payment is drafted or processed.",
          timeEstimate: "2 minutes",
          priority: "high",
          category: "actionable"
        },
        {
          id: "money-fb-step3",
          title: "Request a temporary extension or payment plan",
          description: "Most institutions have grace periods, payment plans, or extensions. Call or log into their system to request a temporary delay before any fees are incurred.",
          timeEstimate: "5 minutes",
          priority: "high",
          category: "contingency"
        },
        {
          id: "money-fb-step4",
          title: "Prioritize essential living and security bills first",
          description: "If funds are low, cover absolute essentials (housing, water, food, power) first. Secondary bills can wait or be negotiated without immediate crisis.",
          timeEstimate: "3 minutes",
          priority: "medium",
          category: "actionable"
        },
        {
          id: "money-fb-step5",
          title: "Create a simple calendar marker for review",
          description: "Put a marker on your calendar 3 days from now to review your balance and options calmly. Rest your mind from thinking about it until then.",
          timeEstimate: "2 minutes",
          priority: "low",
          category: "resolution"
        }
      ];
    }

    // Append context-specific step if a context is provided
    if (currentContext && currentContext.trim()) {
      steps.splice(2, 0, {
        id: "fb-context-step",
        title: "Incorporate constraint adjustment",
        description: `Reviewing your constraint: "${currentContext}". Tailor your immediate tasks to respect this limitation safely.`,
        timeEstimate: "2 minutes",
        priority: "high",
        category: "actionable"
      });
    }

    return {
      calmingMessage: `[AI System Peak Hours - Fallback Mode Activated] ${calmingMessage}`,
      groundingExercise: {
        type: groundingType,
        instruction: groundingInstruction
      },
      steps
    };
  }

  // Helper function to call generateContent with retry logic for transient high demand or rate limits
  async function generateContentWithRetry(aiClient: any, params: any, retries = 2, delayMs = 500): Promise<any> {
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        return await aiClient.models.generateContent(params);
      } catch (err: any) {
        const isRateLimitOrDemand = err?.status === 503 || err?.status === 429 || 
          (err?.message && (err.message.includes("503") || err.message.includes("429") || err.message.includes("high demand") || err.message.includes("Resource has been exhausted") || err.message.includes("UNAVAILABLE")));
        if (isRateLimitOrDemand && attempt <= retries) {
          console.warn(`[Gemini API] Request returned high demand/rate limit (status: ${err?.status}). Retrying attempt ${attempt} of ${retries} in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          delayMs *= 2;
          continue;
        }
        throw err;
      }
    }
  }

  // API endpoint for generating panic plans
  app.post("/api/plan", async (req, res) => {
    const { panicInput, currentContext } = req.body;
    try {
      if (!panicInput || typeof panicInput !== "string" || !panicInput.trim()) {
        return res.status(400).json({ error: "Please express what is causing you stress or panic." });
      }

      if (!process.env.GEMINI_API_KEY) {
        // Fallback gracefully even if API key is not configured!
        console.warn("GEMINI_API_KEY is not configured. Falling back to local plan generation.");
        const fallbackPlan = generateLocalFallbackPlan(panicInput, currentContext);
        return res.json(fallbackPlan);
      }

      const prompt = `The user is in a high-stress "panic" situation. Here is their chaotic, frantic description:
"${panicInput}"

${currentContext && currentContext.trim() ? `Additional constraints or contextual details: "${currentContext}"` : ""}

Analyze this situation and produce a structured, comforting response containing:
1. calmingMessage: Empirical reassurance that de-escalates stress.
2. groundingExercise: A physical or sensory reset (like Box Breathing) to perform immediately.
3. steps: An ordered list of actionable items. The items should start with direct mitigation of the stressor or urgent immediate actions, followed by rational problem-solving, and ending with restoration or preventing future occurrences.

Make sure every step has practical, simple details, priority, category, and an estimated timeframe. Keep it highly realistic and specific to their input.`;

      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a calm, competent crisis coach and action strategist. Your objective is to take frantic, panicked, chaotic human input and distill it into a deeply structured, reassuring, step-by-step to-do list. Your tone should be extremely composed, grounding, direct, and reassuring. Avoid technical jargon or sterile clinical language, but use warmth and empirical logic. Never echo panic. Return data strictly according to the specified JSON schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              calmingMessage: {
                type: Type.STRING,
                description: "A highly tailored, comforting, grounding reassurance addressing their specific stressor (1-2 sentences maximum)."
              },
              groundingExercise: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "Title of a grounding exercise (e.g., '5-4-3-2-1 Sensory Reset', 'Box Breathing', 'Physiological Sigh')" },
                  instruction: { type: Type.STRING, description: "Short, clear instructions (2-3 sentences max) to guide them in performing this somatic grounding exercise right now." }
                },
                required: ["type", "instruction"]
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "A simple unique slug (e.g. 'step1', 'step2')" },
                    title: { type: Type.STRING, description: "An actionable, direct command emphasizing control and action (e.g., 'Unhook the power cord' or 'Notify the host')" },
                    description: { type: Type.STRING, description: "Detailed, comforting instructions on how to do this step and why it helps." },
                    timeEstimate: { type: Type.STRING, description: "Quick time frame (e.g., '10 seconds', '2 minutes', '5 minutes')" },
                    priority: { type: Type.STRING, description: "One of: 'immediate', 'high', 'medium', 'low'" },
                    category: { type: Type.STRING, description: "One of: 'grounding' (mental/physical), 'actionable' (direct problem solving), 'contingency' (backup/safety net), 'resolution' (wrapping up/aftercare)" }
                  },
                  required: ["id", "title", "description", "timeEstimate", "priority", "category"]
                }
              }
            },
            required: ["calmingMessage", "groundingExercise", "steps"]
          }
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response received from the calming advisor.");
      }

      const planData = JSON.parse(responseText.trim());
      res.json(planData);
    } catch (err: any) {
      console.warn("[Graceful Fallback] Active fallback mode. Gemini API generated an exception or was unavailable. Activating high-fidelity local fallback generator.", err?.message || err);
      try {
        const fallbackPlan = generateLocalFallbackPlan(panicInput, currentContext);
        res.json(fallbackPlan);
      } catch (fallbackErr: any) {
        console.error("Critical: Failed to generate local fallback plan:", fallbackErr?.message || fallbackErr);
        res.status(500).json({ error: "An error occurred while building your task list. Please try again." });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
