export type DepositSource = "salario" | "renda_extra" | "venda" | "outro";

export type Deposit = {
  id: string;
  amount: number;
  date: string; // ISO yyyy-mm-dd
  note?: string;
  source?: DepositSource;
};

export type GoalConfig = {
  goal: number;
  deadline?: string;
  startDate: string;
  monthlyTarget?: number;
  income?: number;
};

export type DailyChecklist = {
  date: string; // yyyy-mm-dd
  guardou: boolean;
  rendaExtra: boolean;
  evitouGasto: boolean;
};

export type ChallengeProgress = {
  startedAt?: string; // yyyy-mm-dd
  completed: number[]; // indices de dias completados (0..6)
};

const DEPOSITS_KEY = "meta10k.deposits";
const CONFIG_KEY = "meta10k.config";
const ONBOARDING_KEY = "meta10k.onboarding";
const CHECKLIST_KEY = "meta10k.checklist";
const CHALLENGE_KEY = "meta10k.challenge";

export const defaultConfig = (): GoalConfig => ({
  goal: 10000,
  startDate: new Date().toISOString().slice(0, 10),
  deadline: new Date(new Date().setMonth(new Date().getMonth() + 10))
    .toISOString()
    .slice(0, 10),
});

const safeRead = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const loadDeposits = (): Deposit[] => safeRead<Deposit[]>(DEPOSITS_KEY, []);
export const saveDeposits = (d: Deposit[]) =>
  localStorage.setItem(DEPOSITS_KEY, JSON.stringify(d));

export const loadConfig = (): GoalConfig => safeRead<GoalConfig>(CONFIG_KEY, defaultConfig());
export const saveConfig = (c: GoalConfig) =>
  localStorage.setItem(CONFIG_KEY, JSON.stringify(c));

export const loadOnboardingDone = (): boolean =>
  safeRead<boolean>(ONBOARDING_KEY, false);
export const saveOnboardingDone = (v: boolean) =>
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(v));

export const loadChecklist = (): DailyChecklist[] =>
  safeRead<DailyChecklist[]>(CHECKLIST_KEY, []);
export const saveChecklist = (c: DailyChecklist[]) =>
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(c));

export const loadChallenge = (): ChallengeProgress =>
  safeRead<ChallengeProgress>(CHALLENGE_KEY, { completed: [] });
export const saveChallenge = (c: ChallengeProgress) =>
  localStorage.setItem(CHALLENGE_KEY, JSON.stringify(c));

export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const SOURCE_LABEL: Record<DepositSource, string> = {
  salario: "Salário",
  renda_extra: "Renda extra",
  venda: "Venda",
  outro: "Outro",
};

// Marcos / Níveis
export type Level = { value: number; label: string; emoji: string };
export const LEVELS: Level[] = [
  { value: 100, label: "Início", emoji: "🌱" },
  { value: 500, label: "Saindo da média", emoji: "🚶" },
  { value: 1000, label: "Primeiro marco", emoji: "🎯" },
  { value: 5000, label: "Meio do caminho", emoji: "🔥" },
  { value: 10000, label: "Meta final", emoji: "🏆" },
];

export const getCurrentLevel = (saved: number, goal: number) => {
  const scaled = LEVELS.map((l) => ({ ...l, value: (l.value / 10000) * goal }));
  let current = scaled[0];
  let next: typeof scaled[number] | null = scaled[0];
  for (const l of scaled) {
    if (saved >= l.value) {
      current = l;
    }
  }
  next = scaled.find((l) => l.value > saved) ?? null;
  return { current, next, scaled };
};
