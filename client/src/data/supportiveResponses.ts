export interface SupportiveResponse {
  message: string;
  action: string;
  link?: string;
  linkText?: string;
}

export const supportiveResponses: Record<string, SupportiveResponse[]> = {
  happy: [
    { message: "That's wonderful! Keep that light energy going — maybe write down what made you smile today.", action: "Journaling prompt or gratitude note" },
    { message: "Joy looks good on you. Let it ripple outward.", action: "Share a kind message or compliment" },
    { message: "Your happiness is contagious — celebrate it!", action: "Dance break or celebration badge" },
    { message: "Let your joy be your compass today.", action: "Choose a joyful micro-action" },
    { message: "Your joy is radiant and contagious. Let it ripple outward, reminding others that lightness is possible. You deserve every moment of delight—so soak it in, celebrate it, and let it fuel your dreams.", action: "Celebrate your joy", link: "/mindfulness", linkText: "Amplify Your Joy" }
  ],
  calm: [
    { message: "Steady and balanced — beautiful. Stay connected to that feeling.", action: "Short mindfulness exercise" },
    { message: "Peaceful moments matter. Let's honour this one.", action: "Gentle breath or body scan" },
    { message: "You're in a good groove. Let's keep it flowing.", action: "Light movement or hydration" },
    { message: "Stillness is powerful. Enjoy the pause.", action: "3-minute quiet reflection" },
    { message: "In this quiet, your nervous system exhales. You are safe, steady, and whole. Let this peace anchor you, reminding you that even in chaos, you can return to this stillness within.", action: "Grounding in peace", link: "/mindfulness", linkText: "Deepen Your Calm" }
  ],
  sleepy: [
    { message: "You sound like you could use a little rest. Try a 5-minute stretch or a cup of herbal tea.", action: "Guided stretch or hydration reminder", link: "/mindfulness?scrollTo=gratitude", linkText: "Evening Meditation" },
    { message: "Your body's asking for kindness. Let's listen.", action: "Restorative pose or nap tip", link: "/mindfulness?scrollTo=gratitude", linkText: "Wind Down with Gratitude" },
    { message: "Slow is sacred. You're allowed to pause.", action: "Gentle wind-down ritual", link: "/mindfulness?scrollTo=gratitude", linkText: "Gratitude Practice" },
    { message: "Fatigue is a signal, not a flaw.", action: "Energy check-in or sleep log" },
    { message: "Let's soften the edges. You deserve rest.", action: "Cozy comfort suggestion", link: "/mindfulness?scrollTo=gratitude", linkText: "Evening Meditation" }
  ],
  sad: [
    { message: "I'm here with you. Sad moments come and go — maybe step outside for a few deep breaths.", action: "Breathing or short nature walk", link: "/quick-stress-relief", linkText: "Try Breathing Exercise" },
    { message: "It's okay to feel this. You're not alone.", action: "Self-compassion prompt", link: "/quick-stress-relief", linkText: "Grounding Exercise" },
    { message: "Let the tears be part of healing.", action: "Emotional release badge" },
    { message: "You're allowed to feel everything.", action: "Comforting affirmation", link: "/quick-stress-relief", linkText: "Find Comfort" },
    { message: "Your sadness is valid—it speaks of love, loss, and depth. You don't have to rush through it. Let yourself be held in compassion. Even here, healing is quietly unfolding.", action: "Compassionate acknowledgment", link: "/quick-stress-relief", linkText: "Find Comfort" }
  ],
  anxious: [
    { message: "Let's take a moment together. Try this simple breathing rhythm: in for 4, out for 6.", action: "Guided breathing exercise", link: "/quick-stress-relief", linkText: "Start Breathing Exercise" },
    { message: "You're safe right now. Let's anchor together.", action: "Grounding visualization", link: "/quick-stress-relief", linkText: "Try Grounding Exercise" },
    { message: "You're doing your best. That matters.", action: "Gentle self-talk reminder", link: "/quick-stress-relief", linkText: "Quick Stress Relief" },
    { message: "It's okay to feel unsettled—your body is trying to protect you. Breathe gently. You're not alone, and this moment will pass. You are resilient, and each breath brings you closer to calm.", action: "Compassionate grounding", link: "/quick-stress-relief", linkText: "Find Your Calm" }
  ],
  angry: [
    { message: "Energy is high — let's release it safely. A quick walk or shaking out your arms might help.", action: "Physical movement tip", link: "/quick-stress-relief", linkText: "Try Tension Release" },
    { message: "Anger is valid. Let's move it through.", action: "Punch pillow or scribble exercise", link: "/quick-stress-relief", linkText: "Release Physical Tension" },
    { message: "You're allowed to feel this. Let's channel it.", action: "Expressive writing or art", link: "/quick-stress-relief", linkText: "Quick Stress Relief" },
    { message: "Let's cool the fire with breath.", action: "Cooling breath technique", link: "/quick-stress-relief", linkText: "Start Breathing Exercise" },
    { message: "Your anger is a signal—something mattered deeply to you. You're allowed to feel it. Let it rise, let it speak, and then let it soften. You are not defined by this fire, but you can use its energy to protect what you love and move toward healing.", action: "Compassionate anger acknowledgment", link: "/quick-stress-relief", linkText: "Find Your Center" }
  ],
  depressed: [
    { message: "It's okay to feel low. You're not alone — maybe reach for one small comforting action today.", action: "Grounding or self-compassion exercise", link: "/quick-stress-relief", linkText: "Try Grounding Exercise" },
    { message: "You're here. That's enough for now.", action: "Micro-win badge", link: "/quick-stress-relief", linkText: "Take One Small Step" },
    { message: "Let's find one gentle thing to hold onto.", action: "Texture or sensory comfort", link: "/quick-stress-relief", linkText: "Grounding Exercise" },
    { message: "You're not broken. You're human.", action: "Affirmation or connection tip" },
    { message: "Even small steps count. Let's take one.", action: "Choose a 2-minute action", link: "/quick-stress-relief", linkText: "Quick Relief Exercise" }
  ],
  grateful: [
    { message: "That's lovely! Gratitude expands good energy — write down one thing you appreciate.", action: "Gratitude journal" },
    { message: "Gratitude is a superpower. Let's use it.", action: "Appreciation badge" },
    { message: "Thankfulness opens the heart. Let it flow.", action: "Share a thank-you" },
    { message: "You're noticing the good — beautiful.", action: "Gratitude walk or photo" },
    { message: "Let's celebrate what's working.", action: "Highlight a win" }
  ],
  lonely: [
    { message: "You're not alone, even when it feels that way. Let's find a gentle connection.", action: "Reach out to someone or join community" },
    { message: "Loneliness is real, and so is your worth. You matter.", action: "Self-compassion exercise" },
    { message: "Sometimes we need to be seen. I see you.", action: "Write yourself a kind message" },
    { message: "Connection starts small. Let's take one step.", action: "Send a text or call someone" },
    { message: "You deserve to feel held. Let's create that.", action: "Comforting ritual or support resource" }
  ],
  sick: [
    { message: "Your body is healing. Rest is medicine — honor what you need right now.", action: "Gentle rest or hydration reminder" },
    { message: "Illness is temporary. Be kind to yourself as you recover.", action: "Self-care check-in" },
    { message: "Listen to your body's signals. Small comforts matter.", action: "Cozy self-care ritual" },
    { message: "You're allowed to slow down. Healing takes time.", action: "Rest and recovery tip" },
    { message: "Take it one moment at a time. Your body knows how to heal.", action: "Gentle breathing or rest" }
  ],
  tired: [
    { message: "Sit down, put your feet up, and breathe. You deserve this pause.", action: "Rest and restore" },
    { message: "Take a nap — even 15-20 minutes will help restore your energy.", action: "Power nap reminder" },
    { message: "Find a spot in nature — sit on the grass, rest under a tree, just be outside for a few minutes.", action: "Nature rest break" },
    { message: "Lie down somewhere comfortable. Close your eyes. Let your body rest.", action: "Permission to nap", link: "/mindfulness?scrollTo=gratitude", linkText: "Evening Meditation" },
    { message: "Put your feet up. Sit somewhere cozy. Let yourself be still for 10 minutes.", action: "Gentle rest" }
  ],
  energized: [
    { message: "That energy is beautiful! Channel it into something that lights you up.", action: "Movement or creative activity" },
    { message: "Ride this wave — your body is in flow. Use it wisely.", action: "Productive action or exercise" },
    { message: "High energy is a gift. Let's make the most of it.", action: "Movement, creation, or connection" },
    { message: "You're buzzing with life! What will you create today?", action: "Choose an energizing action" },
    { message: "This is your moment. Move, create, connect — let it flow.", action: "Harness the momentum" }
  ],
  confused: [
    { message: "Confusion is okay. Sometimes clarity needs space to arrive.", action: "Gentle pause or journaling" },
    { message: "You don't need all the answers right now. Breathe and trust the process.", action: "Grounding exercise or walk" },
    { message: "Let the fog settle. Clarity will come when you're ready.", action: "Reflection or quiet time" },
    { message: "It's okay not to know. Give yourself permission to figure it out slowly.", action: "Patient self-talk" },
    { message: "Confusion means you're processing. Trust that answers will surface.", action: "Mindful pause or journaling" }
  ],
  overwhelmed: [
    { message: "Overwhelm is real. Let's break it down — one tiny step at a time.", action: "Simplify and prioritize", link: "/quick-stress-relief", linkText: "Try Grounding Exercise" },
    { message: "You don't have to do it all at once. Pick one small thing and start there.", action: "Choose one next step", link: "/quick-stress-relief", linkText: "Calm Your Nervous System" },
    { message: "Take a breath. You're safe. Let's sort this together.", action: "Pause and prioritize", link: "/quick-stress-relief", linkText: "Start Breathing Exercise" },
    { message: "Feeling buried? That's the signal to step back and breathe first.", action: "Reset with breath", link: "/quick-stress-relief", linkText: "Quick Stress Relief" },
    { message: "Overwhelm shrinks when you name it. What's the smallest next step?", action: "Micro-action focus", link: "/quick-stress-relief", linkText: "Try Grounding Exercise" }
  ],
  burntout: [],
  content: [],
  reflective: [],
  grieving: [
    { message: "Grief is love that has nowhere to go. It's tender, raw, and sacred. You are allowed to feel it fully. May you be surrounded by gentleness, and may your heart find space to breathe again.", action: "Sacred grief acknowledgment", link: "/quick-stress-relief", linkText: "Find Gentle Support" }
  ]
};

export function getRandomSupportiveResponse(mood: string): SupportiveResponse | null {
  const responses = supportiveResponses[mood.toLowerCase()];
  if (!responses || responses.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}
