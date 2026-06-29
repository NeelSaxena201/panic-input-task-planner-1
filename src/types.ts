export interface GroundingExercise {
  type: string;
  instruction: string;
}

export type StepPriority = "immediate" | "high" | "medium" | "low";
export type StepCategory = "grounding" | "actionable" | "contingency" | "resolution";

export interface TaskStep {
  id: string;
  title: string;
  description: string;
  timeEstimate: string;
  priority: StepPriority;
  category: StepCategory;
  completed: boolean;
  isCustom?: boolean;
  notes?: string;
}

export interface CalmPlan {
  calmingMessage: string;
  groundingExercise: GroundingExercise;
  steps: TaskStep[];
  panicInput: string;
  currentContext?: string;
  timestamp: number;
  completedAt?: number;
}
