export interface Variation {
  name: string;
  equip: string;
  desc: string;
}

export interface Exercise {
  name: string;
  type: "compound" | "isolation";
  sets: number;
  reps: string;
  detail: string;
  vars: Variation[];
}

export interface DayData {
  label: string;
  dayLabel: string;
  dayType: string;
  muscles: string[];
  tip: string;
  exercises: Exercise[];
}

export type DayKey = "d1" | "d2" | "d3" | "d4";

export const DAYS: Record<DayKey, DayData> = {
  d1: {
    label: "Mon · Push",
    dayLabel: "Day 1 — Upper Body (Push Focus)",
    dayType: "Push",
    muscles: ["Chest", "Upper Chest", "Shoulders", "Triceps"],
    tip: "Rest 2–3 min between compound sets, 60–90 sec for isolation. Log weights every session and aim to beat last week.",
    exercises: [
      {
        name: "Barbell Bench Press",
        type: "compound",
        sets: 4,
        reps: "6–10",
        detail:
          "Primary chest mass builder. Retract scapula, bar touches mid-sternum, press in a straight line. Feet flat on floor throughout.",
        vars: [
          {
            name: "Dumbbell Bench Press",
            equip: "Dumbbells",
            desc: "Greater ROM and independent arm movement. Press straight up, slight inward arc at the top. Reduces bar-path reliance.",
          },
          {
            name: "Push-Ups (Weighted / Feet Elevated)",
            equip: "Bodyweight",
            desc: "Elevate feet on a bench for upper-chest emphasis. Place a weight plate on your back to add progressive overload.",
          },
          {
            name: "Smith Machine Bench Press",
            equip: "Smith Machine",
            desc: "Fixed bar path reduces stabiliser demand — good when training alone. Same cues: scapula retracted, controlled descent.",
          },
        ],
      },
      {
        name: "Incline Dumbbell Press",
        type: "compound",
        sets: 3,
        reps: "8–12",
        detail:
          "Upper chest emphasis. Set bench to 30–45°. Full stretch at the bottom is the key — don't cut the range short.",
        vars: [
          {
            name: "Incline Barbell Press",
            equip: "Barbell",
            desc: "Heavier loading than dumbbells. Use 30–45° incline. Wider grip targets upper chest best.",
          },
          {
            name: "Low-to-High Cable Fly",
            equip: "Cable Machine",
            desc: "Constant tension through full ROM — pull from low pulley to eye level. Exceptional upper-chest stretch and peak contraction.",
          },
          {
            name: "Incline Push-Up",
            equip: "Bodyweight",
            desc: "Hands on an elevated surface (bench or step). Pause at the top, slow controlled descent. Add a weighted vest to progress.",
          },
        ],
      },
      {
        name: "Seated Dumbbell Overhead Press",
        type: "compound",
        sets: 3,
        reps: "8–12",
        detail:
          "Hits all three delt heads. Full ROM overhead. Core tight, slight backward lean only at the very top.",
        vars: [
          {
            name: "Barbell Overhead Press (OHP)",
            equip: "Barbell",
            desc: "Greater loading potential. Press from front-rack, lock out directly overhead, keep bar over spine throughout.",
          },
          {
            name: "Arnold Press",
            equip: "Dumbbells",
            desc: "Rotating press hits all three delt heads. Start palms facing you, rotate outward as you press overhead.",
          },
          {
            name: "Pike Push-Up",
            equip: "Bodyweight",
            desc: "Inverted-V position. Bend elbows to lower head toward floor. Progressively raise feet on a box to increase difficulty.",
          },
        ],
      },
      {
        name: "Cable Chest Fly (Low to High)",
        type: "isolation",
        sets: 3,
        reps: "12–15",
        detail:
          "Peak chest contraction under constant load throughout the ROM. Slight elbow bend throughout. Slow, controlled eccentric.",
        vars: [
          {
            name: "Pec Deck / Chest Fly Machine",
            equip: "Machine",
            desc: "Guided arc with constant tension. Squeeze at full contraction. Easier to isolate the chest than free-weight flys.",
          },
          {
            name: "Dumbbell Fly (Flat Bench)",
            equip: "Dumbbells",
            desc: "Full chest stretch at the bottom is the goal. Slight elbow bend throughout — don't go heavy enough to lose the arc.",
          },
          {
            name: "Resistance Band Fly",
            equip: "Resistance Bands",
            desc: "Anchor bands at low attachment points. Similar movement pattern to cables with constant tension through ROM.",
          },
        ],
      },
      {
        name: "Overhead Tricep Extension",
        type: "isolation",
        sets: 3,
        reps: "10–14",
        detail:
          "Long head fully stretched at the bottom — key to complete tricep mass. EZ bar or rope cable. Elbows pointed at the ceiling.",
        vars: [
          {
            name: "Skull Crusher (EZ Bar)",
            equip: "EZ Bar",
            desc: "Lie on bench, lower bar toward forehead. Strong long-head stretch overload. Slow eccentric, controlled throughout.",
          },
          {
            name: "Dumbbell Overhead Extension",
            equip: "Dumbbells",
            desc: "One or two dumbbells. Same mechanics — elbows point to ceiling, fully extend at the top without flaring elbows.",
          },
          {
            name: "Resistance Band Overhead Extension",
            equip: "Resistance Bands",
            desc: "Stand on the band, press overhead behind head. Good home or travel alternative. Same stretched long-head position.",
          },
        ],
      },
      {
        name: "Dumbbell Lateral Raise",
        type: "isolation",
        sets: 3,
        reps: "12–20",
        detail:
          "Non-negotiable for shoulder width. Slight forward torso tilt, lead with elbows, 3-second controlled descent every rep.",
        vars: [
          {
            name: "Cable Lateral Raise",
            equip: "Cable Machine",
            desc: "Constant tension through full ROM unlike dumbbells which go slack at the bottom. Pull from a low cable, one arm at a time.",
          },
          {
            name: "Machine Lateral Raise",
            equip: "Machine",
            desc: "Smooth guided resistance curve. Adjust seat so elbows align with the machine's pivot point for best mechanics.",
          },
          {
            name: "Resistance Band Lateral Raise",
            equip: "Resistance Bands",
            desc: "Stand on band, raise to shoulder height. Tension increases as you raise — greater overload at the contracted position.",
          },
        ],
      },
    ],
  },
  d2: {
    label: "Tue · Quad",
    dayLabel: "Day 2 — Lower Body (Quad Focus)",
    dayType: "Quad",
    muscles: ["Quads", "Glutes", "Hamstrings", "Calves", "Core"],
    tip: "Squat first when fresh. Core braced on every lower body movement. Drive through mid-foot.",
    exercises: [
      {
        name: "Barbell Back Squat",
        type: "compound",
        sets: 4,
        reps: "5–8",
        detail:
          "King of quad mass. Depth at or below parallel. Hard core brace, knees tracking over toes, chest up throughout the lift.",
        vars: [
          {
            name: "Goblet Squat",
            equip: "Dumbbell / Kettlebell",
            desc: "Hold weight at chest. Forces upright torso and deep depth naturally. Best for learning squat mechanics before loading a barbell.",
          },
          {
            name: "Leg Press (High Foot Placement)",
            equip: "Leg Press Machine",
            desc: "Higher foot position shifts load toward quads and glutes. Full ROM critical — don't let knees cave on the way up.",
          },
          {
            name: "Dumbbell Bulgarian Split Squat",
            equip: "Dumbbells",
            desc: "Dumbbells at sides, rear foot elevated on bench. Unilateral substitute when barbells are unavailable. Same depth and front-shin cues.",
          },
        ],
      },
      {
        name: "Bulgarian Split Squat",
        type: "compound",
        sets: 3,
        reps: "8–12",
        detail:
          "Best unilateral quad builder. Rear foot on bench, front shin mostly vertical, deep stretch at the bottom — don't rush it.",
        vars: [
          {
            name: "Reverse Lunge",
            equip: "Bodyweight / Dumbbells",
            desc: "Step back into a lunge, lower rear knee toward floor. Less balance-demanding than BSS but very similar stimulus.",
          },
          {
            name: "Step-Up (Weighted)",
            equip: "Dumbbells + Box",
            desc: "Drive through the front heel on a box or bench. Targets quads and glutes unilaterally. Don't push off the rear leg.",
          },
          {
            name: "Walking Lunge (Weighted)",
            equip: "Dumbbells / Barbell",
            desc: "Continuous forward lunges with dumbbells or barbell. High quad and glute demand. Great for volume work.",
          },
        ],
      },
      {
        name: "Hack Squat / Leg Press",
        type: "compound",
        sets: 3,
        reps: "10–15",
        detail:
          "Upright torso isolates quads maximally. Full ROM every rep. Slow controlled descent — don't bounce out of the bottom.",
        vars: [
          {
            name: "Front Squat",
            equip: "Barbell",
            desc: "Front rack forces upright torso — naturally shifts load to quads. Greater knee flexion than back squat. Use straps if wrist mobility is limited.",
          },
          {
            name: "Sissy Squat",
            equip: "Bodyweight",
            desc: "Lean back, drop knees toward floor keeping torso and thighs aligned. Extreme quad isolation. Hold a support until comfortable.",
          },
          {
            name: "Narrow-Stance Goblet Squat",
            equip: "Dumbbell / Kettlebell",
            desc: "Feet close together emphasises quads over glutes. Hold weight at chest. Slow descent for maximum quad time-under-tension.",
          },
        ],
      },
      {
        name: "Romanian Deadlift (RDL)",
        type: "compound",
        sets: 3,
        reps: "8–12",
        detail:
          "Hip hinge — push hips back, bar close to legs, feel the hamstring stretch at the bottom. Soft knee bend, neutral spine.",
        vars: [
          {
            name: "Dumbbell RDL",
            equip: "Dumbbells",
            desc: "Identical movement — dumbbells travel outside the legs. Easier to learn. Good when barbells aren't available.",
          },
          {
            name: "Single-Leg RDL",
            equip: "Dumbbell / Bodyweight",
            desc: "Extreme hamstring stretch and balance challenge. Hold opposite-side dumbbell as counterbalance. Great unilateral hip hinge.",
          },
          {
            name: "Good Morning",
            equip: "Barbell",
            desc: "Bar on upper back, hinge at the hip with soft knees. Similar hamstring stretch to RDL. Strict neutral spine throughout.",
          },
        ],
      },
      {
        name: "Standing Calf Raise",
        type: "isolation",
        sets: 4,
        reps: "10–15",
        detail:
          "Gastrocnemius (straight-knee) emphasis. Full stretch at the bottom is critical — hold peak 1 sec. 3-second eccentric.",
        vars: [
          {
            name: "Leg Press Calf Raise",
            equip: "Leg Press Machine",
            desc: "High load with full ROM. Press through the balls of feet only. Excellent stretch at the bottom of every rep.",
          },
          {
            name: "Single-Leg Bodyweight Calf Raise",
            equip: "Bodyweight + Step",
            desc: "On a step edge for full ROM. Add weight in a backpack to progress. Stretch and squeeze fully every rep.",
          },
          {
            name: "Smith Machine Calf Raise",
            equip: "Smith Machine",
            desc: "Place a thick plate on floor under the balls of your feet. Bar provides stability for heavy loading. Same stretch cues apply.",
          },
        ],
      },
      {
        name: "Ab Wheel Rollout",
        type: "isolation",
        sets: 3,
        reps: "8–12",
        detail:
          "Highest rectus abdominis EMG of any exercise. Keep hips extended throughout — do not let the lower back collapse into extension.",
        vars: [
          {
            name: "Cable Crunch (Kneeling)",
            equip: "Cable Machine",
            desc: "Rope on high pulley. Crunch the rib cage toward the pelvis — not just bending at the hips. Allows progressive overload on abs.",
          },
          {
            name: "Dragon Flag",
            equip: "Flat Bench",
            desc: "Grip bench behind head, raise and lower body as a rigid plank. Extreme anti-extension core demand. Start with tuck version.",
          },
          {
            name: "Plank (Weighted / PPT)",
            equip: "Weight Plate",
            desc: "Apply posterior pelvic tilt (squeeze glutes, tuck tailbone). Place a plate on back. Superior TVA and lower-ab activation vs standard plank.",
          },
        ],
      },
    ],
  },
  d3: {
    label: "Thu · Pull",
    dayLabel: "Day 3 — Upper Body (Pull Focus)",
    dayType: "Pull",
    muscles: ["Lats", "Mid-Back", "Traps", "Biceps", "Rear Delts"],
    tip: "Drive elbows to hips, not your hands. Squeeze the back at peak contraction on every rep.",
    exercises: [
      {
        name: "Weighted Pull-Ups",
        type: "compound",
        sets: 4,
        reps: "5–10",
        detail:
          "Highest lat EMG of any exercise. Full dead hang at the bottom every rep. Add weight via belt when bodyweight becomes easy.",
        vars: [
          {
            name: "Lat Pulldown (Wide Grip)",
            equip: "Cable Machine",
            desc: "Identical muscle pattern. Pull to upper chest, slight backward lean. Best volume substitute for those building toward pull-ups.",
          },
          {
            name: "Assisted Pull-Up Machine",
            equip: "Machine",
            desc: "Gradually reduce the assistance week by week. The most direct way to build strength toward unassisted pull-ups.",
          },
          {
            name: "Resistance Band Assisted Pull-Up",
            equip: "Band + Pull-Up Bar",
            desc: "Loop band over bar and kneel or stand in it. Reduces the hardest portion of the lift (dead hang start) most.",
          },
        ],
      },
      {
        name: "Barbell Bent-Over Row",
        type: "compound",
        sets: 4,
        reps: "6–10",
        detail:
          "Unmatched for overall back thickness. Hinge 45°, hard brace, drive elbows toward ceiling. Bar contacts lower chest or upper abs.",
        vars: [
          {
            name: "Dumbbell Bent-Over Row",
            equip: "Dumbbells",
            desc: "Greater ROM per arm and easier on the lower back. Row to hip with full stretch at the bottom. One arm at a time for most focus.",
          },
          {
            name: "T-Bar Row",
            equip: "T-Bar Machine",
            desc: "Chest support option available to remove lower back fatigue. Heavy loading potential. Drive elbows back, not up.",
          },
          {
            name: "Seal Row (Chest-Supported Barbell)",
            equip: "Elevated Bench + Barbell",
            desc: "Lie prone on an elevated bench, barbell below. Fully removes lower back from the equation for true back isolation.",
          },
        ],
      },
      {
        name: "Chest-Supported Dumbbell Row",
        type: "compound",
        sets: 3,
        reps: "10–14",
        detail:
          "Removes lower back fatigue entirely. Lie prone on a 45° incline bench, let arms hang fully, row explosively to hips.",
        vars: [
          {
            name: "Machine Row (Chest Pad)",
            equip: "Plate-Loaded Row Machine",
            desc: "Seated with chest on pad. Constant tension. Adjust seat so arms are parallel to floor at full stretch.",
          },
          {
            name: "Incline Bench Cable Row",
            equip: "Cable Machine + Incline Bench",
            desc: "Lie on incline bench facing the cable stack. Pull handles to the sides of the torso. Great stretch and loaded contraction.",
          },
          {
            name: "Resistance Band Row",
            equip: "Resistance Bands",
            desc: "Anchor band at waist height, hinge forward, row to sides. Travel or home option. Focus entirely on scapular retraction.",
          },
        ],
      },
      {
        name: "Seated Cable Row (Neutral Grip)",
        type: "isolation",
        sets: 3,
        reps: "10–14",
        detail:
          "Constant tension through full ROM. Squeeze mid-back hard at contraction — pause 1 second. Don't lean back excessively.",
        vars: [
          {
            name: "Dumbbell Seal Row",
            equip: "Dumbbells + Flat Bench",
            desc: "Lie face-down on a bench elevated on blocks, row dumbbells. Full support removes lower-back and hip-flexor fatigue completely.",
          },
          {
            name: "Resistance Band Seated Row",
            equip: "Resistance Bands",
            desc: "Sit on the floor, band looped around feet. Pull to abdomen. Good travel option. Focus on squeezing the scapulae together.",
          },
          {
            name: "Meadows Row (Landmine)",
            equip: "Barbell + Landmine",
            desc: "Straddle one end of a barbell, row it with one arm. Exceptional lat stretch and strong loaded contraction position.",
          },
        ],
      },
      {
        name: "Barbell Curl",
        type: "isolation",
        sets: 3,
        reps: "8–12",
        detail:
          "Maximum loading for bicep mass. Fully supinate at the top (turn palms fully upward). Control the eccentric — don't drop it.",
        vars: [
          {
            name: "Dumbbell Hammer Curl",
            equip: "Dumbbells",
            desc: "Neutral grip hits brachialis and brachioradialis for total arm thickness. No supination at top — palms face each other throughout.",
          },
          {
            name: "Cable Curl (Low Pulley)",
            equip: "Cable Machine",
            desc: "Constant tension from the bottom position — dumbbells go slack at the bottom of the curl; cables don't. Use straight or EZ bar.",
          },
          {
            name: "Resistance Band Curl",
            equip: "Resistance Bands",
            desc: "Stand on the band, curl up. Tension increases through the movement — more overload at the contracted top position.",
          },
        ],
      },
      {
        name: "Rear Delt Fly (Cable or Dumbbell)",
        type: "isolation",
        sets: 3,
        reps: "12–16",
        detail:
          "Critical for shoulder health and posture. Hinge forward 45°, light weight, lead with elbows, hard squeeze at full range.",
        vars: [
          {
            name: "Face Pull (Cable Rope)",
            equip: "Cable Machine",
            desc: "Pull rope to face, flare elbows high. Hits rear delt, rotator cuff, and mid-trap together. Non-negotiable for long-term shoulder health.",
          },
          {
            name: "Reverse Pec Deck",
            equip: "Pec Deck Machine (reversed)",
            desc: "Sit facing the chest pad. Grab handles, fly backward with elbows high. Excellent guided rear delt isolation.",
          },
          {
            name: "Band Pull-Apart",
            equip: "Resistance Band",
            desc: "Hold band at shoulder width in front, pull apart to a T shape. High-rep finisher. Great for posture correction and shoulder health.",
          },
        ],
      },
    ],
  },
  d4: {
    label: "Fri · Hinge",
    dayLabel: "Day 4 — Lower Body (Hinge/Glute Focus)",
    dayType: "Hinge",
    muscles: ["Hamstrings", "Glutes", "Adductors", "Calves", "Core"],
    tip: "Hip thrust: squeeze hard at the top for 1–2 sec every rep. Log your weights — this day responds fast to progressive overload.",
    exercises: [
      {
        name: "Barbell Hip Thrust",
        type: "compound",
        sets: 4,
        reps: "8–12",
        detail:
          "Highest glute EMG of any exercise. Shoulders on bench, bar padded on hips. Squeeze glutes HARD at full extension for 1–2 sec.",
        vars: [
          {
            name: "Dumbbell Hip Thrust",
            equip: "Dumbbells",
            desc: "Dumbbell balanced on hips. Identical movement pattern. Easier to set up alone. Good for moderate loads without needing a barbell.",
          },
          {
            name: "Glute Bridge (Loaded)",
            equip: "Dumbbell / Barbell",
            desc: "No bench needed — flat on floor. Same hip-extension mechanics. Use a heavy dumbbell across the hips to load progressively.",
          },
          {
            name: "Cable Pull-Through",
            equip: "Cable Machine",
            desc: "Rope between legs, hinge forward then drive hips through. Constant glute tension. Great when bench or barbell is unavailable.",
          },
        ],
      },
      {
        name: "Sumo Deadlift",
        type: "compound",
        sets: 4,
        reps: "5–8",
        detail:
          "Wide stance maximises glute and adductor involvement. Chest tall, drive the floor away, lock hips completely through at the top.",
        vars: [
          {
            name: "Conventional Deadlift",
            equip: "Barbell",
            desc: "Narrower stance shifts emphasis slightly to hamstrings and erectors. Same hip-hinge — bar over mid-foot, drive floor away.",
          },
          {
            name: "Trap Bar / Hex Bar Deadlift",
            equip: "Trap Bar",
            desc: "Handles at your sides reduce lower back stress and add quad involvement. Great for back-sensitive lifters learning to deadlift heavy.",
          },
          {
            name: "Kettlebell Sumo Deadlift",
            equip: "Kettlebell",
            desc: "Wide stance, kettlebell between feet. Same mechanics as barbell version. Perfect form trainer at lighter loads. Easy to set up.",
          },
        ],
      },
      {
        name: "Lying Leg Curl",
        type: "isolation",
        sets: 3,
        reps: "10–14",
        detail:
          "True hamstring knee-flexion isolation. Curl to full range, then resist the eccentric slowly. Toes slightly pointed inward.",
        vars: [
          {
            name: "Seated Leg Curl Machine",
            equip: "Machine",
            desc: "Seated position increases hamstring stretch at the hip. Studies show slightly more activation than lying version for some individuals.",
          },
          {
            name: "Nordic Hamstring Curl",
            equip: "Partner / GHD Machine",
            desc: "Kneel, partner holds ankles, lower your torso toward floor by resisting with hamstrings. Extreme eccentric overload — use sparingly.",
          },
          {
            name: "Swiss Ball Hamstring Curl",
            equip: "Stability Ball",
            desc: "Lie on floor, heels on ball, bridge up then curl ball to glutes. Full bodyweight hamstring isolation. Progress to single-leg version.",
          },
        ],
      },
      {
        name: "Hack Squat (Narrow Stance)",
        type: "compound",
        sets: 3,
        reps: "10–15",
        detail:
          "Quad finisher to balance the hinge-heavy session. Narrow stance shifts load to the outer quad (vastus lateralis). Full depth.",
        vars: [
          {
            name: "Front Squat (Narrow Stance)",
            equip: "Barbell",
            desc: "Front rack position forces upright torso — extreme quad isolation. Narrow stance for VL emphasis. Use straps if needed for wrists.",
          },
          {
            name: "V-Squat Machine",
            equip: "V-Squat Machine",
            desc: "Similar to hack squat. Angled tracks reduce lower back loading. Narrow foot placement for quad emphasis.",
          },
          {
            name: "Goblet Squat (Narrow Stance)",
            equip: "Dumbbell / Kettlebell",
            desc: "Feet close together with weight at chest. Upright torso naturally emphasises quads. Slow descent for time-under-tension.",
          },
        ],
      },
      {
        name: "Seated Calf Raise",
        type: "isolation",
        sets: 4,
        reps: "12–20",
        detail:
          "Soleus emphasis — only achieved with the knee BENT. Slow full ROM. Undertrained by most lifters — critical for complete calf development.",
        vars: [
          {
            name: "Banded Seated Calf Raise",
            equip: "Resistance Bands",
            desc: "Loop band over thighs anchored to a low point. Mimics machine resistance while sitting on a flat bench. Full ROM still applies.",
          },
          {
            name: "Leg Press Calf Raise (Toes Only)",
            equip: "Leg Press Machine",
            desc: "Sit lower on the pad so only the balls of feet are on the plate. Bent-knee position mimics seated calf raise — targets soleus.",
          },
          {
            name: "Smith Machine Seated Calf Raise",
            equip: "Smith Machine",
            desc: "Sit on a bench under the bar, place a plate under balls of feet. Bar rests on padded thighs. Allows heavy progressive overload.",
          },
        ],
      },
      {
        name: "Hanging Leg Raise",
        type: "isolation",
        sets: 3,
        reps: "10–15",
        detail:
          "Lower abs and hip flexors. Zero swinging — dead control throughout. Posterior pelvic tilt at the very top is the key cue.",
        vars: [
          {
            name: "Captain's Chair Leg Raise",
            equip: "Captain's Chair / Dip Station",
            desc: "Elbows supported on arm pads. Easier to control body position than a dead hang. Identical leg raise mechanics.",
          },
          {
            name: "Decline Bench Sit-Up",
            equip: "Decline Bench",
            desc: "Heels hooked, lower torso back fully, crunch up. Progressive angle adjustment increases difficulty. Full ROM every rep.",
          },
          {
            name: "Reverse Crunch (Flat Bench)",
            equip: "Flat Bench",
            desc: "Lie on bench, grip edge behind head, raise knees to chest then curl hips off the bench. Pure lower-ab contraction focus.",
          },
        ],
      },
    ],
  },
};

export const DAY_COLORS: Record<DayKey, {
  primary: string;
  light: string;
  tag: string;
  tagText: string;
}> = {
  d1: { primary: "#534AB7", light: "#EEEDFE", tag: "#CECBF6", tagText: "#26215C" },
  d2: { primary: "#0F6E56", light: "#E1F5EE", tag: "#9FE1CB", tagText: "#04342C" },
  d3: { primary: "#993C1D", light: "#FAECE7", tag: "#F5C4B3", tagText: "#4A1B0C" },
  d4: { primary: "#854F0B", light: "#FAEEDA", tag: "#FAC775", tagText: "#412402" },
};

export const SCHEDULE = [
  { id: "d1", label: "Mon", sub: "Push", isRest: false },
  { id: "d2", label: "Tue", sub: "Quad", isRest: false },
  { id: "wed", label: "Wed", sub: "Rest", isRest: true, restIcon: "🔄", restTitle: "Active Recovery", restTip: "Light walk, stretching, or mobility work. Keep heart rate below 120 bpm." },
  { id: "d3", label: "Thu", sub: "Pull", isRest: false },
  { id: "d4", label: "Fri", sub: "Hinge", isRest: false },
  { id: "sat", label: "Sat", sub: "Rest", isRest: true, restIcon: "😴", restTitle: "Full Rest", restTip: "Prioritise 7–9 hours of sleep. Growth hormone peaks during deep sleep." },
  { id: "sun", label: "Sun", sub: "Rest", isRest: true, restIcon: "🥗", restTitle: "Full Rest", restTip: "Hydrate, hit your protein target (1.6–2.2 g/kg bodyweight), and prep meals for the week ahead." },
];
