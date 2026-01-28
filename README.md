# MindEase

MindEase is a calm, minimal single-page web application prototype for mental health and wellness. It provides simple daily tools like mood check-ins, guided breathing exercises, and an AI-like chatbot assistant to build small wellbeing habits.

## Key features

- **Mood Tracker**: Quick check-ins with friendly, supportive feedback
- **Guided Breathing**: Simple Inhale → Hold → Exhale cycles with visual feedback
- **Daily Check-ins & Progress Insights**: Track patterns and improvements
- **MindEase Assistant Chatbot**: Frontend-only conversational assistant
  - Text-based messaging for wellness support
  - Voice input using browser-based speech recognition
  - Empathetic, keyword-triggered responses
  - Supports queries about mood, stress, anxiety, breathing techniques, sleep, and general wellness
- **Calming Background Animation**: Subtle floating shapes with soft pastel colors that enhance the meditative atmosphere
- **Responsive Design**: Works seamlessly on mobile and desktop

## Tech stack

- **HTML**: Semantic, accessible structure
- **Tailwind CSS**: Utility-first styling via CDN (soft color palette: blues, teals, lavenders)
- **Vanilla JavaScript**: Pure frontend interactivity with no dependencies
- **Web Speech API**: Browser-native voice recognition for voice input

## Features in detail

### Background Animation
- **Four animated gradient blobs** (soft blues, teals, lavender, cyan)
- **Dual animation speeds**: 8-second and 12-second cycles for natural, organic motion
- **Screen blend mode**: Creates a glowing, layered effect
- **Responsive positioning**: Adapts to different screen sizes
- **Smooth transforms**: Uses CSS scale and translate for 60fps performance
- **Ambient atmosphere**: Moves gently in the background without distraction
- **Fully accessible**: Uses `pointer-events-none` to ensure UI interactivity

### MindEase Assistant Chatbot
- **Floating button** fixed at bottom-right corner
- Smooth open/close animation
- Supportive, empathetic responses
- Recognizes keywords like "stress", "anxiety", "breathing", "mood", "sleep"
- Graceful fallback messaging for unsupported browsers

### Voice + Text Interaction
- **Text input**: Type questions or reflections directly
- **Voice input**: Click the microphone button to speak naturally
  - Uses browser's native Web Speech API
  - Converts speech to text automatically
  - Displays listening indicator with pulsing animation
  - Handles errors gracefully
- Responses maintain a calm, supportive tone

### Accessibility & UX
- High contrast text and readable font sizes
- Keyboard navigation support (Enter to send messages)
- ARIA labels for screen readers
- No auto-opening of chatbot (user-initiated)
- Closing chat by clicking outside or the close button
- Escape key dismissal where applicable

## UX focus

- Clean, calming visual design with soft, pastel color palette
- Accessible components (ARIA attributes, keyboard-friendly interactions)
- Responsive layout with generous spacing for clarity and comfort
- Non-intrusive animations that enhance rather than distract
- Emotionally supportive microcopy throughout
- Modular, easy-to-understand code

## Usage

1. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
2. No build step or dependencies required
3. Click the floating chat button at the bottom-right to interact with MindEase Assistant
4. Use mood tracker, breathing exercises, and testimonials to explore features
5. Voice input is available where supported by the browser

## Browser compatibility

- ✅ Chrome/Edge 25+
- ✅ Firefox 25+
- ✅ Safari 14.1+
- ✅ Voice input: Modern browsers with Web Speech API support
- ⚠️ Voice input gracefully disabled in older/unsupported browsers

## File structure

```
MindEase/
├── index.html       # Main semantic HTML with chatbot UI
├── script.js        # Interactivity: nav, modal, breathing, chatbot, voice
└── README.md        # This file
```

---

*MindEase: Small daily actions for big mental health impacts.* 💙