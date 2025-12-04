// Emotional Reflection - Local on-device sentiment analysis
// Privacy-first: No data stored, just gentle real-time feedback

interface SentimentResult {
  tone: 'grounded' | 'hopeful' | 'heavy' | 'peaceful' | 'energized' | 'celebratory' | 'thoughtful';
  message: string;
}

// Simple keyword-based sentiment analysis (local, no external API)
export function analyzeSentiment(text: string): SentimentResult {
  const lowerText = text.toLowerCase();

  // Positive/grounded indicators
  const groundedWords = ['grateful', 'thankful', 'peaceful', 'calm', 'balanced', 'good', 'better', 'progress', 'growing', 'steady', 'centered', 'enjoyed', 'enjoyed myself', 'had fun', 'fun time', 'great meal', 'dinner was great', 'delicious', 'tasty'];
  const hopefulWords = ['hope', 'hoping', 'trying', 'learning', 'starting', 'beginning', 'will', 'can', 'possible', 'maybe', 'wish'];
  const energizedWords = ['excited', 'motivated', 'ready', 'energized', 'strong', 'confident', 'pumped', 'amazing', 'great'];
  const peacefulWords = ['rest', 'resting', 'quiet', 'gentle', 'soft', 'ease', 'breath', 'breathing', 'mindful', 'still', 'settled'];
  const celebratoryWords = ['birthday', 'anniversary', 'celebrate', 'celebrating', 'achieved', 'accomplished', 'won', 'success', 'milestone', 'proud', 'graduation', 'graduated', 'baby', 'promotion', 'promoted', 'got promoted', 'engaged', 'got engaged', 'engagement', 'popped the question', 'she said yes', 'he said yes', 'wedding', 'wedding day', 'married', 'new job', 'bought a home', 'bought a house', 'sold a home', 'sold a house', 'vacation', 'holiday', 'christmas', 'new year', 'thanksgiving', 'bought my first', 'out of hospital', 'back home', 'first day home', 'i passed', 'i made it', 'made it'];
  
  // Heavy/challenging indicators
  const heavyWords = ['struggle', 'struggling', 'hard', 'difficult', 'overwhelming', 'tired', 'exhausted', 'stressed', 'anxious', 'worried', 'lost', 'losing', 'grief', 'sad', 'upset', 'alone', 'lonely', 'hurt', 'hurting', 'pain', 'painful', 'scared', 'afraid', 'broken', 'sick', 'feel sick', 'is sick', 'child is sick', 'family member is', 'ill', 'cold', 'numb', 'empty', 'hopeless', 'helpless', 'moving out', 'moving in', 'packing', 'unpacking', 'death', 'died', 'passed away', 'funeral', 'mourning', 'in hospital', 'in the hospital', 'i failed', 'failed', 'disappointed', 'disappointment', 'too much snow', 'too hot', 'soaking wet', 'freezing', 'burning up', 'did not like', 'didn\'t like', 'too much to drink', 'drank too much', 'regret', 'hung over', 'hangover', 'car broke down', 'car broke', 'won\'t start', 'wont start', 'snowed in', 'stuck', 'stranded', 'hungry', 'starving', 'broke', 'no money', 'can\'t afford', 'cant afford', 'can\'t pay', 'cant pay', 'pay the rent', 'pay the mortgage', 'pay the bill', 'financial trouble', 'debt', 'bills', 'eviction', 'eviction notice', 'foreclosure'];
  
  // Count occurrences
  const groundedCount = groundedWords.filter(word => lowerText.includes(word)).length;
  const hopefulCount = hopefulWords.filter(word => lowerText.includes(word)).length;
  const energizedCount = energizedWords.filter(word => lowerText.includes(word)).length;
  const peacefulCount = peacefulWords.filter(word => lowerText.includes(word)).length;
  const celebratoryCount = celebratoryWords.filter(word => lowerText.includes(word)).length;
  const heavyCount = heavyWords.filter(word => lowerText.includes(word)).length;

  // Determine predominant tone - prioritize specific emotions over general ones
  if (celebratoryCount > 0) {
    return {
      tone: 'celebratory',
      message: "What a beautiful moment to celebrate! Wishing you joy and warmth today. 🎉"
    };
  }
  
  if (heavyCount > 0) {
    return {
      tone: 'heavy',
      message: "That seems like a lot to carry — thank you for sharing."
    };
  }
  
  if (energizedCount > 0) {
    return {
      tone: 'energized',
      message: "Your energy feels bright — wonderful to see."
    };
  }
  
  if (peacefulCount > 0) {
    return {
      tone: 'peaceful',
      message: "There's a quiet peace in your reflection."
    };
  }
  
  if (hopefulCount > 0) {
    return {
      tone: 'hopeful',
      message: "There's a gentle hope in your words — keep nurturing it."
    };
  }
  
  if (groundedCount > 0) {
    return {
      tone: 'grounded',
      message: "You sound grounded today."
    };
  }
  
  // Default neutral response
  return {
    tone: 'thoughtful',
    message: "Thank you for sharing this moment with the community."
  };
}

// Get gentle affirmation based on mood
export function getMoodAffirmation(mood?: string): string {
  if (!mood) return "Your feelings are valid.";
  
  const moodResponses: Record<string, string> = {
    calm: "Beautiful — keep honoring this calm.",
    peaceful: "This peace is yours to nurture.",
    energized: "Ride this energy with gentle awareness.",
    tired: "Rest is part of the rhythm. Be kind to yourself.",
    stressed: "Take a breath. You're doing what you can.",
    anxious: "Pause here. You're safe in this moment.",
    hopeful: "Hope is a powerful companion.",
    grateful: "Gratitude opens the heart.",
  };
  
  return moodResponses[mood.toLowerCase()] || "Your feelings matter.";
}
