// MindEase interactive behaviors
// Handles: mobile nav toggle, smooth scrolling, mood modal, mood feedback, guided breathing, mood-responsive animations

// ----- Mood State & Background Animation Manager -----
class MoodAnimationManager {
  constructor() {
    this.currentMood = localStorage.getItem('currentMood') || null;
    this.moodColorMap = {
      'Happy': '#FFD700',
      'Calm': '#87CEEB',
      'Stressed': '#D3D3D3',
      'Anxious': '#B0C4DE'
    };
    
    // Initialize with saved mood if exists
    if (this.currentMood) {
      this.setMood(this.currentMood);
    }
  }

  setMood(mood) {
    // Remove all mood classes
    document.body.classList.remove('mood-happy', 'mood-calm', 'mood-stressed', 'mood-anxious');
    
    // Add the new mood class
    const moodClass = `mood-${mood.toLowerCase()}`;
    document.body.classList.add(moodClass);
    
    // Save to local storage
    this.currentMood = mood;
    localStorage.setItem('currentMood', mood);
  }

  getCurrentMood() {
    return this.currentMood;
  }
}

// Initialize mood animation manager
const moodAnimationManager = new MoodAnimationManager();

// ----- Mobile navbar toggle -----
const mobileToggle = document.getElementById('mobile-toggle');
const mobileMenu = document.getElementById('mobile-menu');

mobileToggle?.addEventListener('click', () => {
  const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
  mobileToggle.setAttribute('aria-expanded', String(!expanded));
  mobileMenu.classList.toggle('hidden');
});

// Close mobile menu when a link is clicked (improves UX)
document.querySelectorAll('#mobile-menu a, #mobile-menu button').forEach(el => {
  el.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    mobileToggle.setAttribute('aria-expanded', 'false');
  });
});

// ----- Smooth scrolling for nav & CTAs -----
function enableSmoothScroll() {
  const scrollLinks = document.querySelectorAll('a[href^="#"], button[data-target]');
  scrollLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetSelector = link.getAttribute('href') || link.dataset.target;
      if (!targetSelector || !targetSelector.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(targetSelector);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}
enableSmoothScroll();

// Also wire hero and other CTA buttons that are not anchors
document.querySelectorAll('button[data-target]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = document.querySelector(btn.dataset.target);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ----- Mood modal and feedback -----
const moodBtn = document.getElementById('mood-btn');
const moodModal = document.getElementById('mood-modal');
const moodOverlay = document.getElementById('mood-overlay');
const moodClose = document.getElementById('mood-close');
const moodFeedback = document.getElementById('mood-feedback');

function openMoodModal() {
  moodModal.classList.remove('hidden');
  moodModal.setAttribute('aria-hidden', 'false');
  // trap focus briefly (simple)
  const firstBtn = moodModal.querySelector('.mood-option');
  firstBtn?.focus();
}

function closeMoodModal() {
  moodModal.classList.add('hidden');
  moodModal.setAttribute('aria-hidden', 'true');
  moodBtn?.focus();
}

moodBtn?.addEventListener('click', openMoodModal);
moodClose?.addEventListener('click', closeMoodModal);
moodOverlay?.addEventListener('click', closeMoodModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !moodModal.classList.contains('hidden')) closeMoodModal();
});

// Mood selection feedback
const moodOptions = document.querySelectorAll('.mood-option');
const moodMessages = {
  'Happy': "That's wonderful — keep noticing what helps you feel good.",
  'Calm': "Great — staying grounded is powerful. Keep it up.",
  'Stressed': "Sorry you're feeling stressed — try a short breathing exercise.",
  'Anxious': "It's okay to feel anxious. Small steps can help — try the breathing tool."
};
moodOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    const mood = btn.dataset.mood;
    const message = moodMessages[mood] || "Thanks for checking in.";
    moodFeedback.textContent = `${mood} — ${message}`;
    
    // Trigger mood-responsive background animation
    moodAnimationManager.setMood(mood);
    
    closeMoodModal();
    gamificationManager.recordCheckIn(mood);
  });
});

// ----- Gamification Manager -----
class GamificationManager {
  constructor() {
    this.storageKey = 'mindease_progress';
    this.data = this.loadProgress();
    this.updateStreakDisplay();
  }

  loadProgress() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      checkIns: [],
      exercises: [],
      lastCheckInDate: null
    };
  }

  saveProgress() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  recordCheckIn(mood) {
    const today = this.getTodayDate();
    
    // Check if already checked in today
    if (this.data.lastCheckInDate === today) {
      this.showEncouragement("You've already checked in today. Keep it up! 💙");
      return;
    }

    // Add check-in
    this.data.checkIns.push({ date: today, mood });
    this.data.lastCheckInDate = today;
    this.saveProgress();

    // Calculate streak and show feedback
    const streak = this.calculateStreak();
    this.showCelebration(streak);
    this.updateStreakDisplay();
  }

  recordExercise(duration = 1) {
    const today = this.getTodayDate();
    this.data.exercises.push({ date: today, duration });
    this.saveProgress();
    
    const weekCount = this.getWeeklyExerciseCount();
    this.showEncouragement(`Great work! You've completed ${weekCount} exercise${weekCount !== 1 ? 's' : ''} this week. 🌟`);
    this.updateStreakDisplay();
  }

  calculateStreak() {
    if (this.data.checkIns.length === 0) return 0;

    let streak = 1;
    const today = new Date(this.getTodayDate());

    for (let i = this.data.checkIns.length - 1; i > 0; i--) {
      const currentDate = new Date(this.data.checkIns[i].date);
      const previousDate = new Date(this.data.checkIns[i - 1].date);
      
      const diffTime = currentDate - previousDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  getWeeklyExerciseCount() {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return this.data.exercises.filter(ex => {
      const exDate = new Date(ex.date);
      return exDate >= weekAgo && exDate <= today;
    }).length;
  }

  updateStreakDisplay() {
    const streak = this.calculateStreak();
    const streakCountEl = document.getElementById('streak-count');
    const weekExercises = this.getWeeklyExerciseCount();

    if (streakCountEl) {
      const streakText = streak > 0 
        ? `${streak}-day streak`
        : 'Start your journey';
      streakCountEl.textContent = streakText;
    }

    // Update visual state
    const streakBadge = document.getElementById('streak-badge');
    if (streakBadge) {
      if (streak >= 7) {
        streakBadge.className = 'flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-sm font-medium text-purple-800';
      } else if (streak >= 3) {
        streakBadge.className = 'flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-sm font-medium text-orange-800';
      } else {
        streakBadge.className = 'flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-sm font-medium text-amber-800';
      }
    }
  }

  showCelebration(streak) {
    this.createConfetti();

    let message = 'Awesome! You checked in today. 🎉';
    
    if (streak === 3) {
      message = '🔥 3-day streak! You\'re building momentum!';
    } else if (streak === 7) {
      message = '⭐ One-week streak! You\'re a wellness champion!';
    } else if (streak === 14) {
      message = '✨ Two-week streak! Incredible consistency!';
    } else if (streak === 30) {
      message = '👑 30-day streak! You\'ve transformed your habits!';
    } else if (streak > 1) {
      message = `🌟 ${streak}-day streak! Keep it going!`;
    }

    this.showEncouragement(message);
  }

  showEncouragement(message) {
    const msgEl = document.getElementById('encouragement-message');
    if (!msgEl) return;

    msgEl.textContent = message;
    msgEl.classList.remove('hidden');

    // Fade out after 4 seconds
    setTimeout(() => {
      msgEl.classList.add('hidden');
    }, 4000);
  }

  createConfetti() {
    // Create subtle confetti effect
    const colors = ['#06b6d4', '#14b8a6', '#f59e0b', '#8b5cf6'];
    
    for (let i = 0; i < 15; i++) {
      const confetti = document.createElement('div');
      const size = Math.random() * 8 + 4;
      const duration = Math.random() * 1.5 + 1.5;
      const xOffset = (Math.random() - 0.5) * 200;
      const delay = Math.random() * 0.2;

      confetti.style.cssText = `
        position: fixed;
        left: 50%;
        top: 50%;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: confetti-fall ${duration}s ease-out ${delay}s forwards;
      `;

      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), (duration + delay) * 1000);
    }
  }
}

// Add confetti animation to styles
const style = document.createElement('style');
style.textContent = `
  @keyframes confetti-fall {
    0% {
      transform: translate(0, 0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translate(var(--tx, 0px), 150px) rotate(720deg);
      opacity: 0;
    }
  }
  @property --tx {
    syntax: '<length>';
    initial-value: 0px;
    inherits: false;
  }
`;
document.head.appendChild(style);

// Initialize gamification manager
const gamificationManager = new GamificationManager();

// ----- Audio Manager for Breathing Sounds -----
class BreathingAudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.soundEnabled = localStorage.getItem('breathingSound') !== 'false'; // default: on
  }

  setupAudioContext() {
    // Create audio context on user interaction (browser autoplay policy)
    if (!this.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      try {
        this.audioContext = new AudioContext();
        
        // Resume if suspended (required in some browsers)
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }

        // Create master gain node
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 1.0;
        this.masterGain.connect(this.audioContext.destination);
      } catch (e) {
        console.log('Web Audio API not supported');
      }
    }
  }

  playTone(frequency, duration, type = 'sine', volume = 1.0) {
    if (!this.soundEnabled || !this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      oscillator.connect(gain);
      gain.connect(this.masterGain);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      // Fade in and out
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.05);
      gain.gain.linearRampToValueAtTime(volume, now + duration - 0.1);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (e) {
      console.log('Error playing tone:', e);
    }
  }

  playInhaleSound() {
    // Speak "Inhale" using Web Speech API
    if (!this.soundEnabled) return;
    try {
      const utterance = new SpeechSynthesisUtterance('Inhale');
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      speechSynthesis.cancel(); // Cancel any previous speech
      speechSynthesis.speak(utterance);
    } catch (e) {
      console.log('Error playing inhale sound:', e);
    }
  }

  playExhaleSound() {
    // Speak "Exhale" using Web Speech API
    if (!this.soundEnabled) return;
    try {
      const utterance = new SpeechSynthesisUtterance('Exhale');
      utterance.rate = 0.9;
      utterance.pitch = 0.9;
      utterance.volume = 0.8;
      speechSynthesis.cancel(); // Cancel any previous speech
      speechSynthesis.speak(utterance);
    } catch (e) {
      console.log('Error playing exhale sound:', e);
    }
  }

  playStartClick() {
    // Soft chime on start
    this.playTone(600, 0.15, 'sine', 1.0);
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('breathingSound', this.soundEnabled ? 'true' : 'false');
    return this.soundEnabled;
  }
}

const audioManager = new BreathingAudioManager();

// ----- Guided Breathing Exercise -----
const breathState = document.getElementById('breath-state');
const breathTimer = document.getElementById('breath-timer');
const breathRing = document.getElementById('breath-ring');
const breathStart = document.getElementById('breath-start');
const breathStop = document.getElementById('breath-stop');
const breathSoundToggle = document.getElementById('breath-sound-toggle');
const soundIcon = document.getElementById('sound-icon');
const soundStatus = document.getElementById('sound-status');

let breathing = false;
let breathTimeout = null;
let cycleIndex = 0;

// Define cycle steps with durations (seconds)
const cycle = [
  { name: 'Inhale', duration: 4 },
  { name: 'Hold', duration: 4 },
  { name: 'Exhale', duration: 6 }
];

function updateRing(progressPercent) {
  // scale ring for a subtle visual cue
  const scale = 0.6 + (progressPercent / 100) * 0.8; // from 0.6 to 1.4
  if (breathRing) breathRing.style.transform = `scale(${scale})`;
}

function startBreathing() {
  if (breathing) return;
  breathing = true;
  cycleIndex = 0;
  audioManager.setupAudioContext();
  audioManager.playStartClick();
  runCycleStep();
}

function stopBreathing() {
  breathing = false;
  clearTimeout(breathTimeout);
  breathState.textContent = 'Stopped';
  breathTimer.textContent = '--';
  updateRing(0);
  
  // Record exercise if it lasted more than 30 seconds
  if (cycleIndex > 0) {
    gamificationManager.recordExercise(1);
  }
}

function runCycleStep() {
  if (!breathing) return;
  const step = cycle[cycleIndex];
  let remaining = step.duration;
  breathState.textContent = step.name;
  breathTimer.textContent = `${remaining}s`;

  // Play sound at start of Inhale and Exhale
  if (step.name === 'Inhale') {
    audioManager.playInhaleSound();
  } else if (step.name === 'Exhale') {
    audioManager.playExhaleSound();
  }

  const start = Date.now();
  function tick() {
    if (!breathing) return;
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const timeLeft = Math.max(0, step.duration - elapsed);
    breathTimer.textContent = `${timeLeft}s`;
    const progress = ((elapsed) / step.duration) * 100;
    updateRing(progress);

    if (timeLeft <= 0) {
      cycleIndex = (cycleIndex + 1) % cycle.length;
      breathTimeout = setTimeout(runCycleStep, 300); // small gap before next
    } else {
      breathTimeout = setTimeout(tick, 250);
    }
  }
  tick();
}

breathStart?.addEventListener('click', () => {
  startBreathing();
});
breathStop?.addEventListener('click', () => {
  stopBreathing();
});

// Sound toggle handler
breathSoundToggle?.addEventListener('click', () => {
  const isEnabled = audioManager.toggleSound();
  soundStatus.textContent = isEnabled ? 'On' : 'Off';
  soundIcon.style.opacity = isEnabled ? '1' : '0.5';
  audioManager.setupAudioContext(); // Ensure context is ready
});

// Initialize audio context on any user interaction
document.addEventListener('click', () => {
  audioManager.setupAudioContext();
}, { once: true });

// Clean up on page hide/unload
window.addEventListener('pagehide', () => {
  stopBreathing();
});

// ===== MindEase Chatbot Assistant =====
class ChatbotAssistant {
  constructor() {
    this.chatContainer = document.getElementById('chatbot-container');
    this.chatToggle = document.getElementById('chatbot-toggle');
    this.chatClose = document.getElementById('chatbot-close');
    this.chatMessages = document.getElementById('chat-messages');
    this.chatInput = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('send-btn');
    this.voiceBtn = document.getElementById('voice-btn');
    this.voiceIndicator = document.getElementById('voice-indicator');
    this.isListening = false;
    this.recognition = null;

    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.setupSpeechRecognition();
    } else {
      this.voiceBtn.disabled = true;
      this.voiceBtn.title = 'Voice input not supported in your browser';
    }

    this.init();
  }

  init() {
    // Ensure all elements exist before attaching listeners
    if (!this.chatToggle) {
      console.warn('chatbot-toggle button not found');
      return;
    }

    this.chatToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleChat();
    });
    
    this.chatClose?.addEventListener('click', () => this.closeChat());
    this.sendBtn?.addEventListener('click', () => this.sendMessage());
    this.voiceBtn?.addEventListener('click', () => this.toggleVoice());
    this.chatInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Close chat when clicking outside
    document.addEventListener('click', (e) => {
      const widget = document.getElementById('chatbot-widget');
      if (widget && !widget.contains(e.target) && this.chatContainer && this.chatContainer.classList.contains('flex')) {
        this.closeChat();
      }
    });
  }

  setupSpeechRecognition() {
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.voiceIndicator.classList.remove('hidden');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.voiceIndicator.classList.add('hidden');
    };

    this.recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      this.chatInput.value = transcript;
      this.sendMessage();
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.voiceIndicator.classList.add('hidden');
      this.isListening = false;
      if (event.error !== 'no-speech') {
        this.addBotMessage('Sorry, I had trouble hearing you. Please try typing instead.');
      }
    };
  }

  toggleVoice() {
    if (!this.recognition) return;
    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.chatInput.value = '';
      this.recognition.start();
    }
  }

  toggleChat() {
    const isHidden = this.chatContainer.classList.contains('hidden');
    if (isHidden) {
      // Open chat
      this.chatContainer.classList.remove('hidden');
      this.chatContainer.classList.add('flex', 'flex-col');
      this.chatInput.focus();
    } else {
      // Close chat
      this.chatContainer.classList.add('hidden');
      this.chatContainer.classList.remove('flex', 'flex-col');
    }
  }

  closeChat() {
    this.chatContainer.classList.add('hidden');
    this.chatContainer.classList.remove('flex');
    if (this.isListening) {
      this.recognition.stop();
    }
  }

  sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;

    this.addUserMessage(message);
    this.chatInput.value = '';

    // Simulate bot thinking delay
    setTimeout(() => {
      const response = this.generateResponse(message.toLowerCase());
      this.addBotMessage(response);
    }, 500);
  }

  generateResponse(userMessage) {
    // Keyword-based responses for wellness support
    const keywords = {
      mood: 'How wonderful that you\'re checking in with your mood! Open the "How are you feeling today?" section to log your current feelings. Tracking patterns can help you understand what influences your wellbeing.',
      stress: "It's completely normal to feel stressed. Try our guided breathing exercise — even 2-3 minutes can help calm your nervous system. Remember, small steps add up.",
      anxiety: "Anxiety can feel overwhelming, but you're not alone. I recommend: 1) Try the guided breathing exercise for immediate relief, 2) Check in with your mood, 3) Take a short break. You've got this.",
      breath: 'The breathing exercise follows a simple cycle: Inhale for 4 seconds, Hold for 4 seconds, Exhale for 6 seconds. Repeat as many times as feels comfortable. This technique helps activate your body\'s relaxation response.',
      breathing: 'The breathing exercise follows a simple cycle: Inhale for 4 seconds, Hold for 4 seconds, Exhale for 6 seconds. Repeat as many times as feels comfortable. This technique helps activate your body\'s relaxation response.',
      sleep: 'Quality sleep is essential for mental health. Try a calming breathing session before bed, and aim for consistency. If sleep is challenging, consider tracking your mood to identify patterns.',
      help: 'I\'m here to support your mental wellness journey. I can help with: mood tracking tips, breathing exercises, stress management, anxiety relief, and general wellness advice. What would help you most right now?',
      thank: "You're welcome! Remember, taking care of your mental health is a gift to yourself. Keep using MindEase to build positive daily habits.",
      hello: "Hi! Welcome to MindEase. I'm here to support your mental wellness. How are you feeling today? Would you like to check your mood, try a breathing exercise, or just chat?",
      hi: "Hi! Welcome to MindEase. I'm here to support your mental wellness. How are you feeling today? Would you like to check your mood, try a breathing exercise, or just chat?"
    };

    // Check for keyword matches
    for (const [key, response] of Object.entries(keywords)) {
      if (userMessage.includes(key)) {
        return response;
      }
    }

    // Default supportive responses
    const defaults = [
      "That's important to share. Remember, your mental health matters. Is there anything specific I can help with—mood tracking, breathing, or just listening?",
      "I'm here to support you. Would you like to try a guided breathing exercise, check your mood, or just talk?",
      "Thank you for opening up. Taking time for yourself is a positive step. What can I help you with today?",
      "I hear you. Your wellbeing is my priority. Would exploring the features help—like mood tracking or breathing exercises?"
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  addUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex justify-end';
    msgDiv.innerHTML = `
      <div class="bg-teal-500 text-white rounded-lg p-3 shadow-sm max-w-xs">
        <p class="text-sm">${this.escapeHtml(text)}</p>
      </div>
    `;
    this.chatMessages.appendChild(msgDiv);
    this.scrollToBottom();
  }

  addBotMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex justify-start';
    msgDiv.innerHTML = `
      <div class="bg-white rounded-lg p-3 shadow-sm max-w-xs border border-slate-100">
        <p class="text-sm text-slate-700">${this.escapeHtml(text)}</p>
      </div>
    `;
    this.chatMessages.appendChild(msgDiv);
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize chatbot immediately (script is at end of HTML)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ChatbotAssistant();
  });
} else {
  new ChatbotAssistant();
}