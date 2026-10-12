# Standalone WhatsApp Interactive Simulator & Learning Module

A completely self-contained, interactive WhatsApp simulation and learning engine with guided demos, hands-on practice, and voice narration.

---

## 📦 What is Included?

1. **`WhatsAppTutorialScreen.tsx`**:
   - Complete WhatsApp Mobile App UI mockup (Top Bar, Chats tab, Status tab, Calls tab, New Contact FAB, Android status bar).
   - All sub-screens:
     - **Home Chat List** (with realistic chats, unread badges, timestamps)
     - **New Contact Creator** (with name, phone, save confirmation)
     - **Contact Search** (live filter, search result tapping)
     - **Chat Conversation View** (message bubbles, timestamps, double blue checkmarks)
     - **Interactive Attachment Action Sheet** (Paperclip modal: Photos, Documents, Location, Contact)
     - **Sample Photo Picker** (realistic gallery preview & photo send)
     - **Live Location Sharing Screen** (interactive map view card & send button)
     - **Voice & Video Call Simulator** (real-time calling screen with speaker, mute, video toggle, and red end-call button)
   - **Interactive Auto-Play Demo Mode**:
     - Animated finger pointer (`MousePointer`) with ripple tap animations.
     - Automated typing animation character-by-character.
     - Auto-screen navigation matching real user flows.
     - Pause, resume, and "Stop - Let Me Try" controls.
   - **Interactive Practice / Test Mode**:
     - Learner performs the real actions on the screen unaided.
     - Smart wrong-tap feedback & mistake counter.
     - 8-Second Idle guidance: automatically highlights the target button if the user hesitates.
     - Interactive celebration / completion card upon finishing each lesson.
   - **Voice Narration (Selvi)**:
     - Web Speech API integration with support for English, Tamil, and Hindi.
     - Non-blocking async speech synthesis.

2. **`whatsappLessons.ts`**:
   - The 5 curriculum lessons:
     1. Save a new contact
     2. Search for a person and send a message
     3. Send a photo from gallery
     4. Send live location
     5. Make and manage voice & video calls

3. **`voice.ts`**:
   - Zero-dependency SpeechSynthesis utility with automatic language voice fallback, pause, cancel, and mute controls.

---

## 🚀 How to use in any React / Next.js / Vite Web App

### 1. Install Dependencies
```bash
npm install lucide-react
```

### 2. Ensure Tailwind CSS is configured
The UI uses Tailwind utility classes (`bg-[#008069]`, `flex`, `rounded-full`, etc.). Ensure your `index.css` or Tailwind setup is active.

### 3. Copy the Folder
Copy the `standalone-whatsapp/` folder into your new project's `src/components/` directory.

### 4. Render the Component
```tsx
import React from 'react';
import { WhatsAppTutorialScreen } from './components/standalone-whatsapp';

export default function App() {
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <WhatsAppTutorialScreen 
        onBackToMainMenu={() => {
          console.log('User exited WhatsApp simulator');
        }}
      />
    </main>
  );
}
```
