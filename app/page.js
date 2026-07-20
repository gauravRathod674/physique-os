"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  Home,
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  Ruler,
  Target,
  Brain,
  ChevronDown,
  ChevronUp,
  Check,
  Plus,
  Minus,
  Droplets,
  Trophy,
  Calendar,
  Zap,
  Timer,
  ChevronRight,
  ChevronLeft,
  X,
  Star,
  Award,
  Activity,
  Footprints,
  Moon,
  Flame,
  BarChart2,
  Eye,
  EyeOff,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Minus as Dash,
} from "lucide-react";

// ── DESIGN TOKENS ──────────────────────────────────────────────────────────
const C = {
  P: "#00E5FF",
  A: "#38BDF8",
  S: "#22C55E",
  W: "#F59E0B",
  D: "#EF4444",
  bg: "#070C15",
  bg2: "#0D1526",
  bg3: "#111827",
  card: "rgba(13,21,38,0.85)",
  cardHover: "rgba(17,28,50,0.95)",
  border: "rgba(0,229,255,0.10)",
  borderHover: "rgba(0,229,255,0.25)",
  text: "#E2E8F0",
  muted: "#64748B",
  dim: "#334155",
};

// ── SCHEDULE & HELPERS ──────────────────────────────────────────────────────
const WEEK = ["Push", "Pull", "Legs", "Push", "Pull", "Legs", "Rest"];
const WALK_SESSION_MINUTES = 15;
const WALK_TARGETS = {
  Rest: { min: 60, max: 60, label: "60 min" },
  Legs: { min: 35, max: 45, label: "35–45 min" },
  Default: { min: 45, max: 45, label: "45 min" },
};
function getDayType(date = new Date()) {
  const d = date.getDay();
  return WEEK[d === 0 ? 6 : d - 1];
}
function fmt(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
function today() {
  return new Date().toISOString().slice(0, 10);
}
function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
function walkMinutes(value) {
  if (typeof value === "number") return value;
  return value ? WALK_SESSION_MINUTES : 0;
}
function hasWorkoutLogForDate(logs, dateKey) {
  return Object.keys(logs || {}).some(
    (exId) =>
      Array.isArray(logs[exId]) &&
      logs[exId].some((entry) => entry.date === dateKey),
  );
}
function workoutDoneForDate(logs, completions, dateKey) {
  return Boolean(completions?.[dateKey]);
}
function getWalkTarget(dayType) {
  return WALK_TARGETS[dayType] || WALK_TARGETS.Default;
}
function getNextBcaInfo(inbodyEntries) {
  const lastScan = inbodyEntries?.length
    ? inbodyEntries[inbodyEntries.length - 1]
    : null;
  const referenceDate = lastScan?.date ? new Date(lastScan.date) : new Date();
  const nextDate = addDays(referenceDate, 30);
  const msRemaining = nextDate.getTime() - Date.now();
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / 86400000));
  return {
    daysRemaining,
    nextDate,
  };
}
function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
function daysUntil(targetDay) {
  const d = new Date();
  let n = 0;
  while (true) {
    n++;
    d.setDate(d.getDate() + 1);
    if (getDayType(d) === "Push" && n > 0 && targetDay === "BCA") break;
    if (n > 30) break;
  }
  return 30;
}
const PUSH = [
  {
    id: "idp",
    name: "Incline Dumbbell Press",
    muscle: "Upper Chest",
    sec: "Front Delts, Triceps",
    sets: 3,
    range: [6, 10],
    rir: 2,
    tempo: "3-1-1",
    rest: 120,
    sw: 10,
    cues: [
      "Set bench around 30°",
      "Pull shoulder blades back and down",
      "Keep chest high and ribs controlled",
      "Lower dumbbells to upper chest line",
      "Press up and slightly inward",
    ],
    mistakes: [
      "Bench set too steep",
      "Flaring elbows too wide",
      "Bouncing off the bottom",
      "Cutting the stretch short",
      "Turning it into a shoulder press",
    ],
  },
  {
    id: "mcp",
    name: "Flat Dumbbell Press",
    muscle: "Chest",
    sec: "Front Delts, Triceps",
    sets: 3,
    range: [8, 12],
    rir: 1,
    tempo: "2-1-1",
    rest: 90,
    sw: 30,
    cues: [
      "Plant feet firmly on the floor",
      "Retract and depress your shoulder blades",
      "Lower dumbbells to mid chest with control",
      "Press upward in a slight arc",
      "Maintain full range of motion",
    ],
    mistakes: [
      "Bouncing the dumbbells",
      "Flaring elbows excessively",
      "Using partial range of motion",
      "Losing shoulder blade position",
      "Arching the lower back too much",
    ],
  },
  {
    id: "pec",
    name: "Pec Deck Fly",
    muscle: "Chest",
    sec: "Front Delts",
    sets: 3,
    range: [10, 15],
    rir: 1,
    tempo: "2-0-2",
    rest: 75,
    sw: 25,
    cues: [
      "Keep a soft bend in the elbows",
      "Lift the chest and keep shoulders back",
      "Open up fully for a deep stretch",
      "Bring hands together by squeezing the pecs",
      "Return slowly and under control",
    ],
    mistakes: [
      "Turning it into a press",
      "Shrugging the shoulders",
      "Using too much elbow bend",
      "Rushing the negative",
      "Stopping short of the stretch",
    ],
  },
  {
    id: "htl",
    name: "High to Low Cable Fly",
    muscle: "Lower Chest",
    sec: "Front Delts",
    sets: 3,
    range: [10, 15],
    rir: 1,
    tempo: "2-0-2",
    rest: 75,
    sw: 10,
    cues: [
      "Lean slightly forward",
      "Bring hands down toward hips",
      "Keep elbows softly bent",
      "Squeeze lower chest",
      "Control the stretch",
    ],
    mistakes: [
      "Using momentum",
      "Shrugging shoulders",
      "Bending elbows too much",
      "Not getting stretch",
      "Moving too fast",
    ],
  },

  {
    id: "lrm",
    name: "Lateral Raise Machine",
    muscle: "Lateral Delts",
    sec: "Upper Traps",
    sets: 4,
    range: [12, 20],
    rir: 1,
    tempo: "2-1-2",
    rest: 60,
    sw: 5,
    cues: [
      "Set shoulders down before each rep",
      "Lead the movement with the elbows",
      "Raise until shoulder height",
      "Pause briefly at the top",
      "Lower slowly without losing tension",
    ],
    mistakes: [
      "Shrugging into the traps",
      "Swinging the torso",
      "Lifting too high above shoulder level",
      "Using momentum on every rep",
      "Letting tension drop at the bottom",
    ],
  },
  {
    id: "ssp",
    name: "Seated Shoulder Press",
    muscle: "Lateral Delts",
    sec: "Front Delts, Triceps",
    sets: 2,
    range: [6, 10],
    rir: 2,
    tempo: "2-1-1",
    rest: 120,
    sw: 12,
    cues: [
      "Brace your core before pressing",
      "Keep ribs down and glutes tight",
      "Press in a smooth vertical path",
      "Lower until elbows are just below shoulder height",
      "Keep wrists stacked over elbows",
    ],
    mistakes: [
      "Overarching the lower back",
      "Cutting depth short",
      "Flaring elbows too much",
      "Bouncing the bottom rep",
      "Pressing too far forward",
    ],
  },

  {
    id: "ore",
    name: "Overhead Rope Extension",
    muscle: "Triceps Long Head",
    sec: "Triceps",
    sets: 3,
    range: [8, 12],
    rir: 1,
    tempo: "2-0-2",
    rest: 75,
    sw: 10,
    cues: [
      "Keep elbows pointed forward and still",
      "Reach a deep stretch behind the head",
      "Open the rope as you extend",
      "Lock out by squeezing the triceps",
      "Let the biceps stay out of the movement",
    ],
    mistakes: [
      "Letting elbows drift wide",
      "Using the shoulders to move the weight",
      "Shortening the stretch",
      "Swinging the torso",
      "Rushing the lowering phase",
    ],
  },
  {
    id: "rpd",
    name: "Straight Bar Pushdown",
    muscle: "Triceps",
    sec: "Lateral Head",
    sets: 3,
    range: [10, 15],
    rir: 1,
    tempo: "2-0-2",
    rest: 75,
    sw: 15,
    cues: [
      "Keep elbows pinned to your sides",
      "Use a shoulder-width grip",
      "Push the bar straight down",
      "Fully lock out the elbows",
      "Control the bar on the way up",
    ],
    mistakes: [
      "Using body momentum",
      "Letting elbows drift forward",
      "Stopping before full extension",
      "Using wrists instead of triceps",
      "Leaning over the bar",
    ],
  },
  // {
  //   id: "tcc",
  //   name: "Tricep Cable Crossover",
  //   muscle: "Triceps",
  //   sec: "Lateral Head",
  //   sets: 2,
  //   range: [12, 15],
  //   rir: 1,
  //   tempo: "2-0-2",
  //   rest: 60,
  //   sw: 8,
  //   cues: [
  //     "Keep upper arms slightly forward",
  //     "Move only through the elbow",
  //     "Cross hands slightly at the finish",
  //     "Squeeze hard at lockout",
  //     "Return slowly with control",
  //   ],
  //   mistakes: [
  //     "Turning it into a chest movement",
  //     "Letting shoulders take over",
  //     "Using a fast sloppy negative",
  //     "Moving elbows around too much",
  //     "Cutting the squeeze short",
  //   ],
  // },
];

const PULL = [
  {
    id: "apu",
    name: "Assisted Pull Ups",
    muscle: "Lats",
    sec: "Biceps",
    sets: 3,
    range: [6, 10],
    rir: 2,
    tempo: "2-1-2",
    rest: 120,
    sw: 35,
    cues: [
      "Drive elbows down",
      "Chest up",
      "Full stretch",
      "Control descent",
      "Don't swing",
    ],
    mistakes: [
      "Half reps",
      "Using momentum",
      "Shrugging",
      "Not locking out",
      "Kipping",
    ],
  },
  {
    id: "lpd",
    name: "Lat Pulldown",
    muscle: "Lats",
    sec: "Biceps, Rear Delts",
    sets: 3,
    range: [6, 10],
    rir: 2,
    tempo: "2-1-2",
    rest: 120,
    sw: 30,
    cues: [
      "Chest up and ribs controlled",
      "Pull elbows down to your sides",
      "Bring the bar to upper chest",
      "Stretch fully at the top",
      "Pause briefly at the bottom",
    ],
    mistakes: [
      "Leaning back too much",
      "Pulling behind the neck",
      "Using momentum",
      "Cutting the top stretch short",
      "Yanking with the hands only",
    ],
  },
  {
    id: "sal",
    name: "Single Arm Cable Lat Pulldown",
    muscle: "Lats",
    sec: "Biceps",
    sets: 3,
    range: [10, 15],
    rir: 1,
    tempo: "2-1-2",
    rest: 90,
    sw: 15,
    cues: [
      "Slight lean away for a big stretch",
      "Drive elbow toward the hip",
      "Keep torso mostly still",
      "Feel the lat shorten at the bottom",
      "Control the return all the way up",
    ],
    mistakes: [
      "Twisting the torso",
      "Curling with the biceps only",
      "Shrugging the shoulder",
      "Not reaching full stretch",
      "Using body swing",
    ],
  },

  {
    id: "csr",
    name: "Chest Supported Row",
    muscle: "Mid Back",
    sec: "Lats, Rear Delts, Biceps",
    sets: 3,
    range: [8, 12],
    rir: 2,
    tempo: "2-1-2",
    rest: 120,
    sw: 20,
    cues: [
      "Keep chest glued to the pad",
      "Pull elbows back and slightly out",
      "Squeeze shoulder blades together",
      "Reach forward for a full stretch",
      "Control the negative without jerking",
    ],
    mistakes: [
      "Lifting the chest off the pad",
      "Shortening the stretch",
      "Shrugging into the traps",
      "Using arms instead of back",
      "Rushing every rep",
    ],
  },
  {
    id: "plr",
    name: "Plate Loaded Row Machine",
    muscle: "Mid Back",
    sec: "Lats, Biceps",
    sets: 3,
    range: [8, 12],
    rir: 2,
    tempo: "2-1-2",
    rest: 120,
    sw: 40,
    cues: [
      "Keep torso stable against the pad",
      "Pull toward lower ribs or stomach",
      "Lead with the elbows",
      "Let the shoulders stretch forward fully",
      "Squeeze the mid back at the finish",
    ],
    mistakes: [
      "Using lower back to heave the weight",
      "Partial reps",
      "Pulling only with the hands",
      "Rushing the negative",
      "Turning it into a biceps curl",
    ],
  },

  {
    id: "rdf",
    name: "Rear Delt Fly",
    muscle: "Rear Delts",
    sec: "Rotator Cuff",
    sets: 3,
    range: [12, 20],
    rir: 1,
    tempo: "2-0-2",
    rest: 60,
    sw: 8,
    cues: [
      "Keep a soft bend in the elbows",
      "Pull wide, not down",
      "Lead the motion with the rear delts",
      "Pause at peak contraction",
      "Return slowly with tension",
    ],
    mistakes: [
      "Turning it into a row",
      "Shrugging traps at the top",
      "Swinging the body",
      "Using too much weight",
      "Cutting the rear delt squeeze short",
    ],
  },

  {
    id: "prc",
    name: "Preacher Curl",
    muscle: "Biceps Short Head",
    sec: "Biceps Long Head",
    sets: 3,
    range: [8, 12],
    rir: 2,
    tempo: "3-0-2",
    rest: 90,
    sw: 10,
    cues: [
      "Keep upper arms fixed on the pad",
      "Start from a full stretch",
      "Curl smoothly without bouncing",
      "Squeeze hard at the top",
      "Lower slowly and fully",
    ],
    mistakes: [
      "Lifting the elbows off the pad",
      "Bouncing the bottom rep",
      "Using body momentum",
      "Not fully extending the elbows",
      "Rushing the negative",
    ],
  },
  {
    id: "bay",
    name: "Incline Dumbbell Curl",
    muscle: "Biceps",
    sec: "Biceps",
    sets: 3,
    range: [10, 15],
    rir: 1,
    tempo: "3-0-2",
    rest: 75,
    sw: 8,
    cues: [
      "Keep shoulders against the bench",
      "Let arms hang fully at the bottom",
      "Keep elbows fixed throughout",
      "Curl until biceps fully contract",
      "Lower slowly for a deep stretch",
    ],
    mistakes: [
      "Moving the elbows forward",
      "Swinging the dumbbells",
      "Lifting shoulders off the bench",
      "Using too much weight",
      "Not reaching full stretch",
    ],
  },
  {
    id: "hmc",
    name: "Cable Hammer Curl",
    muscle: "Brachialis",
    sec: "Biceps, Forearms",
    sets: 3,
    range: [8, 12],
    rir: 1,
    tempo: "2-0-2",
    rest: 75,
    sw: 10,
    cues: [
      "Use the rope attachment",
      "Keep palms facing each other",
      "Keep elbows close to your sides",
      "Pull the rope toward your shoulders",
      "Lower under control",
    ],
    mistakes: [
      "Using body swing",
      "Moving the elbows forward",
      "Turning it into a regular curl",
      "Using excessive weight",
      "Rushing the eccentric",
    ],
  },

  {
    id: "pcs",
    name: "Preacher Curl Shrug",
    muscle: "Upper Traps",
    sec: "Levator Scapulae",
    sets: 3,
    range: [10, 15],
    rir: 1,
    tempo: "2-1-2",
    rest: 75,
    sw: 25,
    cues: [
      "Keep arms straight throughout",
      "Drive shoulders straight upward toward your ears",
      "Pause and squeeze the traps at the top",
      "Lower under full control into a deep stretch",
      "Avoid rolling the shoulders",
    ],
    mistakes: [
      "Bending the elbows into a curl",
      "Rolling the shoulders in circles",
      "Using body momentum",
      "Cutting the top squeeze short",
      "Using excessive weight with partial reps",
    ],
  },
];

const LEGS = [
  {
    id: "hqs",
    name: "Hack Squat",
    muscle: "Hamstring",
    sec: "Glutes",
    sets: 3,
    range: [6, 10],
    rir: 2,
    tempo: "3-1-1",
    rest: 150,
    sw: 40,
    cues: [
      "Place feet high on the platform",
      "Keep hips firmly against the pad",
      "Descend until you feel a hamstring stretch",
      "Drive through your heels",
      "Keep knees tracking over toes",
    ],
    mistakes: [
      "Feet placed too low",
      "Pushing through the toes",
      "Allowing knees to cave inward",
      "Bouncing at the bottom",
      "Lifting hips off the pad",
    ],
  },
  {
    id: "lgp",
    name: "Leg Press",
    muscle: "Quads",
    sec: "Glutes, Hamstrings",
    sets: 3,
    range: [10, 15],
    rir: 1,
    tempo: "2-1-1",
    rest: 120,
    sw: 80,
    cues: [
      "Keep hips and lower back glued down",
      "Lower until quads get a deep stretch",
      "Push evenly through both feet",
      "Control the descent fully",
      "Stop just short of locking the knees hard",
    ],
    mistakes: [
      "Letting hips rise off the pad",
      "Half reps",
      "Bouncing the sled",
      "Locking knees aggressively",
      "Letting feet shift around",
    ],
  },
  {
    id: "lge",
    name: "Leg Extension",
    muscle: "Quads",
    sec: "",
    sets: 3,
    range: [12, 15],
    rir: 1,
    tempo: "2-1-3",
    rest: 75,
    sw: 20,
    cues: [
      "Set the pad above the ankle",
      "Lift through the quads, not momentum",
      "Squeeze hard at the top",
      "Lower slowly into a deep bend",
      "Keep your hips pressed into the seat",
    ],
    mistakes: [
      "Swinging the weight up",
      "Lifting the hips off the seat",
      "Using a short range of motion",
      "Dropping the weight fast",
      "Kicking too explosively",
    ],
  },

  {
    id: "lgc",
    name: "Leg Curl",
    muscle: "Hamstrings",
    sec: "Calves",
    sets: 3,
    range: [10, 15],
    rir: 1,
    tempo: "2-1-3",
    rest: 90,
    sw: 20,
    cues: [
      "Keep hips pinned down",
      "Curl through the hamstrings only",
      "Pause at full contraction",
      "Lower slowly into the stretch",
      "Keep the pad positioned securely",
    ],
    mistakes: [
      "Lifting the hips",
      "Rushing the negative",
      "Using momentum",
      "Cutting the squeeze short",
      "Not reaching full stretch",
    ],
  },
  {
    id: "rdl",
    name: "Romanian Deadlift",
    muscle: "Hamstrings",
    sec: "Lower Back, Glutes",
    sets: 3,
    range: [8, 12],
    rir: 2,
    tempo: "3-1-2",
    rest: 120,
    sw: 40,
    cues: [
      "Push hips back",
      "Maintain neutral spine",
      "Keep bar close",
      "Stretch hamstrings",
      "Drive hips forward",
    ],
    mistakes: [
      "Rounding back",
      "Squatting instead of hinging",
      "Bar drifting away",
      "Locking knees",
      "Using momentum",
    ],
  },

  {
    id: "cfr",
    name: "Standing Calf Raise",
    muscle: "Gastrocnemius",
    sec: "Soleus",
    sets: 4,
    range: [10, 15],
    rir: 1,
    tempo: "2-1-3",
    rest: 60,
    sw: 40,
    cues: [
      "Get a deep stretch at the bottom",
      "Rise high onto the toes",
      "Pause briefly at the top",
      "Keep knees stable",
      "Use a full controlled range",
    ],
    mistakes: [
      "Bouncing reps",
      "Shortening the stretch",
      "Moving too fast",
      "Letting feet roll outward",
      "Using partial range",
    ],
  },
  {
    id: "ccr",
    name: "Cable Crunch",
    muscle: "Abs",
    sec: "Core",
    sets: 3,
    range: [12, 15],
    rir: 1,
    tempo: "2-1-2",
    rest: 45,
    sw: 20,
    cues: [
      "Crunch through abs",
      "Keep hips fixed",
      "Slow eccentric",
      "Exhale at bottom",
      "Don't pull with arms",
    ],
    mistakes: [
      "Using hips",
      "Pulling rope with arms",
      "Half reps",
      "Too much weight",
      "Fast reps",
    ],
  },
  {
    id: "hkr",
    name: "Hanging Knee Raise",
    muscle: "Lower Abs",
    sec: "Hip Flexors",
    sets: 3,
    range: [10, 15],
    rir: 1,
    tempo: "2-1-2",
    rest: 45,
    sw: 0,
    cues: [
      "Posterior pelvic tilt",
      "Raise knees high",
      "No swinging",
      "Slow lower",
      "Brace core",
    ],
    mistakes: [
      "Swinging",
      "Using momentum",
      "Not curling pelvis",
      "Half reps",
      "Dropping legs",
    ],
  },

  {
    id: "wrc",
    name: "Wrist Curl",
    muscle: "Forearm Flexors",
    sec: "",
    sets: 2,
    range: [12, 20],
    rir: 1,
    tempo: "2-0-2",
    rest: 45,
    sw: 7.5,
    cues: [
      "Support the forearms firmly",
      "Let the wrists extend fully",
      "Curl the weight through the fingers",
      "Squeeze the forearms at the top",
      "Lower slowly and fully",
    ],
    mistakes: [
      "Moving the elbows",
      "Using momentum",
      "Cutting the stretch short",
      "Rushing the reps",
      "Letting the grip do all the work",
    ],
  },
  {
    id: "rwc",
    name: "Reverse Wrist Curl",
    muscle: "Forearm Extensors",
    sec: "",
    sets: 2,
    range: [12, 20],
    rir: 1,
    tempo: "2-0-2",
    rest: 45,
    sw: 5,
    cues: [
      "Keep forearms supported",
      "Lift by extending the wrists",
      "Move with control",
      "Pause briefly at the top",
      "Lower slowly to full stretch",
    ],
    mistakes: [
      "Using the shoulders",
      "Swinging the weight",
      "Bending the wrists inconsistently",
      "Cutting range short",
      "Dropping the weight too fast",
    ],
  },
  {
    id: "reb",
    name: "Reverse EZ Bar Curl",
    muscle: "Brachioradialis",
    sec: "Forearms",
    sets: 2,
    range: [10, 15],
    rir: 1,
    tempo: "2-0-2",
    rest: 60,
    sw: 10,
    cues: [
      "Use an overhand grip",
      "Keep wrists straight",
      "Lock elbows by your sides",
      "Curl smoothly through the forearms",
      "Lower slowly without losing tension",
    ],
    mistakes: [
      "Bending the wrists back",
      "Using body swing",
      "Letting elbows move forward",
      "Going too heavy too soon",
      "Cutting the range short",
    ],
  },
];

const BY_DAY = { Push: PUSH, Pull: PULL, Legs: LEGS, Rest: [] };
const ALL_EX = [...PUSH, ...PULL, ...LEGS];

// ── NUTRITION DATA ───────────────────────────────────────────────────────────
const MEALS = [
  {
    id: "bfst",
    name: "Breakfast",
    time: "7:30 AM",
    emoji: "🍳",
    items: ["3 whole eggs", "3 rotis", "1 fruit"],
    p: 24,
    c: 55,
    f: 15,
    kcal: 455,
  },
  {
    id: "lnch",
    name: "Lunch",
    time: "1:00 PM",
    emoji: "🍛",
    items: ["30g dry soya chunks", "250g cooked rice", "1 bowl dal", "Salad"],
    p: 32,
    c: 85,
    f: 8,
    kcal: 540,
  },
  {
    id: "pwkt",
    name: "Pre-Workout",
    time: "5:00 PM",
    emoji: "⚡",
    items: ["100g paneer", "40g oats", "1 banana"],
    p: 20,
    c: 60,
    f: 14,
    kcal: 450,
  },
  {
    id: "dinr",
    name: "Dinner",
    time: "9:00 PM",
    emoji: "🍽️",
    items: ["3 eggs bhurji", "3 rotis", "Vegetables"],
    p: 22,
    c: 52,
    f: 16,
    kcal: 440,
  },
  {
    id: "bed",
    name: "Before Bed",
    time: "10:30 PM",
    emoji: "🥛",
    items: ["1 scoop ON Whey", "250ml milk", "5g creatine"],
    p: 35,
    c: 15,
    f: 5,
    kcal: 245,
  },
];

const SUPPS = [
  "Fish Oil (2g)",
  "Calcium (500mg)",
  "Vitamin D3 (2000 IU)",
  "Magnesium (400mg)",
  "Zinc (15mg)",
  "Vitamin K2 (100mcg)",
];
const TOTAL = {
  p: MEALS.reduce((s, m) => s + m.p, 0),
  c: MEALS.reduce((s, m) => s + m.c, 0),
  f: MEALS.reduce((s, m) => s + m.f, 0),
  kcal: MEALS.reduce((s, m) => s + m.kcal, 0),
};

// ── MONTHLY GOALS ────────────────────────────────────────────────────────────
const GOALS = [
  {
    month: "Month 1",
    weight: [61.0, 61.5],
    smm: [27.5, 28.0],
    pbf: [19.8, 20.3],
    score: [74, 76],
  },
  {
    month: "Month 2",
    weight: [61.8, 62.5],
    smm: [28.3, 28.8],
    pbf: [18.5, 19.5],
    score: [77, 79],
  },
  {
    month: "Month 3",
    weight: [63.0, 64.0],
    smm: [29.0, 30.0],
    pbf: [17.0, 18.5],
    score: [80, 83],
  },
];

// ── PROFILE ──────────────────────────────────────────────────────────────────
const BASELINE_INBODY = {
  weight: 60.4,
  smm: 26.9,
  pbf: 20.7,
  bfm: 12.5,
  visceral: 5,
  score: 72,
  whr: 0.82,
};

const PROFILE = {
  age: 21,
  height: 168,
  weight: BASELINE_INBODY.weight,
  smm: BASELINE_INBODY.smm,
  pbf: BASELINE_INBODY.pbf,
  forearms: 29,
  score: BASELINE_INBODY.score,
};

// ── HOOKS & STORAGE MIGRATION ───────────────────────────────────────────────
const STORAGE_VERSION = 2;

const STORAGE_KEYS = {
  logs: "senpai_workout_logs",
  workoutCompletions: "senpai_workout_completions",
  dietLogs: "senpai_diet_logs",
  walkLogs: "senpai_walk_logs",
  measurements: "senpai_measurements",
  inbody: "senpai_inbody",
  meta: "senpai_meta",
};

// If you rename exercise IDs, map oldId -> newId here to preserve history
const EXERCISE_ID_MAP = {
  // "oldId": "newId",
};

function safeParseJSON(raw, fallback) {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function remapWorkoutLogs(logs) {
  if (!logs || typeof logs !== "object" || Array.isArray(logs)) return {};
  const next = {};
  for (const [oldId, sessions] of Object.entries(logs)) {
    const newId = EXERCISE_ID_MAP[oldId] || oldId;
    next[newId] = Array.isArray(sessions) ? sessions : [];
  }
  return next;
}

function readState(
  key,
  fallback,
  { legacyKeys = [], migrate = (v) => v } = {},
) {
  if (typeof window === "undefined") return fallback;
  const current = safeParseJSON(localStorage.getItem(key), null);
  if (current !== null) return migrate(current);
  for (const legacyKey of legacyKeys) {
    const legacy = safeParseJSON(localStorage.getItem(legacyKey), null);
    if (legacy !== null) {
      const migrated = migrate(legacy);
      try {
        localStorage.setItem(key, JSON.stringify(migrated));
      } catch {}
      return migrated;
    }
  }
  return fallback;
}

function useLS(key, init) {
  // keep same API but add migration for known keys
  const migrate = key === STORAGE_KEYS.logs ? remapWorkoutLogs : (v) => v;
  const [v, setV] = useState(() => readState(key, init, { migrate }));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  }, [key, v]);
  return [v, setV];
}

// ── PROGRESSIVE OVERLOAD LOGIC ───────────────────────────────────────────────
function nextTarget(ex, logs) {
  if (!logs?.length)
    return {
      weight: ex.sw,
      reps: ex.range[0],
      note: "First session — start here!",
    };
  const last = logs[logs.length - 1];
  const workingSets = Array.isArray(last.sets) ? last.sets : [];
  const best = workingSets.reduce(
    (b, s) => (s.reps > b.reps ? s : b),
    workingSets[0],
  ) || { weight: ex.sw, reps: ex.range[0] };
  const step =
    best.weight < 10
      ? 1.25
      : best.weight < 20
        ? 2.5
        : best.weight < 60
          ? 2.5
          : 5;
  const allHitTop =
    workingSets.length > 0 &&
    workingSets.every((set) => Number(set.reps) >= ex.range[1]);
  if (allHitTop) {
    return {
      weight: best.weight + step,
      reps: ex.range[0],
      note: `↑ Weight! Hit ${ex.range[1]} reps last session.`,
    };
  }
  const minReps = workingSets.length
    ? Math.min(...workingSets.map((set) => Number(set.reps) || ex.range[0]))
    : ex.range[0];
  return {
    weight: best.weight,
    reps: Math.min(ex.range[1], minReps + 1),
    note: `Add reps until every set reaches ${ex.range[1]}.`,
  };
}

// ── SHARED STYLES ─────────────────────────────────────────────────────────────
const glass = {
  background: C.card,
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: `1px solid ${C.border}`,
  borderRadius: 16,
};
const glassHover = { ...glass, border: `1px solid ${C.borderHover}` };

// ── RING PROGRESS ─────────────────────────────────────────────────────────────
function Ring({ pct, size = 80, stroke = 7, color = C.P, label, sub }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{
            transition: "stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </svg>
      {label && (
        <div
          style={{
            marginTop: -size / 2 - 2,
            marginBottom: size / 2 - 8,
            textAlign: "center",
            lineHeight: 1.2,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: C.text,
              fontFamily: "var(--font)",
            }}
          >
            {label}
          </div>
          {sub && <div style={{ fontSize: 11, color: C.muted }}>{sub}</div>}
        </div>
      )}
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, unit, sub, color = C.P, icon, trend }) {
  const tColor = trend > 0 ? C.S : trend < 0 ? C.D : C.muted;
  return (
    <div
      style={{
        ...glass,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 60,
          height: 60,
          borderRadius: "0 16px 0 60px",
          background: `linear-gradient(135deg, ${color}18, transparent)`,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: C.muted,
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        {icon && <span style={{ color }}>{icon}</span>}
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: C.text,
            letterSpacing: "-0.5px",
          }}
        >
          {value}
        </span>
        {unit && <span style={{ fontSize: 13, color: C.muted }}>{unit}</span>}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 12,
            color: tColor,
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          {trend > 0 && <ArrowUp size={11} />}
          {trend < 0 && <ArrowDown size={11} />}
          {sub}
        </div>
      )}
    </div>
  );
}

// ── PROGRESS BAR ──────────────────────────────────────────────────────────────
function Bar2({ pct, color = C.P, height = 6, label, right }) {
  return (
    <div>
      {(label || right) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
          <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>
            {right}
          </span>
        </div>
      )}
      <div
        style={{
          height,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 100,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(pct, 100)}%`,
            background: color,
            borderRadius: 100,
            transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}

// ── BADGE ────────────────────────────────────────────────────────────────────
function Badge({ text, color = C.P }) {
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 20,
        background: `${color}18`,
        color,
        fontSize: 11,
        fontWeight: 600,
        border: `1px solid ${color}30`,
      }}
    >
      {text}
    </span>
  );
}

// ── BUTTON ────────────────────────────────────────────────────────────────────
function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
}) {
  const bg =
    variant === "primary"
      ? `linear-gradient(135deg, ${C.P}, ${C.A})`
      : variant === "ghost"
        ? "transparent"
        : "rgba(255,255,255,0.06)";
  const color = variant === "primary" ? "#000" : C.text;
  const border = variant === "ghost" ? `1px solid ${C.border}` : "none";
  const pad =
    size === "sm" ? "6px 14px" : size === "lg" ? "14px 28px" : "10px 20px";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: bg,
        color,
        border,
        borderRadius: 10,
        padding: pad,
        fontSize: size === "sm" ? 12 : 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.2s",
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {children}
    </button>
  );
}

// ── SECTION HEADER ────────────────────────────────────────────────────────────
function SH({ title, sub, action }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 16,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: C.text,
            letterSpacing: "-0.3px",
          }}
        >
          {title}
        </div>
        {sub && (
          <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}

// ── DASHBOARD PAGE ────────────────────────────────────────────────────────────
function Dashboard({
  logs,
  dietLogs,
  walkLogs,
  inbody,
  measurements,
  workoutCompletions,
  streakDays,
  onNavigate,
}) {
  const dayType = getDayType();
  const exercises = BY_DAY[dayType] || [];
  const todayKey = today();
  const diet = dietLogs[todayKey] || { done: [], water: 0 };
  const walk = walkLogs[todayKey] || {};
  const prot = MEALS.filter((m) => diet.done?.includes(m.id)).reduce(
    (s, m) => s + m.p,
    0,
  );
  const lastMeasure = measurements.length
    ? measurements[measurements.length - 1]
    : PROFILE;
  const nextBcaInfo = getNextBcaInfo(inbody);
  const workoutDone = workoutDoneForDate(logs, workoutCompletions, todayKey);
  const protPct = Math.round((prot / TOTAL.p) * 100);
  const waterPct = Math.round(((diet.water || 0) / 3000) * 100);
  const walkTotal = ["morning", "afternoon", "evening"].reduce(
    (sum, key) => sum + walkMinutes(walk[key]),
    0,
  );
  const walkTarget = getWalkTarget(dayType);
  const todayTargets = dayType === "Rest" ? [] : exercises.slice(0, 3);

  function goWorkout() {
    onNavigate?.("workout");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Today's Targets */}
      <div
        style={{
          ...glass,
          padding: 20,
          borderColor: `${C.P}35`,
          background:
            "linear-gradient(135deg, rgba(0,229,255,0.12), rgba(56,189,248,0.04))",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                color: C.P,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              TODAY'S TARGETS
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: C.text,
                marginTop: 2,
              }}
            >
              {dayType === "Rest"
                ? "Recovery targets"
                : `${dayType} Day priorities`}
            </div>
          </div>
          {dayType !== "Rest" && (
            <Btn onClick={goWorkout} size="sm">
              <ChevronRight size={14} /> Workout
            </Btn>
          )}
        </div>
        {dayType === "Rest" ? (
          <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>
            60 min walk, hydration, and recovery. Use today to reset before the
            next push session.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {todayTargets.map((ex) => {
              const target = nextTarget(ex, logs[ex.id] || []);
              return (
                <div
                  key={ex.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div>
                    <div
                      style={{ fontSize: 14, fontWeight: 700, color: C.text }}
                    >
                      {ex.name}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted }}>
                      {ex.muscle}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.P }}>
                      {target.weight}kg
                    </div>
                    <div style={{ fontSize: 11, color: C.muted }}>
                      x{target.reps} reps
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hero */}
      <div
        style={{
          ...glass,
          padding: 24,
          background:
            "linear-gradient(135deg, rgba(0,229,255,0.08), rgba(56,189,248,0.04))",
          borderColor: `${C.P}22`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                color: C.P,
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 4,
                letterSpacing: 1,
              }}
            >
              TODAY —{" "}
              {new Date()
                .toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
                .toUpperCase()}
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: C.text,
                letterSpacing: "-1px",
                lineHeight: 1.1,
              }}
            >
              {dayType === "Rest" ? "🧘 Rest Day" : `💪 ${dayType} Day`}
            </div>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Badge text={`${exercises.length} exercises`} color={C.P} />
              <Badge
                text={dayType === "Rest" ? "Recovery" : "6 PM – 8 PM"}
                color={C.A}
              />
              {workoutDone && <Badge text="✓ Completed" color={C.S} />}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: C.P }}>
              {streakDays}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>day streak 🔥</div>
          </div>
        </div>
        {dayType !== "Rest" && (
          <div style={{ marginTop: 16 }}>
            <Bar2
              pct={workoutDone ? 100 : 0}
              color={C.S}
              height={5}
              label="Workout completion"
              right={workoutDone ? "100%" : "0%"}
            />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
          gap: 12,
        }}
      >
        <StatCard
          label="Body Weight"
          value={lastMeasure.weight || PROFILE.weight}
          unit="kg"
          icon={<Activity size={14} />}
          color={C.P}
          sub={`Goal: 61.0–61.5 kg`}
          trend={lastMeasure.weight > PROFILE.weight ? 1 : 0}
        />
        <StatCard
          label="Muscle Mass"
          value={lastMeasure.smm || PROFILE.smm}
          unit="kg"
          icon={<Dumbbell size={14} />}
          color={C.A}
          sub="Goal: 27.5–28.0 kg"
          trend={1}
        />
        <StatCard
          label="Body Fat"
          value={lastMeasure.pbf || PROFILE.pbf}
          unit="%"
          icon={<BarChart2 size={14} />}
          color={C.W}
          sub="Goal: 19.8–20.3%"
          trend={-1}
        />
        <StatCard
          label="Next BCA"
          value={nextBcaInfo.daysRemaining}
          unit="days"
          icon={<Calendar size={14} />}
          color={C.D}
          sub={`Next scan ${fmt(nextBcaInfo.nextDate)}`}
        />
      </div>

      {/* Daily Progress */}
      <div style={{ ...glass, padding: 20 }}>
        <SH title="Daily Targets" sub="Nutrition, hydration & movement" />
        <div
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "space-around",
            flexWrap: "wrap",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Ring
              pct={protPct}
              size={90}
              color={C.P}
              label={`${prot}g`}
              sub="protein"
            />
            <div style={{ marginTop: 8, fontSize: 12, color: C.muted }}>
              Target: {TOTAL.p}g
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <Ring
              pct={waterPct}
              size={90}
              color={C.A}
              label={`${((diet.water || 0) / 1000).toFixed(1)}L`}
              sub="water"
            />
            <div style={{ marginTop: 8, fontSize: 12, color: C.muted }}>
              Target: 3L
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <Ring
              pct={Math.round((walkTotal / walkTarget.max) * 100)}
              size={90}
              color={C.S}
              label={`${walkTotal}m`}
              sub="minutes"
            />
            <div style={{ marginTop: 8, fontSize: 12, color: C.muted }}>
              Target: {walkTarget.label}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Exercises Preview */}
      {dayType !== "Rest" && (
        <div style={{ ...glass, padding: 20 }}>
          <SH
            title="Today's Exercises"
            sub={`${dayType} Day — ${exercises.length} movements`}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {exercises.slice(0, 5).map((ex) => {
              const exLogs = logs[ex.id] || [];
              const nt = nextTarget(ex, exLogs);
              return (
                <div
                  key={ex.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 10,
                    border: `1px solid ${C.dim}`,
                  }}
                >
                  <div>
                    <div
                      style={{ fontSize: 14, fontWeight: 600, color: C.text }}
                    >
                      {ex.name}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted }}>
                      {ex.muscle} · {ex.sets}×{ex.range.join("-")} reps
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.P }}>
                      {nt.weight}kg
                    </div>
                    <div style={{ fontSize: 11, color: C.muted }}>
                      ×{nt.reps} reps
                    </div>
                  </div>
                </div>
              );
            })}
            {exercises.length > 5 && (
              <div
                style={{ fontSize: 12, color: C.muted, textAlign: "center" }}
              >
                +{exercises.length - 5} more exercises
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase Card */}
      <div
        style={{
          ...glass,
          padding: 20,
          background:
            "linear-gradient(135deg,rgba(34,197,94,0.06),transparent)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: C.S,
            fontWeight: 600,
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          CURRENT PHASE — MONTH 1
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: C.text,
            marginBottom: 12,
          }}
        >
          Body Recomposition Protocol
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {[
            ["Weight Target", "61.0–61.5 kg"],
            ["SMM Target", "27.5–28.0 kg"],
            ["PBF Target", "19.8–20.3%"],
            ["Score Target", "74–76"],
          ].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 11, color: C.muted }}>{l}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.S }}>
                {v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── EXERCISE CARD ─────────────────────────────────────────────────────────────
function ExCard({ ex, logs, onLog }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("targets");
  const history = logs[ex.id] || [];
  const last = history.length ? history[history.length - 1] : null;
  const nt = nextTarget(ex, history);

  return (
    <div style={{ ...glass, overflow: "hidden", transition: "all 0.3s" }}>
      {/* Header */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "16px 18px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: C.P,
                boxShadow: `0 0 8px ${C.P}`,
              }}
            />
            <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
              {ex.name}
            </span>
          </div>
          <div
            style={{ marginTop: 4, display: "flex", gap: 8, flexWrap: "wrap" }}
          >
            <Badge text={ex.muscle} color={C.P} />
            {ex.sec && <Badge text={ex.sec.split(",")[0]} color={C.dim} />}
          </div>
        </div>
        <div style={{ textAlign: "right", marginLeft: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.P }}>
            {nt.weight}kg
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>
            {ex.sets}×{nt.reps}
          </div>
        </div>
        <div style={{ marginLeft: 12, color: C.muted }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Expanded */}
      {open && (
        <div style={{ borderTop: `1px solid ${C.border}` }}>
          {/* Tabs */}
          <div
            style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}
          >
            {["targets", "technique", "history"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "10px 4px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  color: tab === t ? C.P : C.muted,
                  borderBottom:
                    tab === t ? `2px solid ${C.P}` : "2px solid transparent",
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ padding: "16px 18px" }}>
            {tab === "targets" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                  }}
                >
                  {[
                    [
                      "Last Time",
                      last
                        ? `${last.sets[0]?.weight}kg ×${last.sets[0]?.reps}`
                        : "—",
                      C.muted,
                    ],
                    ["Today's Goal", `${nt.weight}kg ×${nt.reps}`, C.P],
                    [
                      "Next Goal",
                      history.length
                        ? nextTarget(ex, [
                            ...history,
                            { sets: [{ weight: nt.weight, reps: nt.reps }] },
                          ]).weight + "kg"
                        : `${ex.sw}kg`,
                      C.A,
                    ],
                  ].map(([l, v, c]) => (
                    <div
                      key={l}
                      style={{
                        padding: 12,
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: 10,
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: C.muted,
                          marginBottom: 4,
                        }}
                      >
                        {l}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: c }}>
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    padding: 12,
                    background: `${C.P}08`,
                    borderRadius: 10,
                    border: `1px solid ${C.P}20`,
                  }}
                >
                  <div style={{ fontSize: 12, color: C.P, fontWeight: 600 }}>
                    📋 Prescription
                  </div>
                  <div style={{ fontSize: 14, color: C.text, marginTop: 4 }}>
                    {ex.sets} sets · {ex.range.join("–")} reps · RIR {ex.rir} ·
                    Tempo {ex.tempo} · {ex.rest}s rest
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                    {nt.note}
                  </div>
                </div>
                <Btn onClick={() => onLog(ex)}>
                  <Plus size={14} /> Log This Session
                </Btn>
              </div>
            )}

            {tab === "technique" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.S,
                      marginBottom: 8,
                    }}
                  >
                    ✓ Execution Cues
                  </div>
                  {ex.cues.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: `${C.S}20`,
                          border: `1px solid ${C.S}40`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{ fontSize: 10, color: C.S, fontWeight: 700 }}
                        >
                          {i + 1}
                        </span>
                      </div>
                      <span
                        style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}
                      >
                        {c}
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.D,
                      marginBottom: 8,
                    }}
                  >
                    ⚠ Common Mistakes
                  </div>
                  {ex.mistakes.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: C.D,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: 13, color: C.text }}>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "history" && (
              <div>
                {history.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: C.muted,
                      padding: "20px 0",
                      fontSize: 14,
                    }}
                  >
                    No history yet. Log your first session!
                  </div>
                ) : (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {history
                      .slice()
                      .reverse()
                      .slice(0, 5)
                      .map((h, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "10px 12px",
                            background: "rgba(255,255,255,0.03)",
                            borderRadius: 10,
                          }}
                        >
                          <div style={{ fontSize: 12, color: C.muted }}>
                            {fmt(h.date)}
                          </div>
                          <div style={{ display: "flex", gap: 12 }}>
                            {h.sets.map((s, j) => (
                              <span
                                key={j}
                                style={{ fontSize: 12, color: C.text }}
                              >
                                {s.weight}kg×{s.reps}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    {history.length > 0 && (
                      <div style={{ height: 120, marginTop: 8 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={history.slice(-8).map((h, i) => ({
                              w: i + 1,
                              kg: h.sets[0]?.weight || 0,
                              reps: h.sets[0]?.reps || 0,
                            }))}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="rgba(255,255,255,0.05)"
                            />
                            <XAxis
                              dataKey="w"
                              tick={{ fill: C.muted, fontSize: 10 }}
                              axisLine={false}
                            />
                            <YAxis
                              tick={{ fill: C.muted, fontSize: 10 }}
                              axisLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                background: C.bg2,
                                border: `1px solid ${C.border}`,
                                borderRadius: 8,
                                color: C.text,
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="kg"
                              stroke={C.P}
                              strokeWidth={2}
                              dot={{ fill: C.P, r: 3 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── LOG SESSION MODAL ─────────────────────────────────────────────────────────
function LogModal({ ex, onClose, onSave }) {
  const [sets, setSets] = useState(
    Array.from({ length: ex.sets }, (_, i) => ({
      weight: ex.sw,
      reps: ex.range[0],
      rir: ex.rir,
    })),
  );
  function update(i, k, v) {
    setSets((s) => s.map((r, j) => (j === i ? { ...r, [k]: Number(v) } : r)));
  }
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          ...glass,
          width: "100%",
          maxWidth: 560,
          borderRadius: "20px 20px 0 0",
          padding: 24,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>
              {ex.name}
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>
              {ex.muscle} · Tempo {ex.tempo}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.muted,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr 1fr 1fr",
            gap: 8,
            marginBottom: 8,
          }}
        >
          {["Set", "Weight (kg)", "Reps", "RIR"].map((h) => (
            <div
              key={h}
              style={{
                fontSize: 11,
                color: C.muted,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {sets.map((s, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr 1fr 1fr",
              gap: 8,
              marginBottom: 8,
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: `${C.P}15`,
                border: `1px solid ${C.P}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: C.P,
              }}
            >
              {i + 1}
            </div>
            {["weight", "reps", "rir"].map((k) => (
              <input
                key={k}
                type="number"
                value={s[k]}
                step={k === "weight" ? 0.5 : 1}
                min={0}
                onChange={(e) => update(i, k, e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                  padding: "8px",
                  fontSize: 14,
                  textAlign: "center",
                  width: "100%",
                  fontFamily: "inherit",
                }}
              />
            ))}
          </div>
        ))}

        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <Btn onClick={() => onSave(sets)} size="lg">
            <Check size={16} /> Save Session
          </Btn>
          <Btn onClick={onClose} variant="ghost" size="lg">
            Cancel
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── WORKOUT PAGE ──────────────────────────────────────────────────────────────
function WorkoutPage({
  logs,
  setLogs,
  workoutCompletions,
  setWorkoutCompletions,
}) {
  const [selectedDay, setSelectedDay] = useState(getDayType());
  const [logEx, setLogEx] = useState(null);
  const exercises = BY_DAY[selectedDay] || [];
  const todayKey = today();
  const todayReady =
    exercises.length > 0 &&
    exercises.every((ex) =>
      (logs[ex.id] || []).some((entry) => entry.date === todayKey),
    );
  const completed = Boolean(workoutCompletions?.[todayKey]);

  function saveLog(ex, sets) {
    setLogs((prev) => ({
      ...prev,
      [ex.id]: [...(prev[ex.id] || []), { date: today(), sets }],
    }));
    setLogEx(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <SH title="Workout Library" sub="Push · Pull · Legs — Full program" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Push", "Pull", "Legs"].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              style={{
                padding: "8px 20px",
                borderRadius: 20,
                border: `1px solid ${selectedDay === d ? C.P : C.border}`,
                background: selectedDay === d ? `${C.P}15` : "transparent",
                color: selectedDay === d ? C.P : C.muted,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              {d} Day · {BY_DAY[d].length}
            </button>
          ))}
        </div>
      </div>

      {selectedDay === getDayType() && (
        <div
          style={{
            padding: "12px 16px",
            background: `${C.S}10`,
            borderRadius: 12,
            border: `1px solid ${C.S}30`,
            fontSize: 13,
            color: C.S,
            fontWeight: 600,
          }}
        >
          📅 This is today's workout day. Hit those targets!
        </div>
      )}

      {exercises.map((ex) => (
        <ExCard key={ex.id} ex={ex} logs={logs} onLog={setLogEx} />
      ))}

      {selectedDay === getDayType() && selectedDay !== "Rest" && (
        <div
          style={{
            ...glass,
            padding: 16,
            border: `1px solid ${C.P}25`,
            background:
              "linear-gradient(135deg, rgba(0,229,255,0.06), transparent)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>
              Workout Complete
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
              {todayReady
                ? "All exercises logged. Mark the session complete to update your streak."
                : "Log every exercise in today’s session first."}
            </div>
          </div>
          <Btn
            onClick={() =>
              setWorkoutCompletions((prev) => ({
                ...prev,
                [todayKey]: true,
              }))
            }
            disabled={!todayReady || completed}
            size="sm"
          >
            <Check size={14} /> {completed ? "Completed" : "Mark Complete"}
          </Btn>
        </div>
      )}

      {logEx && (
        <LogModal
          ex={logEx}
          onClose={() => setLogEx(null)}
          onSave={(sets) => saveLog(logEx, sets)}
        />
      )}
    </div>
  );
}

// ── DIET PAGE ─────────────────────────────────────────────────────────────────
function DietPage({ dietLogs, setDietLogs }) {
  const todayKey = today();
  const log = dietLogs[todayKey] || { done: [], water: 0 };
  function setLog(u) {
    setDietLogs((p) => ({ ...p, [todayKey]: { ...log, ...u } }));
  }
  function toggleMeal(id) {
    const done = log.done?.includes(id)
      ? log.done.filter((x) => x !== id)
      : [...(log.done || []), id];
    setLog({ done });
  }
  const eaten = MEALS.filter((m) => log.done?.includes(m.id));
  const totEaten = {
    p: eaten.reduce((s, m) => s + m.p, 0),
    c: eaten.reduce((s, m) => s + m.c, 0),
    f: eaten.reduce((s, m) => s + m.f, 0),
    kcal: eaten.reduce((s, m) => s + m.kcal, 0),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SH
        title="Diet Tracker"
        sub={`${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}`}
      />

      {/* Macro Summary */}
      <div style={{ ...glass, padding: 20 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: C.muted,
            marginBottom: 16,
          }}
        >
          Today's Macros
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {[
            ["Protein", totEaten.p, TOTAL.p, "g", C.P],
            ["Carbs", totEaten.c, TOTAL.c, "g", C.A],
            ["Fat", totEaten.f, TOTAL.f, "g", C.W],
            ["Calories", totEaten.kcal, TOTAL.kcal, "kcal", C.S],
          ].map(([l, v, t, u, c]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>
                {l}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: c }}>
                {v}
                <span style={{ fontSize: 11 }}>{u}</span>
              </div>
              <div style={{ fontSize: 11, color: C.dim }}>
                /{t}
                {u}
              </div>
              <div
                style={{
                  marginTop: 4,
                  height: 4,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min((v / t) * 100, 100)}%`,
                    background: c,
                    borderRadius: 10,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Water */}
      <div style={{ ...glass, padding: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Droplets size={18} color={C.A} />{" "}
            <span style={{ fontWeight: 700, color: C.text }}>Water Intake</span>
          </div>
          <Badge
            text={`${((log.water || 0) / 1000).toFixed(1)} / 3.0 L`}
            color={C.A}
          />
        </div>
        <Bar2 pct={((log.water || 0) / 3000) * 100} color={C.A} height={10} />
        <div
          style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}
        >
          {[250, 500, 750, 1000].map((ml) => (
            <button
              key={ml}
              onClick={() =>
                setLog({ water: Math.max(0, (log.water || 0) + ml) })
              }
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                background: `${C.A}15`,
                border: `1px solid ${C.A}30`,
                color: C.A,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
              }}
            >
              +{ml}ml
            </button>
          ))}
          <button
            onClick={() =>
              setLog({ water: Math.max(0, (log.water || 0) - 250) })
            }
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: `${C.D}15`,
              border: `1px solid ${C.D}30`,
              color: C.D,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            -250ml
          </button>
        </div>
      </div>

      {/* Meals */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
          Meal Plan
        </div>
        {MEALS.map((m) => {
          const done = log.done?.includes(m.id);
          return (
            <div
              key={m.id}
              onClick={() => toggleMeal(m.id)}
              style={{
                ...glass,
                padding: "16px 18px",
                cursor: "pointer",
                transition: "all 0.2s",
                border: `1px solid ${done ? C.S + "40" : C.border}`,
                background: done ? `rgba(34,197,94,0.06)` : C.card,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{m.emoji}</span>
                    <span
                      style={{ fontSize: 15, fontWeight: 700, color: C.text }}
                    >
                      {m.name}
                    </span>
                    <span style={{ fontSize: 12, color: C.muted }}>
                      {m.time}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: C.muted }}>
                    {m.items.join(" · ")}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: C.P, fontWeight: 600 }}>
                      {m.p}g protein
                    </span>
                    <span style={{ fontSize: 12, color: C.A }}>
                      {m.c}g carbs
                    </span>
                    <span style={{ fontSize: 12, color: C.W }}>{m.f}g fat</span>
                    <span style={{ fontSize: 12, color: C.muted }}>
                      {m.kcal} kcal
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: done ? C.S : "rgba(255,255,255,0.06)",
                    border: `2px solid ${done ? C.S : C.dim}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {done && <Check size={14} color="#000" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Supplements */}
      <div style={{ ...glass, padding: 18 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: C.text,
            marginBottom: 12,
          }}
        >
          Daily Supplements
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SUPPS.map((s) => (
            <Badge key={s} text={s} color={C.A} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PROGRESSION PAGE ──────────────────────────────────────────────────────────
function ProgressionPage({ logs, setLogs }) {
  const [selected, setSelected] = useState(PUSH[0].id);
  const [logEx, setLogEx] = useState(null);
  const ex = ALL_EX.find((e) => e.id === selected);
  const history = ex ? logs[ex.id] || [] : [];
  const nt = ex ? nextTarget(ex, history) : null;

  const chartData = history.slice(-10).map((h, i) => ({
    session: `S${i + 1}`,
    weight: h.sets[0]?.weight || 0,
    volume: h.sets.reduce((s, set) => s + set.weight * set.reps, 0),
    reps: h.sets[0]?.reps || 0,
  }));

  function saveLog(ex, sets) {
    setLogs((prev) => ({
      ...prev,
      [ex.id]: [...(prev[ex.id] || []), { date: today(), sets }],
    }));
    setLogEx(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SH title="Progressive Overload" sub="Double progression engine" />

      {/* Exercise selector */}
      <div style={{ ...glass, padding: 16 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.muted,
            marginBottom: 10,
          }}
        >
          Select Exercise
        </div>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            background: "rgba(255,255,255,0.06)",
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            color: C.text,
            fontSize: 14,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          {["Push", "Pull", "Legs"].map((day) => (
            <optgroup
              key={day}
              label={`── ${day} Day ──`}
              style={{ background: C.bg2 }}
            >
              {BY_DAY[day].map((e) => (
                <option key={e.id} value={e.id} style={{ background: C.bg2 }}>
                  {e.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {ex && (
        <>
          {/* Current targets */}
          <div
            style={{
              ...glass,
              padding: 20,
              border: `1px solid ${C.P}25`,
              background:
                "linear-gradient(135deg,rgba(0,229,255,0.05),transparent)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>
                  {ex.name}
                </div>
                <div style={{ fontSize: 13, color: C.muted }}>
                  {ex.muscle} · {ex.sets} sets · {ex.range.join("–")} reps
                </div>
              </div>
              <Btn onClick={() => setLogEx(ex)} size="sm">
                <Plus size={12} /> Log
              </Btn>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 10,
                marginBottom: 12,
              }}
            >
              {[
                [
                  "Last Session",
                  history.length
                    ? `${history[history.length - 1].sets[0]?.weight}kg ×${history[history.length - 1].sets[0]?.reps}`
                    : "—",
                  C.muted,
                ],
                ["Today's Target", `${nt.weight}kg ×${nt.reps}`, C.P],
                ["Sessions Done", history.length, C.S],
              ].map(([l, v, c]) => (
                <div
                  key={l}
                  style={{
                    padding: "12px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 10,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}
                  >
                    {l}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: c }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                padding: 12,
                background: `${C.P}08`,
                borderRadius: 10,
                border: `1px solid ${C.P}20`,
              }}
            >
              <div style={{ fontSize: 12, color: C.P }}>
                <strong>Next step: </strong>
                {nt.note}
              </div>
            </div>
          </div>

          {/* Charts */}
          {chartData.length >= 2 && (
            <div style={{ ...glass, padding: 20 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.text,
                  marginBottom: 16,
                }}
              >
                Weight Progression
              </div>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.P} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={C.P} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="session"
                      tick={{ fill: C.muted, fontSize: 11 }}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: C.muted, fontSize: 11 }}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: C.bg2,
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        color: C.text,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke={C.P}
                      strokeWidth={2.5}
                      fill="url(#wg)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* History */}
          <div style={{ ...glass, padding: 20 }}>
            <SH
              title="Session History"
              sub={`${history.length} total sessions`}
            />
            {history.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: C.muted,
                  padding: "30px 0",
                }}
              >
                Log your first session to see history
              </div>
            ) : (
              history
                .slice()
                .reverse()
                .map((h, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      marginBottom: 6,
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ fontSize: 13, color: C.muted }}>
                      {fmt(h.date)}
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                      {h.sets.map((s, j) => (
                        <div key={j} style={{ textAlign: "center" }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: C.text,
                            }}
                          >
                            {s.weight}kg × {s.reps}
                          </div>
                          <div style={{ fontSize: 10, color: C.muted }}>
                            Set {j + 1} · RIR {s.rir}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        </>
      )}
      {logEx && (
        <LogModal
          ex={logEx}
          onClose={() => setLogEx(null)}
          onSave={(sets) => saveLog(logEx, sets)}
        />
      )}
    </div>
  );
}

// ── WALK PAGE ─────────────────────────────────────────────────────────────────
function WalkPage({ walkLogs, setWalkLogs }) {
  const todayKey = today();
  const log = walkLogs[todayKey] || {};
  const dayType = getDayType();
  const target = getWalkTarget(dayType);
  function toggle(k) {
    setWalkLogs((p) => ({
      ...p,
      [todayKey]: { ...log, [k]: log[k] ? 0 : WALK_SESSION_MINUTES },
    }));
  }
  const doneMinutes = ["morning", "afternoon", "evening"].reduce(
    (sum, k) => sum + walkMinutes(log[k]),
    0,
  );

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const k = d.toISOString().slice(0, 10);
    const wl = walkLogs[k] || {};
    return {
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      minutes: ["morning", "afternoon", "evening"].reduce(
        (sum, s) => sum + walkMinutes(wl[s]),
        0,
      ),
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SH
        title="Walking Tracker"
        sub="Daily movement for recovery & fat loss"
      />

      <div
        style={{
          ...glass,
          padding: 24,
          textAlign: "center",
          background:
            "linear-gradient(135deg,rgba(34,197,94,0.06),transparent)",
        }}
      >
        <Ring
          pct={Math.round((doneMinutes / target.max) * 100)}
          size={110}
          stroke={9}
          color={C.S}
          label={`${doneMinutes}m`}
          sub="today"
        />
        <div
          style={{
            marginTop: 16,
            fontSize: 18,
            fontWeight: 700,
            color: C.text,
          }}
        >
          Target: {target.label} {dayType === "Rest" ? "(Rest day)" : ""}
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
          {dayType === "Rest"
            ? "Long recovery walk"
            : "Morning walk mandatory on training days"}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          [
            "morning",
            "🌅",
            "Morning Walk",
            "Best for fat loss — fasted cardio",
          ],
          ["afternoon", "☀️", "Afternoon Walk", "NEAT boost — post lunch"],
          ["evening", "🌙", "Evening Walk", "Post workout — aids recovery"],
        ].map(([k, em, name, desc]) => (
          <div
            key={k}
            onClick={() => toggle(k)}
            style={{
              ...glass,
              padding: "16px 18px",
              cursor: "pointer",
              transition: "all 0.2s",
              border: `1px solid ${log[k] ? `${C.S}50` : C.border}`,
              background: log[k] ? "rgba(34,197,94,0.08)" : C.card,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>{em}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                    {name} · {walkMinutes(log[k])} min
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>{desc}</div>
                </div>
              </div>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: log[k] ? C.S : "rgba(255,255,255,0.06)",
                  border: `2px solid ${log[k] ? C.S : C.dim}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {log[k] && <Check size={16} color="#000" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...glass, padding: 20 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: C.text,
            marginBottom: 16,
          }}
        >
          Weekly Walks
        </div>
        <div style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} barSize={28}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="day"
                tick={{ fill: C.muted, fontSize: 11 }}
                axisLine={false}
              />
              <YAxis
                domain={[0, 60]}
                ticks={[0, 15, 30, 45, 60]}
                tick={{ fill: C.muted, fontSize: 11 }}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: C.bg2,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  color: C.text,
                }}
              />
              <Bar dataKey="minutes" fill={C.S} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── MEASUREMENTS PAGE ─────────────────────────────────────────────────────────
function MeasurementsPage({ measurements, setMeasurements }) {
  const [form, setForm] = useState({
    weight: 60.4,
    waist: 80,
    chest: 90,
    shoulders: 105,
    arms: 32,
    forearms: 28,
    thighs: 52,
    calves: 34,
    neck: 37,
  });
  const [adding, setAdding] = useState(false);
  const last = measurements.length
    ? measurements[measurements.length - 1]
    : null;
  const prev =
    measurements.length > 1 ? measurements[measurements.length - 2] : null;
  const fields = [
    ["weight", "Weight", "kg", C.P],
    ["waist", "Waist", "cm", C.W],
    ["chest", "Chest", "cm", C.A],
    ["shoulders", "Shoulders", "cm", C.S],
    ["arms", "Arms", "cm", C.P],
    ["forearms", "Forearms", "cm", C.S],
    ["thighs", "Thighs", "cm", C.A],
    ["calves", "Calves", "cm", C.W],
    ["neck", "Neck", "cm", C.muted],
  ];

  const monthlyData = measurements.slice(-6).map((m) => ({
    date: fmt(m.date),
    weight: m.weight,
    waist: m.waist,
    chest: m.chest,
    shoulders: m.shoulders,
    arms: m.arms,
    forearms: m.forearms,
    thighs: m.thighs,
    calves: m.calves,
  }));

  function saveMeasurement() {
    setMeasurements((p) => [...p, { ...form, date: today() }]);
    setAdding(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <SH title="Body Measurements" sub="Track your transformation" />
        <Btn onClick={() => setAdding(!adding)} size="sm">
          <Plus size={12} /> Add Today
        </Btn>
      </div>

      {adding && (
        <div style={{ ...glass, padding: 20, border: `1px solid ${C.P}30` }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: C.text,
              marginBottom: 16,
            }}
          >
            New Measurement
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {fields.map(([k, label, , c]) => (
              <div key={k}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
                  {label}
                </div>
                <input
                  type="number"
                  step={0.1}
                  value={form[k]}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      [k]: parseFloat(e.target.value) || 0,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    color: C.text,
                    fontSize: 14,
                    fontFamily: "inherit",
                  }}
                />
              </div>
            ))}
          </div>
          <Btn onClick={saveMeasurement}>
            <Check size={14} /> Save
          </Btn>
        </div>
      )}

      {/* Current stats */}
      {(last || PROFILE) && (
        <div style={{ ...glass, padding: 20 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: C.text,
              marginBottom: 16,
            }}
          >
            Current Stats {last ? `(${fmt(last.date)})` : "(Starting)"}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
              gap: 10,
            }}
          >
            {fields.map(([k, label, unit, c]) => {
              const curr = last?.[k] || PROFILE[k] || form[k];
              const p = prev?.[k];
              const diff = p ? (curr - p).toFixed(1) : null;
              return (
                <div
                  key={k}
                  style={{
                    padding: "12px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 10,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}
                  >
                    {label}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: c }}>
                    {curr}
                    <span style={{ fontSize: 11 }}>{unit}</span>
                  </div>
                  {diff && (
                    <div
                      style={{
                        fontSize: 11,
                        color: Number(diff) > 0 ? C.W : C.S,
                      }}
                    >
                      {Number(diff) > 0 ? "+" : ""}
                      {diff}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weight trend chart */}
      {measurements.length >= 2 && (
        <div style={{ ...glass, padding: 20 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: C.text,
              marginBottom: 16,
            }}
          >
            Weight Trend
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { date: "Start", weight: PROFILE.weight },
                  ...measurements.map((m) => ({
                    date: fmt(m.date),
                    weight: m.weight,
                  })),
                ]}
              >
                <defs>
                  <linearGradient id="wgt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.P} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={C.P} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: C.muted, fontSize: 10 }}
                  axisLine={false}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fill: C.muted, fontSize: 10 }}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: C.bg2,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    color: C.text,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke={C.P}
                  strokeWidth={2.5}
                  fill="url(#wgt)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {measurements.length === 0 && (
        <div style={{ ...glass, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📏</div>
          <div style={{ fontSize: 16, color: C.text, fontWeight: 600 }}>
            No measurements yet
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            Tap "Add Today" to log your first measurement
          </div>
        </div>
      )}
    </div>
  );
}

// ── INBODY PAGE ───────────────────────────────────────────────────────────────
function InBodyPage({ inbody, setInBody }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    weight: 60.4,
    smm: 26.9,
    pbf: 20.7,
    bfm: 12.5,
    visceral: 5,
    score: 72,
    whr: 0.82,
  });

  const baseline = inbody[0] || BASELINE_INBODY;
  const last = inbody.length ? inbody[inbody.length - 1] : null;
  const fields = [
    ["weight", "Weight", "kg"],
    ["smm", "Skeletal Muscle", "kg"],
    ["pbf", "Body Fat %", "%"],
    ["bfm", "Fat Mass", "kg"],
    ["visceral", "Visceral Fat", "lvl"],
    ["score", "InBody Score", "pts"],
    ["whr", "WHR", ""],
  ];

  const compositionData = inbody.map((scan) => ({
    date: fmt(scan.date),
    smm: scan.smm,
    pbf: scan.pbf,
  }));

  const monthlyData = inbody.slice(-6).map((scan) => ({
    date: fmt(scan.date),
    weight: scan.weight,
    waist: scan.waist,
    chest: scan.chest,
    shoulders: scan.shoulders,
    arms: scan.arms,
    forearms: scan.forearms,
    thighs: scan.thighs,
    calves: scan.calves,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <SH title="InBody Tracker" sub="Body composition scans" />
        <Btn onClick={() => setAdding(!adding)} size="sm">
          <Plus size={12} /> New Scan
        </Btn>
      </div>

      {adding && (
        <div style={{ ...glass, padding: 20, border: `1px solid ${C.P}30` }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: C.text,
              marginBottom: 16,
            }}
          >
            New InBody Scan
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {fields.map(([k, label, unit]) => (
              <div key={k}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
                  {label} ({unit})
                </div>
                <input
                  type="number"
                  step={0.1}
                  value={form[k]}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      [k]: parseFloat(e.target.value) || 0,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    color: C.text,
                    fontSize: 14,
                    fontFamily: "inherit",
                  }}
                />
              </div>
            ))}
          </div>
          <Btn
            onClick={() => {
              setInBody((prev) => [...prev, { ...form, date: today() }]);
              setAdding(false);
            }}
          >
            <Check size={14} /> Save Scan
          </Btn>
        </div>
      )}

      <div style={{ ...glass, padding: 20, border: `1px solid ${C.P}20` }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.P,
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          BASELINE SCAN
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))",
            gap: 10,
          }}
        >
          {[
            ["Weight", `${baseline.weight} kg`, C.P],
            ["Muscle", `${baseline.smm} kg`, C.A],
            ["Body Fat", `${baseline.pbf}%`, C.W],
            ["WHR", `${baseline.whr}`, C.S],
            ["Score", `${baseline.score} pts`, C.P],
            ["Visceral", `Lvl ${baseline.visceral}`, C.D],
            ["Forearms", `${baseline.forearms || PROFILE.forearms} cm`, C.S],
          ].map(([label, value, color]) => (
            <div
              key={label}
              style={{
                padding: "10px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 10,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {last ? (
        <div style={{ ...glass, padding: 20 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: C.text,
              marginBottom: 12,
            }}
          >
            Scan Comparison
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {[
              ["Weight", `${baseline.weight} → ${last.weight}`, C.P],
              ["Muscle", `${baseline.smm} → ${last.smm}`, C.A],
              ["Body Fat", `${baseline.pbf} → ${last.pbf}`, C.W],
              ["Score", `${baseline.score} → ${last.score}`, C.S],
            ].map(([label, value, color]) => (
              <div
                key={label}
                style={{
                  padding: 12,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 10,
                }}
              >
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
            <div style={{ ...glass, padding: 20 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.text,
                  marginBottom: 16,
                }}
              >
                Weight Trend
              </div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { date: "Base", weight: baseline.weight },
                      ...inbody.map((scan) => ({
                        date: fmt(scan.date),
                        weight: scan.weight,
                      })),
                    ]}
                  >
                    <defs>
                      <linearGradient id="wgt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.P} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={C.P} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: C.muted, fontSize: 10 }}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: C.muted, fontSize: 10 }}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: C.bg2,
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        color: C.text,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke={C.P}
                      strokeWidth={2.5}
                      fill="url(#wgt)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ ...glass, padding: 20 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.text,
                  marginBottom: 16,
                }}
              >
                Composition Trend
              </div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={
                      compositionData.length
                        ? compositionData
                        : [
                            {
                              date: "Base",
                              smm: baseline.smm,
                              pbf: baseline.pbf,
                            },
                          ]
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: C.muted, fontSize: 10 }}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: C.muted, fontSize: 10 }}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: C.bg2,
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        color: C.text,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="smm"
                      stroke={C.A}
                      strokeWidth={2}
                      dot={{ fill: C.A, r: 3 }}
                      name="SMM (kg)"
                    />
                    <Line
                      type="monotone"
                      dataKey="pbf"
                      stroke={C.W}
                      strokeWidth={2}
                      dot={{ fill: C.W, r: 3 }}
                      name="PBF (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ ...glass, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>🔬</div>
          <div
            style={{
              fontSize: 16,
              color: C.text,
              fontWeight: 600,
              marginTop: 12,
            }}
          >
            No scans logged yet
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            Add your InBody scan results to track body composition
          </div>
        </div>
      )}
    </div>
  );
}

// ── GOALS PAGE ───────────────────────────────────────────────────────────────
function GoalsPage({ onExportData, onImportData, inbody }) {
  const curr = inbody.length ? inbody[inbody.length - 1] : BASELINE_INBODY;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ ...glass, padding: 20 }}>
        <SH
          title="Monthly Goals"
          sub="Phase-based body recomposition targets"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            [
              "⚖️ Weight",
              [PROFILE.weight, GOALS[0].weight[1]],
              curr.weight,
              "kg",
              PROFILE.weight,
              C.P,
            ],
            [
              "💪 Muscle Mass",
              [PROFILE.smm, GOALS[0].smm[1]],
              curr.smm,
              "kg",
              PROFILE.smm,
              C.A,
            ],
            [
              "🔥 Body Fat",
              [PROFILE.pbf, GOALS[0].pbf[1]],
              curr.pbf,
              "%",
              PROFILE.pbf,
              C.W,
            ],
            [
              "⭐ InBody Score",
              [PROFILE.score, GOALS[0].score[1]],
              curr.score,
              "pts",
              PROFILE.score,
              C.S,
            ],
          ].map(([label, range, val, unit, base, color]) => {
            const targetMax = Array.isArray(range) ? range[1] : range;
            const pct = Math.max(
              0,
              Math.min(
                100,
                ((Number(val) - Number(base)) /
                  (Number(targetMax) - Number(base))) *
                  100 || 0,
              ),
            );
            return (
              <div key={label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 13, color: C.text }}>{label}</span>
                  <span style={{ fontSize: 13, color, fontWeight: 600 }}>
                    {Array.isArray(range) ? range.join("–") : range}
                    {unit}
                  </span>
                </div>
                <Bar2 pct={pct} color={color} height={5} />
              </div>
            );
          })}
        </div>
      </div>

      {GOALS.map((g, gi) => (
        <div key={g.month} style={{ ...glass, padding: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>
              {g.month}
            </div>
            <Badge
              text={gi === 0 ? "Current" : "Upcoming"}
              color={gi === 0 ? C.P : C.muted}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["⚖️ Weight", g.weight, curr.weight, "kg", PROFILE.weight, C.P],
              ["💪 Muscle Mass", g.smm, curr.smm, "kg", PROFILE.smm, C.A],
              ["🔥 Body Fat", g.pbf, curr.pbf, "%", PROFILE.pbf, C.W],
              [
                "⭐ InBody Score",
                g.score,
                curr.score,
                "pts",
                PROFILE.score,
                C.S,
              ],
            ].map(([label, range, val, unit, base, color]) => {
              const pct = Math.max(
                0,
                Math.min(
                  100,
                  ((Number(val) - Number(base)) /
                    (Number(range[1]) - Number(base))) *
                    100 || 0,
                ),
              );
              return (
                <div key={label}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 13, color: C.text }}>{label}</span>
                    <span style={{ fontSize: 13, color, fontWeight: 600 }}>
                      {range.join("–")}
                      {unit}
                    </span>
                  </div>
                  <Bar2 pct={gi === 0 ? pct : 0} color={color} height={5} />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ ...glass, padding: 20 }}>
        <SH title="Achievements" sub="Milestones & badges" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[
            {
              name: "First Workout",
              desc: "Log your first session",
              icon: "🏋️",
              earned: false,
            },
            {
              name: "Week Warrior",
              desc: "7 day streak",
              icon: "🔥",
              earned: false,
            },
            {
              name: "Protein King",
              desc: "Hit protein 7 days",
              icon: "🥩",
              earned: false,
            },
            {
              name: "Iron Will",
              desc: "30 workouts",
              icon: "⚡",
              earned: false,
            },
            {
              name: "First PR",
              desc: "Break a personal record",
              icon: "🏆",
              earned: false,
            },
            {
              name: "Recomp Mode",
              desc: "SMM up, fat down",
              icon: "💎",
              earned: false,
            },
          ].map((a) => (
            <div
              key={a.name}
              style={{
                ...glass,
                padding: "14px 16px",
                width: 140,
                textAlign: "center",
                opacity: a.earned ? 1 : 0.5,
                border: `1px solid ${a.earned ? C.W + "40" : C.border}`,
                background: a.earned ? `rgba(245,158,11,0.08)` : C.card,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{a.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                {a.name}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                {a.desc}
              </div>
              {a.earned && <Badge text="Earned!" color={C.W} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...glass, padding: 20 }}>
        <SH title="Backup & Restore" sub="Keep your local progress safe" />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Btn onClick={onExportData}>
            <ArrowDown size={14} /> Export Data
          </Btn>
          <Btn onClick={onImportData} variant="ghost">
            <ArrowUp size={14} /> Import Data
          </Btn>
        </div>
        <div
          style={{
            fontSize: 12,
            color: C.muted,
            marginTop: 10,
            lineHeight: 1.6,
          }}
        >
          Exports include workouts, completions, diet, walking, measurements,
          and InBody scans. Import a JSON backup to restore everything in one
          step.
        </div>
        <div
          style={{ fontSize: 12, color: C.W, marginTop: 8, lineHeight: 1.6 }}
        >
          Data stays in this browser until you export it. Clearing browser data
          will remove localStorage content.
        </div>
      </div>
    </div>
  );
}

// ── COACH PAGE ────────────────────────────────────────────────────────────────
function CoachPage({ logs, dietLogs, walkLogs, measurements, streakDays }) {
  const todayKey = today();
  const totalSessions = Object.values(logs).reduce(
    (s, arr) => s + (arr?.length || 0),
    0,
  );
  const weeklySessions = Object.values(logs).reduce((s, arr) => {
    const recent =
      arr?.filter((l) => {
        const d = new Date(l.date);
        const diff = (Date.now() - d) / 86400000;
        return diff <= 7;
      }) || [];
    return s + recent.length;
  }, 0);
  const diet = dietLogs[todayKey] || {};
  const protToday = MEALS.filter((m) => diet.done?.includes(m.id)).reduce(
    (s, m) => s + m.p,
    0,
  );
  const walkToday = ["morning", "afternoon", "evening"].reduce(
    (sum, key) => sum + walkMinutes((walkLogs[todayKey] || {})[key]),
    0,
  );

  const insights = [
    {
      icon: "💪",
      title: "Training Volume",
      color: C.P,
      msg:
        totalSessions < 5
          ? "Just getting started! Log your first workouts to build the foundation."
          : `${totalSessions} total sessions logged. Consistency is your superpower. Keep building!`,
    },
    {
      icon: "🥩",
      title: "Protein Intake",
      color: C.A,
      msg:
        protToday >= TOTAL.p
          ? `Protein target crushed today! ${protToday}g / ${TOTAL.p}g ✓`
          : `${protToday}g protein so far today. Target: ${TOTAL.p}g. Focus on hitting your pre-workout and dinner meals.`,
    },
    {
      icon: "🔥",
      title: "Streak Status",
      color: C.W,
      msg:
        streakDays >= 7
          ? `${streakDays} day streak! You're in the zone. Consistency compounds over time.`
          : streakDays > 0
            ? `${streakDays} day streak. Building momentum! Aim for 7 consecutive days.`
            : "Start a new streak today. Every champion was once a beginner.",
    },
    {
      icon: "🚶",
      title: "Daily Walking",
      color: C.S,
      msg:
        walkToday >= 45
          ? `Walk target crushed today! ${walkToday} min logged. Perfect NEAT activity for your recomp goals.`
          : walkToday > 0
            ? `${walkToday} min logged today. Walking boosts fat oxidation and supports muscle recovery.`
            : "No walks logged today. Even a 15-minute morning walk significantly supports recomposition.",
    },
    {
      icon: "📊",
      title: "Body Composition",
      color: C.P,
      msg: `Starting at 20.7% body fat with 26.9kg muscle. Your recomp plan targets simultaneous muscle gain and fat loss. This is achievable as a beginner — maximize this window!`,
    },
    {
      icon: "⚡",
      title: "Progressive Overload",
      color: C.A,
      msg: "Apply double progression: add 1 rep each session until hitting the top of your range, then increase weight. Trust the process — strength takes 4–8 weeks to manifest visually.",
    },
    {
      icon: "😴",
      title: "Recovery",
      color: C.W,
      msg: "6 training days per week is high volume. Prioritize 7–9 hours sleep, which is when muscle protein synthesis peaks. Your rest day walk supports active recovery.",
    },
    {
      icon: "🎯",
      title: "Month 1 Focus",
      color: C.S,
      msg: "Priority: build consistent habits, learn movement patterns, nail nutrition. Month 1 is about laying the neurological and structural foundation. Strength gains now are largely neural!",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SH
        title="Intelligent Coach"
        sub="Personalized analysis & recommendations"
      />

      <div
        style={{
          ...glass,
          padding: 20,
          background:
            "linear-gradient(135deg,rgba(0,229,255,0.08),rgba(56,189,248,0.04))",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: `${C.P}20`,
              border: `2px solid ${C.P}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>
              Senpai Coach
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>
              Analyzing your data...
            </div>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 8,
          }}
        >
          {[
            ["Sessions", totalSessions, C.P],
            ["Streak", `${streakDays}d`, C.W],
            ["Walks", `${walkToday}m`, C.S],
          ].map(([l, v, c]) => (
            <div
              key={l}
              style={{
                textAlign: "center",
                padding: "10px",
                background: "rgba(0,0,0,0.2)",
                borderRadius: 10,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {insights.map((ins, i) => (
        <div
          key={i}
          style={{
            ...glass,
            padding: "18px 20px",
            borderLeft: `3px solid ${ins.color}`,
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{ins.icon}</span>
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: ins.color,
                  marginBottom: 4,
                }}
              >
                {ins.title}
              </div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>
                {ins.msg}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── NAVIGATION ────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", Icon: Home },
  { id: "workout", label: "Workout", Icon: Dumbbell },
  { id: "diet", label: "Diet", Icon: UtensilsCrossed },
  { id: "progression", label: "Progress", Icon: TrendingUp },
  { id: "walk", label: "Walk", Icon: Footprints },
  { id: "measurements", label: "Body", Icon: Ruler },
  { id: "inbody", label: "InBody", Icon: Activity },
  { id: "goals", label: "Goals", Icon: Target },
  { id: "coach", label: "Coach", Icon: Brain },
];

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [logs, setLogs] = useLS("senpai_workout_logs", {});
  const [workoutCompletions, setWorkoutCompletions] = useLS(
    "senpai_workout_completions",
    {},
  );
  const [dietLogs, setDietLogs] = useLS("senpai_diet_logs", {});
  const [walkLogs, setWalkLogs] = useLS("senpai_walk_logs", {});
  const [measurements, setMeasurements] = useLS("senpai_measurements", []);
  const [inbody, setInBody] = useLS("senpai_inbody", []);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        STORAGE_KEYS.meta,
        JSON.stringify({
          version: STORAGE_VERSION,
          updatedAt: new Date().toISOString(),
        }),
      );
    } catch {}
  }, []);

  // Calculate streak
  const streak = useMemo(() => {
    let s = 0;
    const d = new Date();
    for (let i = 0; i < 60; i++) {
      const k = d.toISOString().slice(0, 10);
      const dt = getDayType(d);
      if (dt === "Rest") {
        d.setDate(d.getDate() - 1);
        continue;
      }
      const worked = workoutDoneForDate(logs, workoutCompletions, k);
      if (worked) s++;
      else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, [logs, workoutCompletions]);

  const exportData = useCallback(() => {
    downloadJson(`senpai-physique-backup-${today()}.json`, {
      logs,
      workoutCompletions,
      dietLogs,
      walkLogs,
      measurements,
      inbody,
      version: 1,
      exportedAt: new Date().toISOString(),
    });
  }, [dietLogs, inbody, logs, measurements, walkLogs, workoutCompletions]);

  const importData = useCallback(
    (payload) => {
      if (!payload || typeof payload !== "object") return;
      if (payload.logs) setLogs(payload.logs);
      if (payload.workoutCompletions)
        setWorkoutCompletions(payload.workoutCompletions);
      if (payload.dietLogs) setDietLogs(payload.dietLogs);
      if (payload.walkLogs) setWalkLogs(payload.walkLogs);
      if (payload.measurements) setMeasurements(payload.measurements);
      if (payload.inbody) setInBody(payload.inbody);
    },
    [
      setDietLogs,
      setInBody,
      setLogs,
      setMeasurements,
      setWalkLogs,
      setWorkoutCompletions,
    ],
  );

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      importData(JSON.parse(text));
    } catch {
      alert(
        "Could not import backup. Please select a valid Senpai Physique JSON file.",
      );
    }
  }

  const pageProps = {
    logs,
    setLogs,
    workoutCompletions,
    setWorkoutCompletions,
    dietLogs,
    setDietLogs,
    walkLogs,
    setWalkLogs,
    measurements,
    setMeasurements,
    inbody,
    setInBody,
    streakDays: streak,
    onExportData: exportData,
    onImportData: handleImportClick,
    onNavigate: setPage,
  };

  const pages = {
    dashboard: <Dashboard {...pageProps} />,
    workout: <WorkoutPage {...pageProps} />,
    diet: <DietPage {...pageProps} />,
    progression: <ProgressionPage {...pageProps} />,
    walk: <WalkPage {...pageProps} />,
    measurements: <MeasurementsPage {...pageProps} />,
    inbody: <InBodyPage {...pageProps} />,
    goals: <GoalsPage {...pageProps} />,
    coach: <CoachPage {...pageProps} />,
  };

  const curNav = NAV.find((n) => n.id === page);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { color-scheme: dark; }
        body { background: ${C.bg}; color: ${C.text}; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.2); border-radius: 10px; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        select option { background: #0D1526; }
      `}</style>

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: `radial-gradient(ellipse at 20% 20%, rgba(0,229,255,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(56,189,248,0.03) 0%, transparent 60%), ${C.bg}`,
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: 64,
            flexShrink: 0,
            background: "rgba(7,12,21,0.95)",
            borderRight: `1px solid ${C.border}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px 0",
            gap: 4,
            position: "sticky",
            top: 0,
            height: "100vh",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `linear-gradient(135deg,${C.P},${C.A})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              fontSize: 18,
            }}
          >
            ⚡
          </div>
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              title={label}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                background: page === id ? `${C.P}15` : "transparent",
                color: page === id ? C.P : C.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: page === id ? `0 0 12px ${C.P}30` : "none",
                position: "relative",
              }}
            >
              <Icon size={18} />
              {page === id && (
                <div
                  style={{
                    position: "absolute",
                    right: -1,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 2,
                    height: 20,
                    background: C.P,
                    borderRadius: 2,
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 20px 40px" }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            style={{ display: "none" }}
          />
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {/* Page header */}
            <div
              style={{
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: C.muted,
                    letterSpacing: 2,
                    marginBottom: 2,
                  }}
                >
                  SENPAI PHYSIQUE
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: C.text,
                    letterSpacing: "-0.5px",
                    fontFamily: "Syne, sans-serif",
                  }}
                >
                  {curNav?.label}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.P }}>
                  {getDayType()} Day
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>
                  {new Date().toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </div>
            </div>
            {pages[page]}
          </div>
        </div>
      </div>
    </>
  );
}
