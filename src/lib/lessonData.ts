// Lesson data definitions for FirstTap
// Write all say lines in English, Tamil and Hindi; mark Tamil and Hindi "// REVIEW by native speaker"

export interface Step {
  id: string;
  say: {
    en: string;
    ta: string; // REVIEW by native speaker
    hi: string; // REVIEW by native speaker
  };
  do: 'point' | 'tap' | 'type' | 'hold';
  target?: string;
  text?: string;
  practiceText?: string;
  duration?: number;
}

export interface Lesson {
  id: string;
  title: {
    en: string;
    ta: string; // REVIEW by native speaker
    hi: string; // REVIEW by native speaker
  };
  steps: Step[];
}

export const LESSON_1_SEND_MONEY: Lesson = {
  id: 'lesson_1_send_money',
  title: {
    en: 'Lesson 1: Send Money',
    ta: 'பாடம் 1: பணம் அனுப்புதல்', // REVIEW by native speaker
    hi: 'पाठ 1: पैसे भेजना', // REVIEW by native speaker
  },
  steps: [
    // 1. point: the home page. Selvi: "This is the home page." Point at the balance card, then the tile grid.
    {
      id: 'step_1_home_point',
      say: {
        en: 'This is the home page. Here you can check your balance and all actions.',
        ta: 'இது முகப்பு பக்கம். இங்கு உங்கள் வங்கி இருப்பையும் சேவைகளையும் காணலாம்.', // REVIEW by native speaker
        hi: 'यह मुख्य पृष्ठ है। यहाँ आप अपना बैलेंस और सभी सेवाएँ देख सकते हैं।', // REVIEW by native speaker
      },
      do: 'point',
      target: 'balance-card',
      duration: 3200,
    },
    {
      id: 'step_1b_grid_point',
      say: {
        en: 'Here is the action grid to send money, recharge, and pay bills.',
        ta: 'பணம் அனுப்ப, ரீசார்ஜ் செய்ய மற்றும் கட்டணங்கள் செலுத்த இங்குள்ள கட்டங்களைப் பயன்படுத்தலாம்.', // REVIEW by native speaker
        hi: 'पैसे भेजने, रिचार्ज करने और बिल भरने के लिए इस ग्रिड का उपयोग करें।', // REVIEW by native speaker
      },
      do: 'point',
      target: 'tile-grid',
      duration: 2800,
    },
    // 2. Selvi: "Now I will teach you how to send money to someone." tap tile-send-money
    {
      id: 'step_2_tap_send_money',
      say: {
        en: 'Now I will teach you how to send money to someone.',
        ta: 'இப்போது ஒருவருக்கு பணம் எப்படி அனுப்புவது என்று கற்றுத் தருகிறேன்.', // REVIEW by native speaker
        hi: 'अब मैं आपको किसी को पैसे भेजना सिखाऊँगी।', // REVIEW by native speaker
      },
      do: 'tap',
      target: 'tile-send-money',
      duration: 2200,
    },
    // 3. Screen "Send to a phone number". Selvi: "Type the person's phone number." type 9000000000
    {
      id: 'step_3_type_phone',
      say: {
        en: "Type the person's phone number.",
        ta: 'பணம் பெற வேண்டிய நபரின் தொலைபேசி எண்ணை தட்டச்சு செய்யுங்கள்.', // REVIEW by native speaker
        hi: 'जिस व्यक्ति को पैसे भेजने हैं, उनका फोन नंबर टाइप करें।', // REVIEW by native speaker
      },
      do: 'type',
      target: 'phone-input',
      text: '9000000000',
      practiceText: '9000000000',
      duration: 4800,
    },
    // 4. When 10 digits are typed, the app shows a contact card with the name "Ravi". Selvi: "The app shows the name for this number. Check it is the right person." tap contact-ravi
    {
      id: 'step_4_check_and_tap_ravi',
      say: {
        en: 'The app shows the name for this number. Check it is the right person.',
        ta: 'இந்த எண்ணிற்குரிய நபரின் பெயர் தெரிகிறது. சரியான நபர்தானா என்று சரிபார்த்து தொடவும்.', // REVIEW by native speaker
        hi: 'ऐप इस नंबर का नाम दिखा रहा है। सही व्यक्ति की पुष्टि करके टैप करें।', // REVIEW by native speaker
      },
      do: 'tap',
      target: 'contact-ravi',
      duration: 2800,
    },
    // 5. Amount screen with a keypad. type 100 in the demo, practiceText 50.
    {
      id: 'step_5_type_amount',
      say: {
        en: 'Type the amount you want to send.',
        ta: 'அனுப்ப வேண்டிய தொகையை தட்டச்சு செய்யுங்கள்.', // REVIEW by native speaker
        hi: 'जितनी राशि भेजनी है, उसे टाइप करें।', // REVIEW by native speaker
      },
      do: 'type',
      target: 'amount-display',
      text: '100',
      practiceText: '50',
      duration: 3000,
    },
    // 6. After an amount is typed, a "Pay" bar slides up at the bottom. tap pay-btn
    {
      id: 'step_6_tap_pay',
      say: {
        en: 'Check the name and amount, then tap Pay.',
        ta: 'பெயர் மற்றும் தொகையை சரிபார்த்து Pay என்பதைத் தொடவும்.', // REVIEW by native speaker
        hi: 'नाम और राशि जांचें, फिर Pay पर टैप करें।', // REVIEW by native speaker
      },
      do: 'tap',
      target: 'pay-btn',
      duration: 2400,
    },
    // 7. PIN screen with 4 dots (masked) and a keypad. type 1234. Selvi: "Use your own PIN only to send money, and never tell anyone."
    {
      id: 'step_7_type_pin',
      say: {
        en: 'Use your own PIN only to send money, and never tell anyone.',
        ta: 'பணம் அனுப்ப மட்டுமே உங்கள் PIN பயன்படுத்தவும், யாருக்கும் சொல்ல வேண்டாம்.', // REVIEW by native speaker
        hi: 'पैसे भेजते समय ही अपना पिन डालें, और किसी को न बताएं।', // REVIEW by native speaker
      },
      do: 'type',
      target: 'pin-dots',
      text: '1234',
      practiceText: '1234',
      duration: 3600,
    },
    // 8. Success screen "Money sent (practice)".
    {
      id: 'step_8_success',
      say: {
        en: 'Well done! Money is sent safely.',
        ta: 'மிக நன்று! பணம் பாதுகாப்பாக அனுப்பப்பட்டது.', // REVIEW by native speaker
        hi: 'बहुत बढ़िया! पैसे सुरक्षित रूप से भेज दिए गए।', // REVIEW by native speaker
      },
      do: 'point',
      target: 'success-card',
      duration: 3500,
    },
  ],
};
