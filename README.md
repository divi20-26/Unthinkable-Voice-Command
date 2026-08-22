# VoiceShopper — Voice Command Shopping Assistant

A voice-first shopping assistant that allows users to manage shopping lists naturally using voice commands, with smart recommendations and automatic product categorization.

---

## What It Does

VoiceShopper converts natural voice commands into shopping-list actions.

Examples:

* "Add 2 bottles of milk"
* "Buy 5 apples"
* "Remove bread"
* "Find organic apples under ₹300"

The application automatically extracts the product, quantity, category and relevant search constraints.

---

## Key Features

* Voice-based item addition and removal
* Natural language command processing
* Multilingual voice support
* Automatic product categorization
* Quantity management
* Voice and text-based product search
* Brand and price filtering
* Shopping-history recommendations
* Seasonal and sale suggestions
* Product substitutes
* Responsive mobile-friendly UI
* Loading, confirmation and error states

---

## Tech Stack

* React
* TypeScript
* Vite
* Browser Speech Recognition API
* Custom NLP parser
* Local product and recommendation data
* CSS / Responsive UI

---

## How to Run

```bash
git clone <your-repository-url>
cd VoiceShopper
npm install
npm run dev
```

Open the local URL shown in the terminal.

For voice transcription, create a `.env.local` file in the project root and add a Hugging Face User Access Token with inference permissions:

```bash
VITE_HUGGINGFACE_API_KEY=your_hugging_face_token
```

The microphone audio is sent to Hugging Face's `openai/whisper-large-v3-turbo` inference endpoint. Do not commit `.env.local` or expose a token with more permissions than needed.

---

## Project Structure

```text
src/
├── App.tsx
├── parser.ts
├── recommendations.ts
├── data.ts
├── types.ts
├── styles.css
└── components/
```

## Notes

Voice recognition depends on browser support and microphone permissions. The application is designed to provide a simple, voice-first shopping experience with automatic list updates.

