// Daily Reflections Calendar with Holidays & Observances
// October 2025 - December 2025

export interface DailyReflection {
  date: string; // YYYY-MM-DD format
  prompt: string;
  theme?: string;
  observances?: string[];
}

export const dailyReflections: DailyReflection[] = [
  // October 2025 - Week 0: October 22-26
  {
    date: "2025-10-22",
    prompt: "What emotion is lingering today? I meet it with softness and curiosity.",
    theme: "Emotional Check-In",
    observances: []
  },
  {
    date: "2025-10-23",
    prompt: "I'm grateful for something I released — a thought, a habit, a fear.",
    theme: "Gratitude Prompt",
    observances: []
  },
  {
    date: "2025-10-24",
    prompt: "I reflect on what I've outgrown and what I'm ready to welcome.",
    theme: "Spiritual Reflection",
    observances: ["Jumu'ah Mubarak to all observing."]
  },
  {
    date: "2025-10-25",
    prompt: "I rest in the quiet wisdom of autumn. Letting go is its own kind of strength.",
    theme: "Rest & Renewal",
    observances: ["Happy Sabbath to Seventh-day Adventists.", "Wishing a meaningful day of worship to Jehovah's Witnesses."]
  },
  {
    date: "2025-10-26",
    prompt: "I begin this week with gentle courage. I don't need to have all the answers.",
    theme: "Uplift & Reset",
    observances: ["Blessings to all observing the Lord's Day."]
  },

  // October 27 - November 2: Grounding in Change
  {
    date: "2025-10-27",
    prompt: "I allow myself to settle into this season. Change doesn't have to be rushed — I can move gently.",
    theme: "Intention"
  },
  {
    date: "2025-10-28",
    prompt: "I pause to notice how my body feels today. What's asking for warmth, movement, or stillness?",
    theme: "Body Awareness"
  },
  {
    date: "2025-10-29",
    prompt: "What emotion is present today? I welcome it with curiosity, not judgment.",
    theme: "Emotional Check-In"
  },
  {
    date: "2025-10-30",
    prompt: "I'm grateful for something that anchors me — a routine, a person, a quiet moment.",
    theme: "Gratitude Prompt"
  },
  {
    date: "2025-10-31",
    prompt: "On this day of reflection, I honor my connection to something greater. May my intentions be clear and kind.",
    theme: "Spiritual Reflection",
    observances: ["Jumu'ah Mubarak to those observing."]
  },
  {
    date: "2025-11-01",
    prompt: "Today, I honor those who came before me — their wisdom, their courage, their love.",
    theme: "Rest & Renewal / All Saints' Day",
    observances: ["Happy Sabbath to Seventh-day Adventists.", "Worship blessings to Jehovah's Witnesses.", "Blessed All Saints' Day."]
  },
  {
    date: "2025-11-02",
    prompt: "I carry the memory of loved ones with tenderness. Their presence lives in my heart.",
    theme: "Uplift & Reset / All Souls' Day",
    observances: ["Peaceful All Souls' Day.", "Blessings to all observing the Lord's Day."]
  },

  // November 3-9: Embracing Stillness
  {
    date: "2025-11-03",
    prompt: "I give myself permission to slow down. Stillness is not emptiness — it's where clarity begins.",
    theme: "Intention"
  },
  {
    date: "2025-11-04",
    prompt: "What part of my body feels tense or tired today? I offer it softness and breath.",
    theme: "Body Awareness"
  },
  {
    date: "2025-11-05",
    prompt: "What emotion is quietly present beneath the surface? I listen without rushing to fix.",
    theme: "Emotional Check-In"
  },
  {
    date: "2025-11-06",
    prompt: "I'm grateful for a quiet moment that helped me feel more like myself.",
    theme: "Gratitude Prompt"
  },
  {
    date: "2025-11-07",
    prompt: "On this day of reflection, I center myself in peace and purpose.",
    theme: "Spiritual Reflection",
    observances: ["Jumu'ah Mubarak."]
  },
  {
    date: "2025-11-08",
    prompt: "Today, I honor rest as a sacred rhythm. I don't need to earn it — I simply receive.",
    theme: "Rest & Renewal",
    observances: ["Happy Sabbath to Seventh-day Adventists.", "Worship blessings to Jehovah's Witnesses."]
  },
  {
    date: "2025-11-09",
    prompt: "I step into this week with quiet strength. What small joy can I carry forward?",
    theme: "Uplift & Reset",
    observances: ["Blessings to all observing the Lord's Day."]
  },

  // November 10-16: Honoring Transitions
  {
    date: "2025-11-10",
    prompt: "I honor the transitions in my life — the ones I chose and the ones I didn't. Each one holds wisdom.",
    theme: "Intention"
  },
  {
    date: "2025-11-11",
    prompt: "What does my body need to feel supported today — warmth, movement, stillness, or nourishment?",
    theme: "Body Awareness"
  },
  {
    date: "2025-11-12",
    prompt: "What emotion is asking to be named today? I meet it with compassion.",
    theme: "Emotional Check-In"
  },
  {
    date: "2025-11-13",
    prompt: "I'm grateful for something that helped me grow, even if it was uncomfortable.",
    theme: "Gratitude Prompt"
  },
  {
    date: "2025-11-14",
    prompt: "On this day of reflection, I pause to reconnect with my values and my breath.",
    theme: "Spiritual Reflection",
    observances: ["Jumu'ah Mubarak."]
  },
  {
    date: "2025-11-15",
    prompt: "Today, I rest. I release the need to be productive and allow myself to simply be.",
    theme: "Rest & Renewal",
    observances: ["Happy Sabbath to Seventh-day Adventists.", "Worship blessings to Jehovah's Witnesses."]
  },
  {
    date: "2025-11-16",
    prompt: "I begin this week with quiet courage. I am enough.",
    theme: "Uplift & Reset",
    observances: ["Blessings to all observing the Lord's Day."]
  },

  // November 17-23: Inner Strength & Quiet Resilience
  {
    date: "2025-11-17",
    prompt: "I trust my quiet strength. I don't need to be loud to be powerful.",
    theme: "Intention"
  },
  {
    date: "2025-11-18",
    prompt: "What part of me feels strong today? What part needs gentleness?",
    theme: "Body Awareness"
  },
  {
    date: "2025-11-19",
    prompt: "What emotion is asking to be heard today?",
    theme: "Emotional Check-In",
    observances: ["International Men's Day — honoring strength, care, and emotional wellbeing."]
  },
  {
    date: "2025-11-20",
    prompt: "I'm grateful for someone who made me feel seen.",
    theme: "Gratitude Prompt",
    observances: ["Universal Children's Day — may every child feel safe, loved, and valued."]
  },
  {
    date: "2025-11-21",
    prompt: "I pause to reconnect with my values and my breath.",
    theme: "Spiritual Reflection",
    observances: ["Jumu'ah Mubarak."]
  },
  {
    date: "2025-11-22",
    prompt: "I rest in my own rhythm. I don't need to keep pace with anyone else.",
    theme: "Rest & Renewal",
    observances: ["Happy Sabbath to Seventh-day Adventists.", "Worship blessings to Jehovah's Witnesses."]
  },
  {
    date: "2025-11-23",
    prompt: "I begin this week with quiet confidence. I am enough.",
    theme: "Uplift & Reset",
    observances: ["Blessings to all observing the Lord's Day."]
  },

  // November 24-30: Gratitude & Sacred Preparation
  {
    date: "2025-11-24",
    prompt: "I prepare my heart for what's coming — not with urgency, but with care.",
    theme: "Intention",
    observances: ["Honoring Guru Tegh Bahadur Sahib's martyrdom — may courage and compassion guide us."]
  },
  {
    date: "2025-11-25",
    prompt: "What does my body need to feel nourished today?",
    theme: "Body Awareness",
    observances: ["Coptic & Eastern Orthodox Nativity Fast begins — a time of reflection and spiritual preparation."]
  },
  {
    date: "2025-11-26",
    prompt: "What emotion is stirring as the season shifts?",
    theme: "Emotional Check-In"
  },
  {
    date: "2025-11-27",
    prompt: "I'm grateful for the ordinary moments — the ones that quietly shape my life.",
    theme: "Gratitude Prompt / Thanksgiving",
    observances: ["Happy Thanksgiving to all who celebrate."]
  },
  {
    date: "2025-11-28",
    prompt: "I reflect on what I've received and what I can give.",
    theme: "Spiritual Reflection",
    observances: ["Jumu'ah Mubarak."]
  },
  {
    date: "2025-11-29",
    prompt: "I rest in gratitude. I don't need to do more to be worthy.",
    theme: "Rest & Renewal",
    observances: ["Happy Sabbath to Seventh-day Adventists.", "Worship blessings to Jehovah's Witnesses."]
  },
  {
    date: "2025-11-30",
    prompt: "I begin this week with hope. Something beautiful is unfolding.",
    theme: "Uplift & Reset / Advent Begins",
    observances: ["Blessed Advent to all preparing for the season of light."]
  },

  // December 2025 - Week 1: Dec 1-7 (Welcoming the Light)
  {
    date: "2025-12-01",
    prompt: "I open myself to the light returning — within and around me.",
    theme: "Intention",
    observances: ["World AIDS Day — honoring resilience, remembrance, and compassion."]
  },
  {
    date: "2025-12-02",
    prompt: "What part of me feels heavy? What part feels ready to soften?",
    theme: "Body Awareness"
  },
  {
    date: "2025-12-03",
    prompt: "What emotion is flickering today, like a candle in the dark?",
    theme: "Emotional Check-In",
    observances: ["International Day of Persons with Disabilities — honoring every body, every story."]
  },
  {
    date: "2025-12-04",
    prompt: "I'm grateful for a moment of quiet beauty this week.",
    theme: "Gratitude Prompt"
  },
  {
    date: "2025-12-05",
    prompt: "I reflect on the light I carry — even when I forget it's there.",
    theme: "Spiritual Reflection",
    observances: ["Jumu'ah Mubarak to all observing."]
  },
  {
    date: "2025-12-06",
    prompt: "I rest in the glow of what matters most.",
    theme: "Rest & Renewal",
    observances: ["Happy Sabbath to Seventh-day Adventists.", "Wishing a meaningful day of worship to Jehovah's Witnesses."]
  },
  {
    date: "2025-12-07",
    prompt: "I begin this week with hope. Even the smallest light can guide me.",
    theme: "Uplift & Reset",
    observances: ["Blessings to all observing the Lord's Day."]
  },

  // December 8-14: Stillness & Sacred Waiting
  {
    date: "2025-12-08",
    prompt: "I welcome stillness as a sacred teacher.",
    theme: "Intention",
    observances: ["Feast of the Immaculate Conception (Catholic)", "🪷 Bodhi Day (Buddhist) — honoring awakening and inner peace."]
  },
  {
    date: "2025-12-09",
    prompt: "What does my body need to feel safe and steady today?",
    theme: "Body Awareness"
  },
  {
    date: "2025-12-10",
    prompt: "What emotion is asking to be held gently today?",
    theme: "Emotional Check-In",
    observances: ["Human Rights Day — may all hearts be free."]
  },
  {
    date: "2025-12-11",
    prompt: "I'm grateful for something that helped me feel grounded.",
    theme: "Gratitude Prompt"
  },
  {
    date: "2025-12-12",
    prompt: "I pause to remember what is sacred in my life.",
    theme: "Spiritual Reflection",
    observances: ["Jumu'ah Mubarak to all observing."]
  },
  {
    date: "2025-12-13",
    prompt: "I rest in the quiet miracle of being here.",
    theme: "Rest & Renewal",
    observances: ["Happy Sabbath to Seventh-day Adventists.", "Wishing a meaningful day of worship to Jehovah's Witnesses."]
  },
  {
    date: "2025-12-14",
    prompt: "I begin this week with reverence. Even waiting can be holy.",
    theme: "Uplift & Reset",
    observances: ["Blessings to all observing the Lord's Day."]
  },

  // December 15-21: Celebration & Inner Light
  {
    date: "2025-12-15",
    prompt: "I celebrate the light within me and around me.",
    theme: "Intention",
    observances: ["Hanukkah begins at sundown — Chag Sameach to all who celebrate!"]
  },
  {
    date: "2025-12-16",
    prompt: "What movement today feels like joy?",
    theme: "Body Awareness",
    observances: ["Hanukkah Day 2 — may your light shine brightly."]
  },
  {
    date: "2025-12-17",
    prompt: "What emotion is glowing within me today?",
    theme: "Emotional Check-In",
    observances: ["Hanukkah Day 3 — celebrating resilience and miracles."]
  },
  {
    date: "2025-12-18",
    prompt: "I'm grateful for something that brought unexpected joy.",
    theme: "Gratitude Prompt",
    observances: ["Hanukkah Day 4 — may gratitude fill your home."]
  },
  {
    date: "2025-12-19",
    prompt: "I reflect on the miracles I've witnessed — large and small.",
    theme: "Spiritual Reflection",
    observances: ["Jumu'ah Mubarak.", "Hanukkah Day 5 — light and peace to all celebrating."]
  },
  {
    date: "2025-12-20",
    prompt: "I rest in the warmth of tradition and togetherness.",
    theme: "Rest & Renewal",
    observances: ["Happy Sabbath to Seventh-day Adventists.", "Wishing a meaningful day of worship to Jehovah's Witnesses.", "Hanukkah Day 6 — may your rest be radiant."]
  },
  {
    date: "2025-12-21",
    prompt: "I honor the return of the light. Even in darkness, I am growing.",
    theme: "Uplift & Reset / Winter Solstice / Yule",
    observances: ["Blessed Yule and Winter Solstice — may light find you and hold you.", "Blessings to all observing the Lord's Day.", "Hanukkah Day 7."]
  },

  // December 22-28: Joy, Generosity & Sacred Belonging
  {
    date: "2025-12-22",
    prompt: "I open my heart to joy — not perfection, just presence.",
    theme: "Intention",
    observances: ["Hanukkah Day 8 — may your light continue to shine."]
  },
  {
    date: "2025-12-23",
    prompt: "What helps me feel at home in my body today?",
    theme: "Body Awareness"
  },
  {
    date: "2025-12-24",
    prompt: "What emotion holds the most meaning tonight?",
    theme: "Emotional Check-In / Christmas Eve",
    observances: ["Peaceful Christmas Eve to all celebrating."]
  },
  {
    date: "2025-12-25",
    prompt: "I'm grateful for the gift of being here, now, with love in my heart.",
    theme: "Gratitude Prompt / Christmas",
    observances: ["Merry Christmas to all who celebrate!"]
  },
  {
    date: "2025-12-26",
    prompt: "I reflect on the principles I carry — unity, purpose, collective care.",
    theme: "Spiritual Reflection / Kwanzaa Begins",
    observances: ["Jumu'ah Mubarak.", "Happy Kwanzaa! (Day 1: Umoja - Unity)"]
  },
  {
    date: "2025-12-27",
    prompt: "I rest in the memory of celebration and the promise of renewal.",
    theme: "Rest & Renewal",
    observances: ["Happy Sabbath to Seventh-day Adventists.", "Wishing a meaningful day of worship to Jehovah's Witnesses.", "Kwanzaa Day 2: Kujichagulia - Self-Determination"]
  },
  {
    date: "2025-12-28",
    prompt: "I begin this week with intention and collective strength.",
    theme: "Uplift & Reset",
    observances: ["Blessings to all observing the Lord's Day.", "Kwanzaa Day 3: Ujima - Collective Work and Responsibility"]
  },

  // December 29-31: Year-End Reflection
  {
    date: "2025-12-29",
    prompt: "I pause to honor how far I've come.",
    theme: "Intention",
    observances: ["Kwanzaa Day 4: Ujamaa - Cooperative Economics"]
  },
  {
    date: "2025-12-30",
    prompt: "What part of me feels most alive as this year closes?",
    theme: "Body Awareness",
    observances: ["Kwanzaa Day 5: Nia - Purpose"]
  },
  {
    date: "2025-12-31",
    prompt: "What emotion am I carrying into the new year?",
    theme: "Emotional Check-In / New Year's Eve",
    observances: ["Kwanzaa Day 6: Kuumba - Creativity", "Peaceful transition into the new year."]
  }
];

// Helper function to get reflection for a specific date
export function getReflectionForDate(date: Date): DailyReflection | null {
  // Use local date, not UTC
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  return dailyReflections.find(r => r.date === dateString) || null;
}

// Helper function to get today's reflection
export function getTodaysReflection(): DailyReflection | null {
  return getReflectionForDate(new Date());
}
