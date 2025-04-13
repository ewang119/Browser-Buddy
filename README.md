# Browser Buddy

The FIRST (probably) Chrome extension that actually holds you accountable for web wellness!

## Features

- Choose your own pet companion to join you on your web adventure
- Mindfulness Tarot Draw feature powered by Gemini AI
- Take web surfing breaks to keep your pet well and gain prestige, but your pet may suffer otherwise...

## Mindfulness Powered by Gemini AI

### Tarot Draw (Mindfulness Magic)

When you're feeling stuck, anxious, or just need a moment, click the ✨ Tarot Draw button. The feature uses Gemini AI to generate gentle metaphors, journal prompts, or grounding phrases based on:

- Your pet's emotional state
- Your recent habits
- Time of day

Example readings:
- "You drew: The Stilled Wind — Sometimes, stillness is the loudest kind of progress."
- "A reflection: What would rest look like if you treated it like your most sacred task today?"

The readings are designed to be poetic and reflective rather than advice-giving, combining AI with metaphoric language for mental health support.

## How to download our amazing extension...

### Prerequisites

- Node.js (v16 or higher)
- Chrome browser
- Gemini API key (for Tarot Draw feature)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Build the extension:
   ```bash
   npm run build
   ```
5. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` directory

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## License

MIT
