"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Theme Database ───────────────────────────────────────────────────────────

type FocusKey =
  | "hip-openers"
  | "backbends"
  | "core"
  | "balance"
  | "inversions"
  | "twists";

type MoodKey = "energizing" | "calming" | "balancing" | "playful";

interface ThemeEntry {
  titles: string[];
  intentions: string[];
  peaks: string[];
}

type ThemeDB = {
  [classType: string]: {
    [mood in MoodKey]?: {
      [focus in FocusKey]?: ThemeEntry;
    };
  };
};

const THEMES: ThemeDB = {
  vinyasa: {
    energizing: {
      "hip-openers": {
        titles: ["Fire in the Hips", "Liberation Flow", "Opening New Pathways"],
        intentions: [
          "Release what no longer serves you",
          "Create space for new possibilities",
          "Unlock stored emotions through movement",
        ],
        peaks: ["Lizard Pose", "Pigeon Pose", "Fire Log Pose", "Frog Pose"],
      },
      backbends: {
        titles: [
          "Heart Wide Open",
          "Rise & Shine Flow",
          "Courage & Vulnerability",
        ],
        intentions: [
          "Open your heart to possibilities",
          "Embrace vulnerability as strength",
          "Lead with love and courage",
        ],
        peaks: ["Wheel Pose", "Camel Pose", "Wild Thing", "King Dancer"],
      },
      core: {
        titles: ["Inner Fire", "Power from Within", "Ignite Your Center"],
        intentions: [
          "Connect to your personal power",
          "Build strength from your core",
          "Cultivate inner stability",
        ],
        peaks: [
          "Boat Pose",
          "Side Plank Variations",
          "Crow Pose",
          "Flying Pigeon",
        ],
      },
      balance: {
        titles: [
          "Finding Center",
          "Steady & Strong",
          "Grace Under Pressure",
        ],
        intentions: [
          "Cultivate steadiness in body and mind",
          "Find your center amidst chaos",
          "Balance effort and ease",
        ],
        peaks: ["Tree Pose", "Warrior III", "Half Moon", "Standing Split"],
      },
      inversions: {
        titles: [
          "Turn It Upside Down",
          "New Perspectives",
          "Elevate Your Practice",
        ],
        intentions: [
          "Shift your perspective and see the world anew",
          "Build courage and trust in yourself",
          "Discover your strength through challenge",
        ],
        peaks: [
          "Headstand",
          "Handstand Prep",
          "Forearm Stand",
          "Supported Shoulderstand",
        ],
      },
      twists: {
        titles: ["Wring It Out", "Detox & Renew", "Twist & Shine"],
        intentions: [
          "Release what no longer serves you",
          "Create space for fresh energy",
          "Cleanse body and mind",
        ],
        peaks: [
          "Revolved Chair",
          "Revolved Triangle",
          "Seated Spinal Twist",
          "Bird of Paradise",
        ],
      },
    },
    calming: {
      "hip-openers": {
        titles: [
          "Melt & Release",
          "Surrender to Stillness",
          "Gentle Liberation",
        ],
        intentions: [
          "Surrender to the present moment",
          "Release tension with each breath",
          "Find peace in stillness",
        ],
        peaks: [
          "Supported Pigeon",
          "Reclined Butterfly",
          "Lizard on Blocks",
          "Happy Baby",
        ],
      },
      backbends: {
        titles: [
          "Open Your Heart Gently",
          "Soften & Receive",
          "Heart Unfolding",
        ],
        intentions: [
          "Gently open to receive love and light",
          "Soften the armor around your heart",
          "Receive the gifts of the present moment",
        ],
        peaks: [
          "Supported Bridge",
          "Fish Pose",
          "Sphinx Pose",
          "Gentle Camel",
        ],
      },
      core: {
        titles: ["Steady Ground", "Quiet Strength", "The Calm Center"],
        intentions: [
          "Find stability and quiet strength",
          "Build a foundation of calm",
          "Center yourself in strength",
        ],
        peaks: [
          "Slow Boat Pose",
          "Supported Plank",
          "Core Meditation",
          "Child Pose Core Engagement",
        ],
      },
      balance: {
        titles: ["Rooted & Present", "Standing in Peace", "Still Waters"],
        intentions: [
          "Root down to rise up with ease",
          "Find stillness in the midst of movement",
          "Peace begins with balance",
        ],
        peaks: [
          "Supported Tree",
          "Warrior III with Block",
          "Eagle Pose",
          "Mountain Stillness",
        ],
      },
      inversions: {
        titles: [
          "Legs Up the Wall",
          "Restorative Inversion",
          "Gentle Flip",
        ],
        intentions: [
          "Restore through gentle inversion",
          "Let gravity do the work",
          "Renew your energy through rest",
        ],
        peaks: [
          "Legs Up Wall",
          "Supported Shoulderstand",
          "Plow on Chair",
          "Waterfall Pose",
        ],
      },
      twists: {
        titles: ["Gentle Release", "Soft Cleanse", "Breathe & Turn"],
        intentions: [
          "Gently cleanse your body and mind",
          "Release tension with soft twists",
          "Find ease in turning inward",
        ],
        peaks: [
          "Supine Twist",
          "Seated Easy Twist",
          "Prone Twist",
          "Reclined Spinal Twist",
        ],
      },
    },
    balancing: {
      "hip-openers": {
        titles: [
          "Finding Harmony",
          "Balanced Liberation",
          "The Middle Path",
        ],
        intentions: [
          "Find harmony between effort and ease",
          "Balance opening with grounding",
          "Walk the middle path with grace",
        ],
        peaks: [
          "Warrior II into Pigeon",
          "Low Lunge Flow",
          "Half Moon Hip Focus",
          "Figure Four",
        ],
      },
      backbends: {
        titles: [
          "Balanced Openness",
          "Courage & Ease",
          "The Balanced Heart",
        ],
        intentions: [
          "Balance courage with gentleness",
          "Open your heart while staying grounded",
          "Find the balance between strength and surrender",
        ],
        peaks: [
          "Upward Dog",
          "Cobra to Wheel",
          "Bridge with Blocks",
          "Camel with Support",
        ],
      },
      core: {
        titles: [
          "Strong Center, Open Mind",
          "Balanced Power",
          "The Grounded Core",
        ],
        intentions: [
          "Strength without rigidity",
          "Power balanced with softness",
          "Find your core stability",
        ],
        peaks: [
          "Side Plank to Wild Thing",
          "Navasana Flow",
          "Plank Variations",
          "Core Balance Poses",
        ],
      },
      balance: {
        titles: [
          "The Perfect Balance",
          "Equilibrium Flow",
          "Center of Gravity",
        ],
        intentions: [
          "Discover your center of gravity",
          "Balance effort and surrender",
          "Find steadiness in all transitions",
        ],
        peaks: [
          "Dancer Pose",
          "Extended Hand to Toe",
          "Warrior III to Half Moon",
          "Revolved Half Moon",
        ],
      },
      inversions: {
        titles: [
          "Finding Your Ground Upside Down",
          "Balanced Inversions",
          "Upside Down Balance",
        ],
        intentions: [
          "Find balance in unexpected places",
          "Trust the process of turning inward",
          "Stability exists even upside down",
        ],
        peaks: [
          "Dolphin to Forearm Stand",
          "Headstand Balance",
          "Tripod to Balance",
          "L-Shape at Wall",
        ],
      },
      twists: {
        titles: [
          "Twist & Balance",
          "Rotational Harmony",
          "Balanced Cleanse",
        ],
        intentions: [
          "Find balance through rotation",
          "Harmony comes from releasing",
          "Balance front and back body through twists",
        ],
        peaks: [
          "Revolved Triangle Balance",
          "Twisted Chair",
          "Twisting Lunge",
          "Revolving Dancer",
        ],
      },
    },
    playful: {
      "hip-openers": {
        titles: ["Hip Hop Yoga", "The Hip Playground", "Silly Hips"],
        intentions: [
          "Bring joy and lightness to your practice",
          "Play like a child again",
          "Move without judgment",
        ],
        peaks: [
          "Fire Hydrant",
          "Happy Baby Variations",
          "Frog Jumps",
          "Dancing Warrior",
        ],
      },
      backbends: {
        titles: ["Wild Thing Vibe", "Heart Explosion", "Joyful Opening"],
        intentions: [
          "Let your heart lead with joy",
          "Backbend like nobody is watching",
          "Open your heart to fun",
        ],
        peaks: [
          "Wild Thing",
          "Wheel Variations",
          "Exuberant Camel",
          "Playful Dancer",
        ],
      },
      core: {
        titles: ["Core Games", "Playful Power", "The Core Playground"],
        intentions: [
          "Build strength through play",
          "Challenge yourself with a smile",
          "Shake what your mama gave you",
        ],
        peaks: [
          "Crow Hops",
          "Boat Pose Games",
          "Plank Challenges",
          "Arm Balance Attempts",
        ],
      },
      balance: {
        titles: ["The Balance Game", "Wobble & Win", "Falls Are Part of the Practice"],
        intentions: [
          "Embrace falling as part of growth",
          "Balance is a practice not a destination",
          "Laugh at the wobbles",
        ],
        peaks: [
          "Tree Pose Games",
          "Partner Balance",
          "Balance Challenge Flow",
          "One-legged Adventures",
        ],
      },
      inversions: {
        titles: ["Flip It Good", "Upside Down Fun", "Inversion Party"],
        intentions: [
          "See the world from a different angle",
          "Inversions are just fun upside-down shapes",
          "Be bold, go upside down",
        ],
        peaks: [
          "Handstand Kick Ups",
          "Headstand Experiments",
          "Cartwheel Variations",
          "Acro Play",
        ],
      },
      twists: {
        titles: [
          "Twist Party",
          "Wringing It Out with Smiles",
          "The Fun Cleanse",
        ],
        intentions: [
          "Cleanse your body and soul with laughter",
          "Find joy in the wringing out",
          "Twist it like you mean it",
        ],
        peaks: [
          "Twisted Crow",
          "Fun Revolved Poses",
          "Laughter Yoga Twists",
          "Party Pretzels",
        ],
      },
    },
  },
  hatha: {
    energizing: {
      "hip-openers": {
        titles: ["Roots & Wings", "Hatha Liberation", "Earth & Sky Hips"],
        intentions: ["Ground into the earth, open to the sky", "Steady progress over perfection"],
        peaks: ["Warrior I", "Low Crescent Lunge", "Pigeon Pose"],
      },
      backbends: {
        titles: ["Rise with the Sun", "Hatha Heart", "Classic Opening"],
        intentions: ["Greet the day with an open heart", "Classic poses, timeless wisdom"],
        peaks: ["Cobra", "Upward Dog", "Bridge Pose"],
      },
      core: {
        titles: ["Foundation First", "Hatha Power", "Core Roots"],
        intentions: ["Strength built from the ground up", "Stability is the foundation of freedom"],
        peaks: ["Boat Pose", "Plank", "Side Plank"],
      },
      balance: {
        titles: ["Hatha Stillness", "Classic Balance", "Rooted & Tall"],
        intentions: ["Classic poses build timeless steadiness", "Stillness in motion"],
        peaks: ["Tree Pose", "Warrior III", "Eagle Pose"],
      },
      inversions: {
        titles: ["Classic Inversions", "Turn It Around", "Hatha Perspective"],
        intentions: ["Time-tested poses for a fresh view", "The classics never fail"],
        peaks: ["Shoulder Stand", "Plow Pose", "Fish Pose"],
      },
      twists: {
        titles: ["Classic Cleanse", "Hatha Twist", "Purify & Renew"],
        intentions: ["Cleanse through time-honored movement", "Twist back to center"],
        peaks: ["Half Lord of Fishes", "Seated Spinal Twist", "Revolved Triangle"],
      },
    },
    calming: {
      "hip-openers": {
        titles: ["Slow & Steady", "Hatha Ease", "Patient Opening"],
        intentions: ["Patience is the gateway to depth", "Slow down, open up"],
        peaks: ["Supported Pigeon", "Butterfly", "Reclined Hero"],
      },
      backbends: {
        titles: ["Gentle Sunrise", "Tender Opening", "Soft Heart"],
        intentions: ["Open gently, like a flower at dawn", "Tenderness is strength"],
        peaks: ["Sphinx", "Supported Bridge", "Baby Cobra"],
      },
      core: {
        titles: ["Steady Earth", "Quiet Center", "Gentle Roots"],
        intentions: ["Stability without strain", "Calm strength from within"],
        peaks: ["Supported Plank", "Gentle Boat", "Low Bridge"],
      },
      balance: {
        titles: ["Peaceful Stillness", "Hatha Rest", "Grounded Calm"],
        intentions: ["Stillness is the ultimate balance", "Peace is a practice"],
        peaks: ["Mountain Pose", "Tree with Eyes Closed", "Grounded Warrior"],
      },
      inversions: {
        titles: ["Rest & Restore", "Gentle Inversion", "Legs Up"],
        intentions: ["Rest is productive", "Restore through gentle reversal"],
        peaks: ["Legs Up the Wall", "Supported Shoulderstand", "Gentle Plow"],
      },
      twists: {
        titles: ["Gentle Spiral", "Soft Release", "Hatha Unwind"],
        intentions: ["Gently unwind the day", "Soft twists, deep release"],
        peaks: ["Supine Twist", "Easy Seated Twist", "Reclined Spinal Twist"],
      },
    },
    balancing: {
      "hip-openers": {
        titles: ["Classic Harmony", "Hatha Balance", "Hip Equilibrium"],
        intentions: ["Balance through classic movement", "Harmony in all directions"],
        peaks: ["Warrior II", "Triangle Pose", "Half Moon"],
      },
      backbends: {
        titles: ["Heart Balance", "Open & Grounded", "Hatha Equanimity"],
        intentions: ["Strength and softness in equal measure", "Balance the front and back body"],
        peaks: ["Cobra to Upward Dog", "Bridge Variations", "Low Camel"],
      },
      core: {
        titles: ["Centered Hatha", "Balance & Strength", "Core Equanimity"],
        intentions: ["Centered strength serves everyone", "Core stability creates space"],
        peaks: ["Plank to Side Plank", "Boat Variations", "Warrior III Core"],
      },
      balance: {
        titles: ["The Balanced Hatha", "Middle Way Balance", "Hatha Equilibrium"],
        intentions: ["The middle way is the wise way", "Balance in all aspects of practice"],
        peaks: ["Natarajasana", "Warrior III", "Extended Hand to Toe"],
      },
      inversions: {
        titles: ["Balanced View", "Hatha Perspective", "Equal and Opposite"],
        intentions: ["Different angles reveal different truths", "Balance above and below"],
        peaks: ["Shoulder Stand Balance", "Supported Headstand", "Plow Balance"],
      },
      twists: {
        titles: ["Rotational Balance", "Twist to Center", "Balanced Spiral"],
        intentions: ["Find your center through rotation", "Twisting restores balance"],
        peaks: ["Revolved Triangle", "Twisted Chair", "Parsvakonasana"],
      },
    },
    playful: {
      "hip-openers": {
        titles: ["Happy Hatha Hips", "Hip Play", "Funky Foundations"],
        intentions: ["Classics are more fun than you think", "Play within structure"],
        peaks: ["Frog Pose", "Lizard Variations", "Happy Baby"],
      },
      backbends: {
        titles: ["Joyful Opening", "Playful Heart", "Classic with a Twist"],
        intentions: ["Classics done with a smile feel brand new", "Joy opens more than effort"],
        peaks: ["Wheel Attempt", "Wild Thing", "Dancing Warrior"],
      },
      core: {
        titles: ["Fun Foundations", "Playful Stability", "Core Giggles"],
        intentions: ["Strong core, light heart", "Build strength through joy"],
        peaks: ["Crow Attempts", "Plank Games", "Wobble Warrior"],
      },
      balance: {
        titles: ["Hatha Wobblers", "Classic Balance Reimagined", "Tipping Over with Grace"],
        intentions: ["Fall with grace, rise with laughter", "Balance is the ultimate game"],
        peaks: ["Tree Variations", "One-Legged Mountain", "Playful Eagle"],
      },
      inversions: {
        titles: ["Upside Down Classics", "Hatha Flip", "Classic Head Down"],
        intentions: ["Old poses, fresh perspective", "Turn tradition on its head"],
        peaks: ["Wall Handstand", "Playful Plow", "Shoulderstand Shapes"],
      },
      twists: {
        titles: ["Silly Spirals", "Playful Cleanse", "Fun Hatha Twists"],
        intentions: ["Cleanse your practice of seriousness", "Twist with a smile"],
        peaks: ["Seated Twist Dance", "Revolved Warrior Play", "Fun Twisting Flow"],
      },
    },
  },
  yin: {
    energizing: {
      "hip-openers": {
        titles: ["Deep Release Awakening", "Yin Hip Revival", "Long Hold Liberation"],
        intentions: ["Patient opening creates lasting change", "Time reveals what force cannot"],
        peaks: ["Dragon Pose (3 min)", "Sleeping Swan", "Frog (5 min)"],
      },
      backbends: {
        titles: ["Slow Heart Opening", "Yin Backbend", "The Long Surrender"],
        intentions: ["The longest held poses open the deepest layers", "Patience is power"],
        peaks: ["Sphinx (5 min)", "Seal Pose", "Caterpillar"],
      },
      core: {
        titles: ["Yin Awakening", "Slow Core", "Patient Strength"],
        intentions: ["Stillness builds the deepest strength", "Yin energy fuels yang movement"],
        peaks: ["Supported Bridge (4 min)", "Boat Hold", "Child Pose Core"],
      },
      balance: {
        titles: ["Yin Foundation", "Still Balance", "Rooted Yin"],
        intentions: ["Root down deep before rising up", "Long holds build balance from within"],
        peaks: ["Supported Dragon", "Long Warrior", "Yin Tree"],
      },
      inversions: {
        titles: ["Yin Inversion", "Restful Flip", "Long Hold Upside Down"],
        intentions: ["Slow inversions restore deeply", "Time upside down resets the system"],
        peaks: ["Legs Up Wall (10 min)", "Supported Shoulderstand", "Waterfall"],
      },
      twists: {
        titles: ["Deep Yin Twist", "Long Hold Spiral", "Patient Cleanse"],
        intentions: ["Long holds wring out what quick twists miss", "Patient rotation heals deeply"],
        peaks: ["Twisted Roots (4 min)", "Supported Twist", "Yin Shoelace Twist"],
      },
    },
    calming: {
      "hip-openers": {
        titles: ["Surrender Flow", "Deep Yin Rest", "Yielding to Gravity"],
        intentions: ["Yield, don't push — gravity is your teacher", "Rest in the opening"],
        peaks: ["Sleeping Swan (5 min)", "Reclined Butterfly (5 min)", "Supported Child"],
      },
      backbends: {
        titles: ["Heart Melting", "Chest Opener Rest", "The Great Exhale"],
        intentions: ["Exhale all the way into openness", "The exhale is the heart's gift"],
        peaks: ["Supported Fish", "Melting Heart", "Supported Sphinx"],
      },
      core: {
        titles: ["Yin Rest", "Still Center", "The Quiet Core"],
        intentions: ["Rest is not passive — it is receptive", "Stillness is its own kind of strength"],
        peaks: ["Extended Child (5 min)", "Supported Bridge", "Savasana Core"],
      },
      balance: {
        titles: ["Long Balance", "Yin Rooting", "Deep Stillness"],
        intentions: ["True balance is found in stillness", "Root into the earth for minutes, not seconds"],
        peaks: ["Extended Mountain", "Long Hold Tree", "Yin Eagle"],
      },
      inversions: {
        titles: ["Deep Rest Inversion", "Yin Waterfall", "Legs Up for Life"],
        intentions: ["The body heals in stillness and inversion", "Let go and let gravity"],
        peaks: ["Legs Up Wall (15 min)", "Yin Shoulderstand", "Reclined Elevated Legs"],
      },
      twists: {
        titles: ["Yin Unwind", "Slow Spiral", "The Long Release"],
        intentions: ["Long holds unwind what years of tension built", "Trust the slow release"],
        peaks: ["Supine Twist (5 min each)", "Long Seated Twist", "Supported Crocodile"],
      },
    },
    balancing: {
      "hip-openers": { titles: ["Yin Harmony", "Balance of Stillness"], intentions: ["Balance found in stillness"], peaks: ["Swan", "Butterfly", "Dragon"] },
      backbends: { titles: ["Balanced Opening", "Yin Heart Balance"], intentions: ["Open with balance"], peaks: ["Sphinx", "Seal", "Supported Fish"] },
      core: { titles: ["Yin Core Balance"], intentions: ["Stillness builds balance"], peaks: ["Supported Bridge", "Child", "Caterpillar"] },
      balance: { titles: ["Yin Equilibrium"], intentions: ["Long holds reveal true balance"], peaks: ["Supported Tree", "Long Mountain", "Yin Warrior"] },
      inversions: { titles: ["Balanced Rest Inversion"], intentions: ["Balance through stillness upside down"], peaks: ["Legs Up Wall", "Supported Inversion"] },
      twists: { titles: ["Balanced Yin Twist"], intentions: ["Rotation restores balance"], peaks: ["Supine Twist", "Shoelace Twist"] },
    },
    playful: {
      "hip-openers": { titles: ["Yin Play", "Slow & Silly"], intentions: ["Even stillness can be playful"], peaks: ["Dragon Variations", "Happy Baby Extended", "Frog Play"] },
      backbends: { titles: ["Yin Heart Play", "Slow Backbend Fun"], intentions: ["Playfulness softens the body"], peaks: ["Melting Heart", "Sphinx Variations"] },
      core: { titles: ["Playful Stillness"], intentions: ["Hold poses with a playful mind"], peaks: ["Boat Hold", "Extended Child Variations"] },
      balance: { titles: ["Slow Balance Fun"], intentions: ["Long holds are secretly playful"], peaks: ["Tree in Yin", "Long Warrior Variations"] },
      inversions: { titles: ["Playful Yin Inversions"], intentions: ["Rest can be playful too"], peaks: ["Legs Up Wall Shapes", "Waterfall Variations"] },
      twists: { titles: ["Yin Twist Play"], intentions: ["Find humor in the long hold"], peaks: ["Twisted Roots", "Supported Revolved Child"] },
    },
  },
  restorative: {
    energizing: {
      "hip-openers": { titles: ["Supported Awakening", "Restorative Revival"], intentions: ["Rest is the source of energy"], peaks: ["Supported Reclined Butterfly", "Supported Pigeon", "Bolster Child"] },
      backbends: { titles: ["Heart Opening Restore"], intentions: ["Open from a place of rest"], peaks: ["Supported Fish", "Bolster Backbend", "Supported Bridge"] },
      core: { titles: ["Rest to Restore Energy"], intentions: ["Energy comes from stillness"], peaks: ["Supported Bridge", "Child with Bolster"] },
      balance: { titles: ["Restoring Balance"], intentions: ["Balance is restored in rest"], peaks: ["Supported Savasana", "Bolster Twist"] },
      inversions: { titles: ["Restorative Legs Up"], intentions: ["Inversions restore vitality"], peaks: ["Legs Up Wall", "Supported Shoulderstand"] },
      twists: { titles: ["Restore & Release"], intentions: ["Gentle twists restore energy flow"], peaks: ["Bolster Twist", "Supported Revolved Pose"] },
    },
    calming: {
      "hip-openers": { titles: ["The Great Rest", "Restore & Release"], intentions: ["Rest is the deepest healing", "Full surrender heals completely"], peaks: ["Supported Butterfly (10 min)", "Bolster Pigeon", "Reclined Child"] },
      backbends: { titles: ["Heart at Rest", "Supported Opening", "Bolster Backbend"], intentions: ["The heart opens fully when supported", "Receive without effort"], peaks: ["Supported Fish (8 min)", "Bolster Chest Opener", "Reclined Supported Backbend"] },
      core: { titles: ["Supported Center", "Rest Your Core"], intentions: ["The core rests, the nervous system heals"], peaks: ["Supported Savasana", "Bolster Under Knees", "Extended Child"] },
      balance: { titles: ["Rest in Balance"], intentions: ["Balance is restored in stillness"], peaks: ["Supported Savasana", "Elevated Supine", "Bolster Side Lying"] },
      inversions: { titles: ["Restorative Inversion", "Legs Up Rest", "The Ultimate Restore"], intentions: ["Legs up is medicine for modern life"], peaks: ["Legs Up Wall (20 min)", "Supported Bridge Inversion", "Bolster Under Hips"] },
      twists: { titles: ["Restore Through Rotation", "Restorative Twist"], intentions: ["Supported twists heal the spine"], peaks: ["Bolster Twist (8 min each)", "Supported Revolved Child", "Reclined Twist with Bolster"] },
    },
    balancing: {
      "hip-openers": { titles: ["Balanced Rest"], intentions: ["Rest creates balance"], peaks: ["Supported Butterfly", "Bolster Hip Opener"] },
      backbends: { titles: ["Restoring Heart Balance"], intentions: ["Support opens the heart"], peaks: ["Supported Fish", "Bolster Backbend"] },
      core: { titles: ["Supported Core Balance"], intentions: ["Rest the core, restore balance"], peaks: ["Supported Savasana", "Child with Bolster"] },
      balance: { titles: ["Restorative Equilibrium"], intentions: ["Balance through supported rest"], peaks: ["Supported Savasana", "Elevated Supine"] },
      inversions: { titles: ["Rest Upside Down"], intentions: ["Supported inversions balance energy"], peaks: ["Legs Up Wall", "Elevated Hips"] },
      twists: { titles: ["Restore Through Twist"], intentions: ["Gentle supported rotation restores"], peaks: ["Bolster Twist", "Supported Revolved Child"] },
    },
    playful: {
      "hip-openers": { titles: ["Restorative Play"], intentions: ["Rest can be joyful"], peaks: ["Supported Butterfly Fun", "Bolster Hip Play"] },
      backbends: { titles: ["Playful Restore"], intentions: ["Find delight in supported shapes"], peaks: ["Bolster Backbend Shapes", "Fish Variations"] },
      core: { titles: ["Cozy Core Play"], intentions: ["Comfortable is creative"], peaks: ["Bolster Shapes", "Supported Child Variations"] },
      balance: { titles: ["Restful Balance Play"], intentions: ["Play in stillness"], peaks: ["Supported Shapes Play", "Bolster Experiments"] },
      inversions: { titles: ["Playful Legs Up"], intentions: ["Inversions can be silly too"], peaks: ["Legs Up Wall Variations", "Bolster Under Hips Shapes"] },
      twists: { titles: ["Cozy Twist Play"], intentions: ["Comfortable twists, playful mind"], peaks: ["Bolster Twist Variations", "Supported Spiral Play"] },
    },
  },
  power: {
    energizing: {
      "hip-openers": { titles: ["Power Hip Ignition", "Hip Fire Power", "Unleash the Hips"], intentions: ["Ignite power from your hips", "Strength and flexibility unite"], peaks: ["Flying Pigeon", "Fallen Triangle", "Compass Pose", "Grasshopper"] },
      backbends: { titles: ["Power Heart Open", "Strong Back Strong Heart", "Fierce Opening"], intentions: ["Power comes from an open heart", "Strength and openness are one"], peaks: ["Wheel Variations", "Standing Backbend", "Dancer King Full Bind"] },
      core: { titles: ["Power Core Ignition", "Core on Fire", "Fierce Center"], intentions: ["Ignite your core, ignite your life", "Power lives in your center"], peaks: ["Handstand", "Forearm Stand", "L-Sit", "Dragonfly"] },
      balance: { titles: ["Power Balance", "Strong & Still", "Fierce Equilibrium"], intentions: ["Fierce balance demands total presence", "Power requires precision"], peaks: ["Warrior III to Standing Split", "Revolved Half Moon", "Flying Warrior"] },
      inversions: { titles: ["Power Inversions", "Fierce Upside Down", "Strength Inverted"], intentions: ["True strength is tested upside down", "Power knows no orientation"], peaks: ["Handstand", "Forearm Stand", "Headstand with Splits", "Titibasana"] },
      twists: { titles: ["Power Spiral", "Fierce Cleanse", "Twisted Power"], intentions: ["Power flows through rotation", "Cleanse with intensity"], peaks: ["Twisted Chair Jump", "Revolved Bird of Paradise", "Powerful Parsvakonasana"] },
    },
    calming: {
      "hip-openers": { titles: ["Strong Release", "Power Down", "After the Fire"], intentions: ["Power knows when to rest", "Strength includes surrendering"], peaks: ["Pigeon After Flow", "Lizard Cool Down", "Reclined Fire Log"] },
      backbends: { titles: ["Cool Down Opening", "Power Heart Rest"], intentions: ["The strong heart knows how to rest"], peaks: ["Sphinx After Practice", "Supported Bridge", "Gentle Camel"] },
      core: { titles: ["Core Cool Down", "After the Fire"], intentions: ["Restore your core after the fire"], peaks: ["Gentle Boat", "Supported Plank", "Child Rest"] },
      balance: { titles: ["Power Rest", "Still After Storm"], intentions: ["Power rests in stillness"], peaks: ["Mountain After Practice", "Supported Tree", "Grounded Warrior"] },
      inversions: { titles: ["Restore After Power"], intentions: ["Rest the system after intensity"], peaks: ["Legs Up Wall", "Supported Shoulderstand", "Cool Down Inversion"] },
      twists: { titles: ["Power Wind Down", "After Burn Twist"], intentions: ["Cleanse the effort from the muscles"], peaks: ["Supine Twist Cool Down", "Seated Cool Down Twist"] },
    },
    balancing: {
      "hip-openers": { titles: ["Balanced Power Hips"], intentions: ["Power and release in equal measure"], peaks: ["Warrior II to Pigeon", "Power Lunge Flow"] },
      backbends: { titles: ["Balanced Power Opening"], intentions: ["Strength with grace"], peaks: ["Upward Dog Variations", "Power Bridge to Wheel"] },
      core: { titles: ["Balanced Power Core"], intentions: ["Power balanced with ease"], peaks: ["Core Flow", "Plank to Wild Thing"] },
      balance: { titles: ["Power Equilibrium"], intentions: ["True power includes perfect balance"], peaks: ["Warrior III Power", "Revolved Half Moon"] },
      inversions: { titles: ["Balanced Power Inversions"], intentions: ["Balance your power upside down"], peaks: ["Forearm Stand Balance", "Handstand Holds"] },
      twists: { titles: ["Power Rotation Balance"], intentions: ["Twist with power and control"], peaks: ["Revolved Poses Power Flow", "Twisted Warrior"] },
    },
    playful: {
      "hip-openers": { titles: ["Power Hip Play", "Wild Hip Power"], intentions: ["Power and play are perfect partners"], peaks: ["Grasshopper", "Compass Play", "Flying Pigeon Hops"] },
      backbends: { titles: ["Wild Backbend Play", "Power Heart Fun"], intentions: ["Unleash your heart with power and joy"], peaks: ["Wild Thing", "Wheel Variations", "Acro Backbend"] },
      core: { titles: ["Core Party", "Power Play Center"], intentions: ["Build power through joy"], peaks: ["Arm Balance Attempts", "Crow Hops", "Handstand Wall Play"] },
      balance: { titles: ["Power Balance Games", "Challenge Accepted"], intentions: ["Power balance is the ultimate game"], peaks: ["Handstand Hops", "One-Arm Balance", "Partner Power Poses"] },
      inversions: { titles: ["Power Inversion Party", "Upside Down Strong"], intentions: ["Inversions are just power upside down"], peaks: ["Handstand Games", "Forearm Stand Play", "Acro Inversions"] },
      twists: { titles: ["Twisted Power Play"], intentions: ["Twist with power and laughter"], peaks: ["Revolved Crow", "Twisted Flying Pigeon", "Power Spiral Play"] },
    },
  },
  gentle: {
    energizing: {
      "hip-openers": { titles: ["Gentle Awakening", "Easy Opening", "Accessible Liberation"], intentions: ["Every body can open, at its own pace", "Gentle movement creates lasting change"], peaks: ["Supported Pigeon", "Chair Pigeon", "Easy Lunge"] },
      backbends: { titles: ["Gentle Heart Rise", "Easy Opening", "Accessible Backbend"], intentions: ["Open gently, open fully", "The gentlest path is often the deepest"], peaks: ["Baby Cobra", "Sphinx", "Chair Backbend"] },
      core: { titles: ["Gentle Strength", "Easy Core", "Accessible Power"], intentions: ["Gentle strength is still strength", "Every small effort builds a strong center"], peaks: ["Supported Boat", "Gentle Plank", "Modified Boat"] },
      balance: { titles: ["Gentle Steadiness", "Easy Balance", "Supported Standing"], intentions: ["Steadiness grows with practice", "Every wobble is a teacher"], peaks: ["Chair Tree Pose", "Supported Warrior III", "Wall Balance"] },
      inversions: { titles: ["Gentle Legs Up", "Easy Inversion", "Accessible Flip"], intentions: ["Everyone deserves the benefits of inversions", "Gentle reversal renews energy"], peaks: ["Legs Up Wall", "Supported Bridge", "Reclined Legs Up"] },
      twists: { titles: ["Gentle Cleanse", "Easy Twist", "Accessible Rotation"], intentions: ["Gentle twists create gentle changes", "Turn with ease, release with grace"], peaks: ["Supine Twist", "Chair Twist", "Easy Seated Twist"] },
    },
    calming: {
      "hip-openers": { titles: ["The Gentlest Opening", "Rest & Release", "Easy Does It"], intentions: ["Be gentle with yourself first", "Soft opening, deep healing"], peaks: ["Reclined Butterfly", "Supported Child", "Easy Supine Hip Opener"] },
      backbends: { titles: ["Gentle Heart Rest", "Easy Backbend Rest", "Tender Open"], intentions: ["Tenderness is the wisest teacher", "Gentle is the way to the heart"], peaks: ["Supported Fish", "Reclined Backbend", "Easy Sphinx"] },
      core: { titles: ["Gentle Center Rest", "Easy Core Calm"], intentions: ["Rest the core, restore everything", "Gentle strength is the deepest kind"], peaks: ["Extended Child", "Supported Savasana", "Reclined Gentle Core"] },
      balance: { titles: ["Gentle Balance Rest", "Easy Still"], intentions: ["Calm balance is the most stable", "Stillness is always available"], peaks: ["Mountain Meditation", "Supported Balance", "Chair Stillness"] },
      inversions: { titles: ["Gentle Restore Inversion", "Easy Legs Up"], intentions: ["Everyone can restore through inversion", "Gentle up is still up"], peaks: ["Legs Up Wall (10 min)", "Supported Reclined Inversion", "Easy Waterfall"] },
      twists: { titles: ["Gentle Unwind", "Easy Release", "Soft Spiral"], intentions: ["Gently let go of everything", "Ease into rotation"], peaks: ["Reclined Supine Twist", "Gentle Seated Twist", "Easy Chair Twist"] },
    },
    balancing: {
      "hip-openers": { titles: ["Balanced Gentle Hips"], intentions: ["Balance accessible and deep"], peaks: ["Supported Hip Openers", "Modified Pigeon"] },
      backbends: { titles: ["Gentle Balanced Opening"], intentions: ["Balance gentleness with openness"], peaks: ["Sphinx", "Supported Bridge", "Easy Cobra"] },
      core: { titles: ["Gentle Core Balance"], intentions: ["Balance strength and ease"], peaks: ["Modified Boat", "Supported Plank", "Gentle Core Flow"] },
      balance: { titles: ["Accessible Balance"], intentions: ["Balance available to everyone"], peaks: ["Wall Tree", "Chair Warrior III", "Supported Eagle"] },
      inversions: { titles: ["Gentle Balance Inversion"], intentions: ["Everyone can invert gently"], peaks: ["Legs Up Wall", "Supported Bridge"] },
      twists: { titles: ["Gentle Balanced Twist"], intentions: ["Balance through gentle rotation"], peaks: ["Easy Supine Twist", "Chair Twist"] },
    },
    playful: {
      "hip-openers": { titles: ["Gentle Hip Play", "Easy Hip Fun"], intentions: ["Joy is always accessible", "Play at your own pace"], peaks: ["Happy Baby Gentle", "Easy Frog", "Supported Hip Play"] },
      backbends: { titles: ["Gentle Heart Play", "Easy Opening Fun"], intentions: ["Playfulness is healing", "Open your heart with a smile"], peaks: ["Baby Cobra Fun", "Gentle Wild Thing", "Sphinx Play"] },
      core: { titles: ["Gentle Core Play", "Easy Center Fun"], intentions: ["Strength grows through joy at any level"], peaks: ["Modified Crow Attempt", "Easy Boat Play", "Plank with Modifications"] },
      balance: { titles: ["Gentle Balance Games", "Easy Wobble Fun"], intentions: ["Everyone can play with balance", "Falling with laughter heals"], peaks: ["Wall Handstand Play", "Chair Balance Games", "Easy One-Leg Play"] },
      inversions: { titles: ["Gentle Flip Fun", "Accessible Inversion Play"], intentions: ["Inversions are for everyone, including joy"], peaks: ["Wall Inversions", "Legs Up Shapes", "Easy Inversion Play"] },
      twists: { titles: ["Gentle Twist Play", "Easy Rotation Fun"], intentions: ["Fun twists are therapeutic too"], peaks: ["Seated Twist Dance", "Easy Revolved Poses", "Fun Chair Twists"] },
    },
  },
};

const OPENING_RITUALS: Record<MoodKey, string> = {
  energizing: "Sun Salutation Seed — Begin with 3 rounds of slow Surya Namaskar to warm the body and set the pace. Invite students to feel the heat building.",
  calming: "Pranayama Opening — Start with 5 minutes of alternate nostril breathing (Nadi Shodhana) to balance the nervous system and arrive in the present moment.",
  balancing: "Centering Practice — Begin seated, guide students through a 3-minute body scan and intention setting. Observe the natural breath before moving.",
  playful: "Warm-Up Game — Begin with a fun partner stretch or a playful movement game to break the ice and invite lightness into the room.",
};

const CLOSING_RITUALS: Record<MoodKey, string> = {
  energizing: "Strong Savasana — Guide students into a focused, intentional Savasana (5 min). Invite them to feel the fruits of their effort and the stillness after the storm.",
  calming: "Extended Savasana / Yoga Nidra — Allow 8–10 minutes of guided Yoga Nidra or deep relaxation. Let the practice dissolve fully into the nervous system.",
  balancing: "Integration Practice — 5 minutes of gentle journaling prompts or seated reflection. Ask: 'What did you discover about yourself today?'",
  playful: "Laughing Savasana — Invite students to take Savasana with a smile. Optionally guide a brief laughter yoga exercise before lying down.",
};

const PLAYLIST_VIBES: Record<string, Record<MoodKey, string>> = {
  vinyasa: {
    energizing: "Upbeat electronic, tribal beats, 100–120 BPM. Think: Maná Binaural, East Forest, Desert Dwellers (uptempo).",
    calming: "Soft acoustic, gentle world music, 70–85 BPM. Think: Trevor Hall, Ben Harper, acoustic mantras.",
    balancing: "Melodic indie, world fusion, 80–95 BPM. Think: Bon Iver, Sufjan Stevens, Ólafur Arnalds.",
    playful: "Indie pop, fun world music, upbeat acoustic, 95–110 BPM. Think: Jack Johnson, Ben Harper, joyful kirtan.",
  },
  hatha: {
    energizing: "Classical Indian ragas, uplifting mantras, 90–100 BPM. Think: Krishna Das, Snatam Kaur (morning ragas).",
    calming: "Soft classical, meditative ambient, 60–75 BPM. Think: Tibetan bowls, flute meditations, gentle mantras.",
    balancing: "World fusion, gentle classical, 75–90 BPM. Think: Deva Premal, Wah!, ambient Indian.",
    playful: "Uplifting folk, playful acoustic, kirtan fun, 90–105 BPM. Think: MC Yogi, playful bhajans.",
  },
  yin: {
    energizing: "Gentle ambient with subtle energy, 60–70 BPM. Think: Moby (ambient), Brian Eno, water sounds.",
    calming: "Ambient, nature sounds, 55–65 BPM. Think: rain forests, crystal bowls, deep drones.",
    balancing: "Meditative ambient, soft drones, 60–68 BPM. Think: Hammock, Stars of the Lid.",
    playful: "Light, cheerful ambient, nature sounds with birds, 60–70 BPM. Think: peaceful forest soundscapes.",
  },
  restorative: {
    energizing: "Very soft ambient, 50–60 BPM. Think: gentle awakening sounds, soft wind instruments.",
    calming: "Pure ambient, silence, nature, 45–55 BPM. Think: crystal bowls, infinite drones, deep silence.",
    balancing: "Soft healing tones, 50–60 BPM. Think: binaural beats (theta), gentle ambient.",
    playful: "Soft playful ambient, gentle nature, 50–60 BPM. Think: light birdsong, peaceful morning sounds.",
  },
  power: {
    energizing: "High-energy electronic, tribal power beats, 110–130 BPM. Think: Bassnectar, Beats Antique, powerful electronic.",
    calming: "Downtempo electronic, 75–85 BPM. Think: Moby, Massive Attack, dark ambient cool-down.",
    balancing: "Mid-tempo electronic, world beats, 90–105 BPM. Think: Thievery Corporation, balanced world electronic.",
    playful: "Fun electronic, upbeat pop, 100–120 BPM. Think: fun EDM, empowering pop, playful beats.",
  },
  gentle: {
    energizing: "Soft acoustic, gentle folk, 70–80 BPM. Think: soft morning songs, peaceful acoustic.",
    calming: "Very gentle acoustic, nature, 55–68 BPM. Think: soft guitar, nature sounds, gentle hums.",
    balancing: "Gentle world music, 65–75 BPM. Think: soft kirtan, gentle fusion, healing tones.",
    playful: "Cheerful gentle music, light folk, 70–80 BPM. Think: joyful acoustic, light-hearted songs.",
  },
};

const TEACHING_POINTS: Record<FocusKey, string[]> = {
  "hip-openers": [
    "Ground through the standing foot before lunging deeper — stability creates space.",
    "Externally rotate the hip joint slowly; never force the knee.",
    "Breathe into the resistance. Where you feel the most sensation, soften.",
    "Hip flexors store emotions — invite students to breathe through unexpected feelings.",
    "Stack the pelvis neutrally before going deeper in any hip-opening posture.",
  ],
  backbends: [
    "Lengthen the spine before arching — never collapse into a backbend.",
    "Engage the inner thighs to protect the lower back in deep backbends.",
    "Open the chest by broadening the collarbones, not just lifting the chin.",
    "Press the floor away to create space between the vertebrae.",
    "Backbends expose vulnerability — cue students to breathe into resistance, not push through it.",
  ],
  core: [
    "Draw the navel toward the spine, but keep the breath free.",
    "Core stability is about connection, not bracing. Find the tone without tension.",
    "The core includes the pelvic floor, diaphragm, and multifidus — not just the 'abs'.",
    "Move from center outward — every limb extension begins with core engagement.",
    "Rest is part of core training — know when to release and let the muscles recover.",
  ],
  balance: [
    "Find a drishti (focal point) at eye level and let your gaze steady your mind.",
    "Press all four corners of the standing foot into the earth before lifting.",
    "Micro-adjust constantly — balance is not static, it is dynamic and alive.",
    "If you fall, you've found the edge of your balance. Return without judgment.",
    "Balance in yoga mirrors balance in life — some days it's there, some days it isn't.",
  ],
  inversions: [
    "Build a strong foundation — wrists, forearms, or head must be stable before lifting.",
    "Inversions are safe when the core is engaged and the breath is free.",
    "Come out of inversions with as much control as you entered — the exit is the practice.",
    "If students feel pressure in the head or neck, this is the time to come down.",
    "Every inversion, even Legs Up the Wall, shifts our perspective — use this as a teaching.",
  ],
  twists: [
    "Lengthen the spine on the inhale; rotate on the exhale. Never force.",
    "Twist from the base of the spine upward — the neck is the last thing to turn.",
    "Keep both sitting bones grounded in seated twists; both feet in standing twists.",
    "Twists are wringing the sponge — compression first, then space and release.",
    "Twisting massages the digestive organs — invite students to breathe into the belly.",
  ],
};

const SEASON_INTENTIONS: Record<string, string> = {
  spring: " This season of spring mirrors your practice — something new is being born.",
  summer: " Like the fullness of summer, let your practice be abundant and expansive.",
  fall: " As autumn releases its leaves, let this practice release what you no longer need.",
  winter: " In the quiet of winter, find the still wisdom that lives at your center.",
};

const QUOTES = [
  { text: "Yoga is the journey of the self, through the self, to the self.", author: "The Bhagavad Gita" },
  { text: "The nature of yoga is to shine the light of awareness into the darkest corners of the body.", author: "Jason Crandell" },
  { text: "Yoga teaches us to cure what need not be endured and endure what cannot be cured.", author: "B.K.S. Iyengar" },
  { text: "Inhale the future, exhale the past.", author: "Unknown" },
  { text: "You cannot do yoga. Yoga is your natural state. What you can do are yoga exercises.", author: "Sharon Gannon" },
  { text: "True yoga is not about the shape of your body, but the shape of your life.", author: "Aadil Palkhivala" },
  { text: "The most important pieces of equipment you need for doing yoga are your body and your mind.", author: "Rodney Yee" },
  { text: "Yoga is a light, which once lit, will never dim. The better your practice, the brighter the flame.", author: "B.K.S. Iyengar" },
  { text: "Breath is the bridge which connects life to consciousness.", author: "Thich Nhat Hanh" },
  { text: "Movement is a medicine for creating change in a person's physical, emotional, and mental states.", author: "Carol Welch" },
  { text: "Yoga is the practice of quieting the mind.", author: "Patanjali" },
  { text: "The body benefits from movement, and the mind benefits from stillness.", author: "Sakyong Mipham" },
  { text: "Yoga does not just change the way we see things, it transforms the person who sees.", author: "B.K.S. Iyengar" },
  { text: "In the beginning you will fall into the gaps in between thoughts — after practicing for years, you become the gap.", author: "J. Kleykamp" },
  { text: "Calm mind brings inner strength and self-confidence, so that's very important for good health.", author: "Dalai Lama" },
  { text: "An unexamined life is not worth living.", author: "Socrates" },
  { text: "The pose begins when you want to leave it.", author: "Baron Baptiste" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "To the mind that is still, the whole universe surrenders.", author: "Lao Tzu" },
  { text: "If you can breathe, you can do yoga.", author: "Unknown" },
  { text: "Blessed are the flexible, for they shall not be bent out of shape.", author: "Unknown" },
];

// ─── Options ──────────────────────────────────────────────────────────────────

const CLASS_TYPES = ["Vinyasa", "Hatha", "Yin", "Restorative", "Power", "Gentle"] as const;
const DURATIONS = ["30 min", "45 min", "60 min", "75 min", "90 min"] as const;
const LEVELS = ["Beginner", "Mixed Level", "Intermediate", "Advanced"] as const;
const MOODS = ["Energizing", "Calming", "Balancing", "Playful"] as const;
const SEASONS = ["Spring", "Summer", "Fall", "Winter"] as const;
const FOCUSES = [
  "Hip Openers",
  "Backbends",
  "Core",
  "Balance",
  "Inversions",
  "Twists",
] as const;

type ClassType = (typeof CLASS_TYPES)[number];
type Duration = (typeof DURATIONS)[number];
type Level = (typeof LEVELS)[number];
type Mood = (typeof MOODS)[number];
type Season = (typeof SEASONS)[number] | "";
type Focus = (typeof FOCUSES)[number];

interface FormState {
  classType: ClassType;
  duration: Duration;
  level: Level;
  mood: Mood;
  season: Season;
  focus: Focus;
}

interface GeneratedTheme {
  title: string;
  subtitle: string;
  intention: string;
  opening: string;
  closing: string;
  playlistVibe: string;
  peaks: string[];
  teachingPoints: string[];
  quote: { text: string; author: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function toKey(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-");
}

function difficultyLabel(classType: ClassType, level: Level): string {
  if (classType === "Restorative" || classType === "Gentle") return "All Levels";
  if (classType === "Power") return "Advanced";
  if (level === "Beginner") return "Beginner";
  if (level === "Advanced") return "Advanced";
  return "Intermediate";
}

function generateTheme(form: FormState): GeneratedTheme {
  const ctKey = toKey(form.classType) as string;
  const moodKey = toKey(form.mood) as MoodKey;
  const focusKey = toKey(form.focus) as FocusKey;

  const classMoods = THEMES[ctKey] ?? THEMES.vinyasa;
  const moodFocuses = classMoods[moodKey] ?? classMoods.energizing ?? {};
  const entry: ThemeEntry =
    (moodFocuses as Record<FocusKey, ThemeEntry | undefined>)[focusKey] ??
    Object.values(moodFocuses)[0] ?? {
      titles: ["Yoga Journey"],
      intentions: ["Connect to the present moment"],
      peaks: ["Savasana"],
    };

  const baseTitle = pick(entry.titles);
  const baseIntention = pick(entry.intentions);
  const seasonAdd = form.season ? SEASON_INTENTIONS[toKey(form.season)] ?? "" : "";
  const intention = baseIntention + seasonAdd;

  const subtitle = `${form.classType} · ${form.duration} · ${form.level} · ${form.mood}`;
  const opening = OPENING_RITUALS[moodKey] ?? OPENING_RITUALS.balancing;
  const closing = CLOSING_RITUALS[moodKey] ?? CLOSING_RITUALS.balancing;

  const playlistDB = PLAYLIST_VIBES[ctKey] ?? PLAYLIST_VIBES.vinyasa;
  const playlistVibe = playlistDB[moodKey] ?? playlistDB.balancing;

  const allPeaks = [...entry.peaks];
  const peaks = allPeaks.slice(0, 4);

  const allPoints = TEACHING_POINTS[focusKey];
  const shuffled = [...allPoints].sort(() => Math.random() - 0.5);
  const teachingPoints = shuffled.slice(0, 4);

  const quote = pick(QUOTES);

  return {
    title: baseTitle,
    subtitle,
    intention,
    opening,
    closing,
    playlistVibe,
    peaks,
    teachingPoints,
    quote,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-sans font-medium border transition-all duration-150 ${
        selected
          ? "bg-primary text-white border-primary"
          : "bg-surface-low border-outline-variant/40 text-on-surface-variant hover:border-primary/40"
      }`}
    >
      {label}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-3">
      {children}
    </p>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClassThemeGeneratorPage() {
  const [form, setForm] = useState<FormState>({
    classType: "Vinyasa",
    duration: "60 min",
    level: "Mixed Level",
    mood: "Energizing",
    season: "",
    focus: "Hip Openers",
  });

  const [result, setResult] = useState<GeneratedTheme | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleGenerate() {
    const theme = generateTheme(form);
    setResult(theme);
    setHasGenerated(true);
    setTimeout(() => {
      document.getElementById("theme-result")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function handleGenerateAnother() {
    const theme = generateTheme(form);
    setResult(theme);
    setTimeout(() => {
      document.getElementById("theme-result")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#fafaf5]">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 font-sans text-sm text-on-surface-variant hover:text-primary transition-colors mb-8"
          >
            ← Back to Resources
          </Link>
          <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
            Teaching Tools
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-on-surface mb-4">
            Yoga Class Theme Generator
          </h1>
          <p className="font-sans text-lg text-on-surface-variant max-w-xl">
            Generate a complete, cohesive class theme in seconds — title, intention, peak poses, playlist vibe, teaching cues, and more.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-4 space-y-6">

          {/* Class Type */}
          <div className="bg-surface-card rounded-2xl p-8">
            <SectionLabel>Class Type</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {CLASS_TYPES.map((ct) => (
                <OptionButton
                  key={ct}
                  label={ct}
                  selected={form.classType === ct}
                  onClick={() => set("classType", ct)}
                />
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="bg-surface-card rounded-2xl p-8">
            <SectionLabel>Duration</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <OptionButton
                  key={d}
                  label={d}
                  selected={form.duration === d}
                  onClick={() => set("duration", d)}
                />
              ))}
            </div>
          </div>

          {/* Student Level */}
          <div className="bg-surface-card rounded-2xl p-8">
            <SectionLabel>Student Level</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <OptionButton
                  key={l}
                  label={l}
                  selected={form.level === l}
                  onClick={() => set("level", l)}
                />
              ))}
            </div>
          </div>

          {/* Mood & Energy */}
          <div className="bg-surface-card rounded-2xl p-8">
            <SectionLabel>Mood &amp; Energy</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <OptionButton
                  key={m}
                  label={m}
                  selected={form.mood === m}
                  onClick={() => set("mood", m)}
                />
              ))}
            </div>
          </div>

          {/* Season */}
          <div className="bg-surface-card rounded-2xl p-8">
            <SectionLabel>Season (optional)</SectionLabel>
            <div className="flex flex-wrap gap-2">
              <OptionButton
                label="None"
                selected={form.season === ""}
                onClick={() => set("season", "")}
              />
              {SEASONS.map((s) => (
                <OptionButton
                  key={s}
                  label={s}
                  selected={form.season === s}
                  onClick={() => set("season", s)}
                />
              ))}
            </div>
          </div>

          {/* Physical Focus */}
          <div className="bg-surface-card rounded-2xl p-8">
            <SectionLabel>Physical Focus</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {FOCUSES.map((f) => (
                <OptionButton
                  key={f}
                  label={f}
                  selected={form.focus === f}
                  onClick={() => set("focus", f)}
                />
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            className="w-full py-4 rounded-full text-white font-semibold font-sans text-base transition-opacity hover:opacity-90 active:opacity-80"
            style={{
              background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)",
            }}
          >
            Generate Class Theme
          </button>

          {/* Result */}
          {result && (
            <div id="theme-result" className="space-y-6 pt-4">

              {/* Main Theme Card */}
              <div
                className="rounded-2xl p-8 text-white"
                style={{
                  background: "linear-gradient(135deg, #536046 0%, #6b795d 60%, #7a8f6d 100%)",
                }}
              >
                <p className="font-sans text-xs font-bold tracking-widest uppercase opacity-70 mb-3">
                  Your Theme
                </p>
                <h2 className="font-serif text-3xl md:text-4xl mb-2">{result.title}</h2>
                <p className="font-sans text-sm opacity-80">{result.subtitle}</p>
              </div>

              {/* Intention */}
              <div className="bg-surface-card rounded-2xl p-8">
                <SectionLabel>Class Intention</SectionLabel>
                <p className="font-serif text-xl text-on-surface leading-relaxed">
                  &ldquo;{result.intention}&rdquo;
                </p>
              </div>

              {/* Opening & Closing */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-surface-card rounded-2xl p-6">
                  <SectionLabel>Opening Ritual</SectionLabel>
                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                    {result.opening}
                  </p>
                </div>
                <div className="bg-surface-card rounded-2xl p-6">
                  <SectionLabel>Closing Ritual</SectionLabel>
                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                    {result.closing}
                  </p>
                </div>
              </div>

              {/* Playlist Vibe */}
              <div className="bg-secondary-container rounded-2xl p-6">
                <SectionLabel>Playlist Vibe</SectionLabel>
                <p className="font-sans text-sm text-on-surface leading-relaxed">
                  {result.playlistVibe}
                </p>
              </div>

              {/* Peak Poses */}
              <div className="bg-surface-card rounded-2xl p-8">
                <SectionLabel>Peak Pose Suggestions</SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.peaks.map((pose, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-surface-low rounded-xl px-4 py-3"
                    >
                      <span
                        className="text-xs font-bold font-sans rounded-full w-6 h-6 flex items-center justify-center text-white shrink-0"
                        style={{ background: "#536046" }}
                      >
                        {i + 1}
                      </span>
                      <span className="font-sans text-sm text-on-surface">{pose}</span>
                      <span className="ml-auto text-xs font-sans text-on-surface-variant">
                        {difficultyLabel(form.classType, form.level)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teaching Points */}
              <div className="bg-surface-card rounded-2xl p-8">
                <SectionLabel>Key Teaching Points</SectionLabel>
                <ul className="space-y-3">
                  {result.teachingPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-primary" />
                      <span className="font-sans text-sm text-on-surface-variant leading-relaxed">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quote */}
              <div
                className="rounded-2xl p-8 relative overflow-hidden"
                style={{ background: "#fafaf5", border: "1.5px solid #dde5d4" }}
              >
                <span
                  className="absolute top-2 left-6 font-serif text-8xl leading-none select-none"
                  style={{ color: "#dde5d4" }}
                >
                  &ldquo;
                </span>
                <div className="relative z-10 pt-6">
                  <p className="font-serif text-lg text-on-surface leading-relaxed mb-4">
                    {result.quote.text}
                  </p>
                  <p className="font-sans text-sm text-on-surface-variant font-medium">
                    — {result.quote.author}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleGenerateAnother}
                  className="flex-1 py-4 rounded-full text-white font-semibold font-sans text-base transition-opacity hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)",
                  }}
                >
                  Generate Another Theme
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 py-4 rounded-full font-semibold font-sans text-sm bg-surface-low border border-outline-variant/40 text-on-surface-variant hover:border-primary/40 transition-colors"
                >
                  Print / Share
                </button>
              </div>
            </div>
          )}

          {!hasGenerated && (
            <p className="text-center font-sans text-sm text-on-surface-variant pt-2">
              Adjust your options above and click <strong>Generate Class Theme</strong>.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
