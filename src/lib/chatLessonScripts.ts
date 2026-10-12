// Lessons C0 to C8 JSON-based scripts for FirstTapMessage
// Tamil and Hindi lines: // REVIEW by native speaker

export interface LessonAction {
  type: 'point' | 'tap' | 'type' | 'wait' | 'toggle';
  targetId: string;
  textToType?: string;
  caption: {
    en: string;
    ta: string; // REVIEW by native speaker
    hi: string; // REVIEW by native speaker
  };
  voice: {
    en: string;
    ta: string; // REVIEW by native speaker
    hi: string; // REVIEW by native speaker
  };
  durationMs?: number;
  highlightOnly?: boolean;
}

export interface ChatLesson {
  id: 'C0' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C8';
  code: string;
  title: {
    en: string;
    ta: string; // REVIEW by native speaker
    hi: string; // REVIEW by native speaker
  };
  subtitle: {
    en: string;
    ta: string; // REVIEW by native speaker
    hi: string; // REVIEW by native speaker
  };
  initialSubStep: string;
  actions: LessonAction[];
  yourTurnPrompt: {
    en: string;
    ta: string; // REVIEW by native speaker
    hi: string; // REVIEW by native speaker
  };
  expectedActionTargetIds: string[];
}

export const CHAT_LESSONS: ChatLesson[] = [
  {
    id: 'C0',
    code: 'C0',
    title: {
      en: 'C0: Home Page Tour',
      ta: 'C0: முகப்பு பக்க அறிமுகம்', // REVIEW by native speaker
      hi: 'C0: होम पेज परिचय', // REVIEW by native speaker
    },
    subtitle: {
      en: 'Learn where your contacts, chats, search and calls are located.',
      ta: 'அரட்டைகள், அழைப்புகள் மற்றும் தேடல் எங்குள்ளது என்பதை அறியுங்கள்.', // REVIEW by native speaker
      hi: 'चैट्स, कॉल्स और सर्च कहां हैं, इसे समझें।', // REVIEW by native speaker
    },
    initialSubStep: 'CHAT_LIST',
    yourTurnPrompt: {
      en: 'Explore the home page by tapping the tabs and inspecting contacts.',
      ta: 'முகப்பு பக்கத்தை தொட்டு பார்த்து அறிந்துகொள்ளுங்கள்.', // REVIEW by native speaker
      hi: 'होम पेज को छूकर देखें और समझें।', // REVIEW by native speaker
    },
    expectedActionTargetIds: ['chat-list', 'chat-row-amma', 'tab-calls', 'tab-chats'],
    actions: [
      {
        type: 'point',
        targetId: 'chat-list',
        caption: {
          en: 'This is the home page of a chat app, like WhatsApp. Here is the list of your contacts and chats.',
          ta: 'இது வாட்ஸ்அப் போன்ற அரட்டை செயலியின் முகப்பு பக்கம். இங்கு உங்கள் அரட்டைகள் உள்ளன.', // REVIEW by native speaker
          hi: 'यह व्हाट्सएप जैसा चैट ऐप का मुख्य पृष्ठ है। यहाँ आपकी चैट सूची है।', // REVIEW by native speaker
        },
        voice: {
          en: 'This is the home page of a chat app, like WhatsApp. Here is the list of your contacts and chats.',
          ta: 'இது வாட்ஸ்அப் போன்ற அரட்டை செயலியின் முகப்பு பக்கம். இங்கு உங்கள் அரட்டைகள் உள்ளன.', // REVIEW by native speaker
          hi: 'यह व्हाट्सएप जैसा चैट ऐप का मुख्य पृष्ठ है। यहाँ आपकी चैट सूची है।', // REVIEW by native speaker
        },
        durationMs: 3400,
        highlightOnly: true,
      },
      {
        type: 'point',
        targetId: 'chat-row-amma',
        caption: {
          en: 'Each row shows the contact name, last message, time, and unread message count.',
          ta: 'ஒவ்வொரு வரிசையிலும் பெயர், கடைசி செய்தி, நேரம் மற்றும் படிக்காத செய்திகள் தெரியும்.', // REVIEW by native speaker
          hi: 'प्रत्येक पंक्ति में नाम, अंतिम संदेश, समय और बिना पढ़े संदेश दिखते हैं।', // REVIEW by native speaker
        },
        voice: {
          en: 'Each row shows the contact name, last message, time, and unread message count.',
          ta: 'ஒவ்வொரு வரிசையிலும் பெயர், கடைசி செய்தி, நேரம் மற்றும் படிக்காத செய்திகள் தெரியும்.', // REVIEW by native speaker
          hi: 'प्रत्येक पंक्ति में नाम, अंतिम संदेश, समय और बिना पढ़े संदेश दिखते हैं।', // REVIEW by native speaker
        },
        durationMs: 3200,
        highlightOnly: true,
      },
      {
        type: 'point',
        targetId: 'search-icon',
        caption: {
          en: 'Use this search icon to find any friend by name or phone number quickly.',
          ta: 'பெயர் அல்லது எண்ணை தட்டச்சு செய்து எளிதாக தேட இந்த தேடல் குறியீட்டை பயன்படுத்தலாம்.', // REVIEW by native speaker
          hi: 'किसी भी दोस्त को नाम या नंबर से खोजने के लिए इस सर्च आइकन का उपयोग करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Use this search icon to find any friend by name or phone number quickly.',
          ta: 'பெயர் அல்லது எண்ணை தட்டச்சு செய்து எளிதாக தேட இந்த தேடல் குறியீட்டை பயன்படுத்தலாம்.', // REVIEW by native speaker
          hi: 'किसी भी दोस्त को नाम या नंबर से खोजने के लिए इस सर्च आइकन का उपयोग करें।', // REVIEW by native speaker
        },
        durationMs: 3000,
        highlightOnly: true,
      },
      {
        type: 'point',
        targetId: 'new-chat-btn',
        caption: {
          en: 'This button starts a new chat or lets you add a new contact.',
          ta: 'இந்த பச்சை பொத்தான் மூலம் புதிய நபருக்கு செய்தி அனுப்பலாம் அல்லது எண் சேமிக்கலாம்.', // REVIEW by native speaker
          hi: 'इस बटन से आप नई चैट शुरू कर सकते हैं या नया नंबर जोड़ सकते हैं।', // REVIEW by native speaker
        },
        voice: {
          en: 'This button starts a new chat or lets you add a new contact.',
          ta: 'இந்த பச்சை பொத்தான் மூலம் புதிய நபருக்கு செய்தி அனுப்பலாம் அல்லது எண் சேமிக்கலாம்.', // REVIEW by native speaker
          hi: 'इस बटन से आप नई चैट शुरू कर सकते हैं या नया नंबर जोड़ सकते हैं।', // REVIEW by native speaker
        },
        durationMs: 3000,
        highlightOnly: true,
      },
      {
        type: 'point',
        targetId: 'tab-calls',
        caption: {
          en: 'These tabs let you switch between your Chats and Calls history.',
          ta: 'இந்த தாவல்கள் உங்கள் அரட்டைகள் மற்றும் அழைப்புகள் பட்டியலுக்கு இடையில் மாற உதவும்.', // REVIEW by native speaker
          hi: 'ये टैब आपको चैट्स और कॉल्स इतिहास के बीच बदलने की सुविधा देते हैं।', // REVIEW by native speaker
        },
        voice: {
          en: 'These tabs let you switch between your Chats and Calls history.',
          ta: 'இந்த தாவல்கள் உங்கள் அரட்டைகள் மற்றும் அழைப்புகள் பட்டியலுக்கு இடையில் மாற உதவும்.', // REVIEW by native speaker
          hi: 'ये टैब आपको चैट्स और कॉल्स इतिहास के बीच बदलने की सुविधा देते हैं।', // REVIEW by native speaker
        },
        durationMs: 3000,
        highlightOnly: true,
      },
      {
        type: 'point',
        targetId: 'chat-row-unknown',
        caption: {
          en: 'Be careful with messages from strangers or unknown numbers. Never share PIN or OTP.',
          ta: 'தெரியாத எண்களிலிருந்து வரும் செய்திகளிடம் எச்சரிக்கையாக இருங்கள். ஒருபோதும் PIN அல்லது OTP பகிர வேண்டாம்.', // REVIEW by native speaker
          hi: 'अपरिचित नंबरों के संदेशों से सावधान रहें। कभी भी पिन या ओटीपी साझा न करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Be careful with messages from strangers. Never share your bank PIN or OTP.',
          ta: 'தெரியாத எண்களிலிருந்து வரும் செய்திகளிடம் எச்சரிக்கையாக இருங்கள்.', // REVIEW by native speaker
          hi: 'अपरिचित नंबरों से सावधान रहें। कभी भी ओटीपी साझा न करें।', // REVIEW by native speaker
        },
        durationMs: 3400,
        highlightOnly: true,
      },
    ],
  },
  {
    id: 'C1',
    code: 'C1',
    title: {
      en: 'C1: Search a Contact',
      ta: 'C1: தொடர்பைத் தேடுதல்', // REVIEW by native speaker
      hi: 'C1: संपर्क खोजना', // REVIEW by native speaker
    },
    subtitle: {
      en: 'Tap search, type "Ra" letter by letter, and tap "Ravi Anna".',
      ta: 'தேடலைத் தொட்டு, "Ra" என தட்டச்சு செய்து "ரவி அண்ணா" வைத் தொடுங்கள்.', // REVIEW by native speaker
      hi: 'सर्च पर टैप करें, "Ra" टाइप करें और "रवि अन्ना" पर टैप करें।', // REVIEW by native speaker
    },
    initialSubStep: 'CHAT_LIST',
    yourTurnPrompt: {
      en: 'Now your turn: Tap the search icon, type "Ra", and select Ravi Anna.',
      ta: 'இப்போது உங்கள் முறை: தேடல் ஐகானைத் தொட்டு, "Ra" என தட்டச்சு செய்து ரவி அண்ணாவைத் தொடுங்கள்.', // REVIEW by native speaker
      hi: 'अब आपकी बारी: सर्च पर टैप करें, "Ra" लिखें और रवि अन्ना को चुनें।', // REVIEW by native speaker
    },
    expectedActionTargetIds: ['search-icon', 'search-field', 'chat-row-ravi'],
    actions: [
      {
        type: 'tap',
        targetId: 'search-icon',
        caption: {
          en: 'First, tap the search icon at the top.',
          ta: 'முதலில் மேலே உள்ள தேடல் ஐகானைத் தொடவும்.', // REVIEW by native speaker
          hi: 'पहले ऊपर दिए गए सर्च आइकन पर टैप करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'First, tap the search icon at the top.',
          ta: 'முதலில் மேலே உள்ள தேடல் ஐகானைத் தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'पहले ऊपर सर्च आइकन पर टैप करते हैं।', // REVIEW by native speaker
        },
        durationMs: 2000,
      },
      {
        type: 'type',
        targetId: 'search-field',
        textToType: 'Ra',
        caption: {
          en: 'Type "Ra" letter by letter. Watch how the list filters instantly.',
          ta: '"Ra" என்று எழுத்து எழுத்தாக அடிக்கிறேன். பட்டியல் வடிகட்டப்படுவதைப் பாருங்கள்.', // REVIEW by native speaker
          hi: '"Ra" एक-एक अक्षर टाइप करते हैं। सूची तुरंत फ़िल्टर हो जाती है।', // REVIEW by native speaker
        },
        voice: {
          en: 'Type R and a. The contact list filters instantly.',
          ta: 'ஆர் மற்றும் ஏ என அடிக்கிறேன்.', // REVIEW by native speaker
          hi: 'आर और ए टाइप करते हैं।', // REVIEW by native speaker
        },
        durationMs: 2200,
      },
      {
        type: 'tap',
        targetId: 'chat-row-ravi',
        caption: {
          en: 'Tap on "Ravi Anna" from the filtered results to open his chat.',
          ta: 'பட்டியலில் உள்ள "ரவி அண்ணா" வைத் தொட்டு அரட்டையைத் திறக்கவும்.', // REVIEW by native speaker
          hi: 'चैट खोलने के लिए "रवि अन्ना" पर टैप करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Now tap Ravi Anna to open the chat.',
          ta: 'இப்போது ரவி அண்ணாவைத் தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'अब रवि अन्ना पर टैप करते हैं।', // REVIEW by native speaker
        },
        durationMs: 2400,
      },
    ],
  },
  {
    id: 'C2',
    code: 'C2',
    title: {
      en: 'C2: Save a Contact by Number',
      ta: 'C2: புதிய தொடர்பைச் சேமித்தல்', // REVIEW by native speaker
      hi: 'C2: नया संपर्क नंबर सहेजना', // REVIEW by native speaker
    },
    subtitle: {
      en: 'Tap new chat, enter "Ravi Kumar" and +91 90000 00000, then Save.',
      ta: 'புதிய அரட்டை தொட்டு, பெயர் மற்றும் எண் அடித்து சேமிக்கவும்.', // REVIEW by native speaker
      hi: 'नई चैट टैप करें, नाम और नंबर डालकर सेव करें।', // REVIEW by native speaker
    },
    initialSubStep: 'CHAT_LIST',
    yourTurnPrompt: {
      en: 'Now your turn: Tap New Chat, then New Contact, and save Ravi Kumar.',
      ta: 'இப்போது உங்கள் முறை: புதிய அரட்டை தொட்டு, ரவி குமார் பெயரைச் சேமிக்கவும்.', // REVIEW by native speaker
      hi: 'अब आप करें: नई चैट खोलकर रवि कुमार का नंबर सेव करें।', // REVIEW by native speaker
    },
    expectedActionTargetIds: ['new-chat-btn', 'new-contact-btn', 'field-name', 'field-number', 'save-contact'],
    actions: [
      {
        type: 'tap',
        targetId: 'new-chat-btn',
        caption: {
          en: 'Tap the green new-chat button at the bottom right.',
          ta: 'கீழே வலதுபுறம் உள்ள பச்சை நிற புதிய அரட்டை பொத்தானைத் தொடவும்.', // REVIEW by native speaker
          hi: 'नीचे दाईं ओर हरे रंग के नए चैट बटन पर टैप करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Tap the new-chat button at the bottom.',
          ta: 'புதிய அரட்டை பொத்தானைத் தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'नए चैट बटन पर टैप करते हैं।', // REVIEW by native speaker
        },
        durationMs: 2000,
      },
      {
        type: 'tap',
        targetId: 'new-contact-btn',
        caption: {
          en: 'Tap "New contact" to add a new person to your phonebook.',
          ta: 'புதிய நபரை சேர்க்க "New contact" என்பதைத் தொடவும்.', // REVIEW by native speaker
          hi: 'नया व्यक्ति जोड़ने के लिए "New contact" पर टैप करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Tap New contact.',
          ta: 'நியூ காண்டாக்ட் தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'न्यू कॉन्टैक्ट पर टैप करते हैं।', // REVIEW by native speaker
        },
        durationMs: 2000,
      },
      {
        type: 'type',
        targetId: 'field-name',
        textToType: 'Ravi Kumar',
        caption: {
          en: 'Type the contact name: "Ravi Kumar".',
          ta: 'நபரின் பெயரை "Ravi Kumar" என தட்டச்சு செய்கிறேன்.', // REVIEW by native speaker
          hi: 'संपर्क का नाम "Ravi Kumar" टाइप करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Type the name Ravi Kumar.',
          ta: 'ரவி குமார் என்று பெயர் அடிக்கிறேன்.', // REVIEW by native speaker
          hi: 'रवि कुमार नाम टाइप करते हैं।', // REVIEW by native speaker
        },
        durationMs: 2400,
      },
      {
        type: 'type',
        targetId: 'field-number',
        textToType: '+91 90000 00000',
        caption: {
          en: 'Type the phone number: "+91 90000 00000".',
          ta: 'தொலைபேசி எண்ணை "+91 90000 00000" என அடிக்கிறேன்.', // REVIEW by native speaker
          hi: 'फोन नंबर "+91 90000 00000" टाइप करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Type the fictional phone number.',
          ta: 'மாதிரி தொலைபேசி எண்ணை அடிக்கிறேன்.', // REVIEW by native speaker
          hi: 'फोन नंबर टाइप करते हैं।', // REVIEW by native speaker
        },
        durationMs: 2400,
      },
      {
        type: 'tap',
        targetId: 'save-contact',
        caption: {
          en: 'Tap Save. The contact is saved and now appears in your chat list!',
          ta: 'Save தொடுகிறேன். இப்போது அவர் உங்கள் தொடர்பாளர் பட்டியலில் தோன்றுவார்!', // REVIEW by native speaker
          hi: 'Save दबाएं। अब वह आपकी संपर्क सूची में दिखेगा!', // REVIEW by native speaker
        },
        voice: {
          en: 'Now tap Save. Now you can find him by name.',
          ta: 'சேமிக்க Save தொடுகிறேன். இனி பெயரை வைத்தே அவரை எளிதில் காணலாம்.', // REVIEW by native speaker
          hi: 'सेव पर टैप करते हैं। अब आप उन्हें नाम से ढूंढ सकते हैं।', // REVIEW by native speaker
        },
        durationMs: 2600,
      },
    ],
  },
  {
    id: 'C3',
    code: 'C3',
    title: {
      en: 'C3: Open a Chat and Contact Info',
      ta: 'C3: அரட்டை மற்றும் தொடர்பு விவரம்', // REVIEW by native speaker
      hi: 'C3: चैट और संपर्क विवरण देखना', // REVIEW by native speaker
    },
    subtitle: {
      en: 'Open Amma\'s chat, tap her header name for contact info, then return home.',
      ta: 'அம்மாவின் அரட்டையைத் திறந்து, பெயர் தொட்டு விவரங்களைப் பார்த்து பின்செல்லவும்.', // REVIEW by native speaker
      hi: 'अम्मा की चैट खोलें, नाम पर टैप कर विवरण देखें, फिर वापस आएं।', // REVIEW by native speaker
    },
    initialSubStep: 'CHAT_LIST',
    yourTurnPrompt: {
      en: 'Now your turn: Open Amma\'s chat, tap her name, view details, and tap Back.',
      ta: 'இப்போது உங்கள் முறை: அம்மாவின் அரட்டையைத் திறந்து, விவரங்களைப் பார்த்து பின்செல்லவும்.', // REVIEW by native speaker
      hi: 'अब आप करें: अम्मा की चैट खोलें, नाम पर टैप करें और वापस आएं।', // REVIEW by native speaker
    },
    expectedActionTargetIds: ['chat-row-amma', 'header-name', 'back-btn'],
    actions: [
      {
        type: 'tap',
        targetId: 'chat-row-amma',
        caption: {
          en: 'Tap the chat with "Amma" to open the conversation.',
          ta: '"அம்மா" வின் அரட்டையைத் தொட்டு உரையாடலைத் திறக்கவும்.', // REVIEW by native speaker
          hi: 'बातचीत शुरू करने के लिए "अम्मा" पर टैप करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Tap on Amma to open the conversation.',
          ta: 'அம்மாவின் அரட்டையைத் தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'अम्मा की चैट खोलते हैं।', // REVIEW by native speaker
        },
        durationMs: 2200,
      },
      {
        type: 'tap',
        targetId: 'header-name',
        caption: {
          en: 'Tap Amma\'s name at the top to see her contact card and shared media.',
          ta: 'அவரது புகைப்படம் மற்றும் பகிரப்பட்ட விவரங்களைப் பார்க்க மேலே உள்ள பெயரைத் தொடவும்.', // REVIEW by native speaker
          hi: 'संपर्क विवरण और मीडिया देखने के लिए ऊपर नाम पर टैप करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Tap her name in the header to view her contact page.',
          ta: 'விவரங்களைப் பார்க்க அம்மாவின் பெயரைத் தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'विवरण देखने के लिए नाम पर टैप करते हैं।', // REVIEW by native speaker
        },
        durationMs: 2500,
      },
      {
        type: 'point',
        targetId: 'contact-info-page',
        caption: {
          en: 'Here you see her phone number, shared photos, and safety options like Mute or Block.',
          ta: 'இங்கு அவரது எண், பகிரப்பட்ட படங்கள் மற்றும் மியூட், பிளாக் வசதிகள் உள்ளன.', // REVIEW by native speaker
          hi: 'यहाँ उनका नंबर, साझा फोटो और म्यूट या ब्लॉक करने के विकल्प हैं।', // REVIEW by native speaker
        },
        voice: {
          en: 'Here is the contact page with photo, number, and options.',
          ta: 'இங்கே தொலைபேசி எண் மற்றும் பாதுகாப்பு அமைப்புகள் உள்ளன.', // REVIEW by native speaker
          hi: 'यहाँ संपर्क की जानकारी और सुरक्षा विकल्प हैं।', // REVIEW by native speaker
        },
        durationMs: 3000,
        highlightOnly: true,
      },
      {
        type: 'tap',
        targetId: 'back-btn',
        caption: {
          en: 'Tap the Back arrow to return to the chat screen.',
          ta: 'மீண்டும் அரட்டைக்கு செல்ல பின்செல்லும் அம்பு குறியைத் தொடவும்.', // REVIEW by native speaker
          hi: 'चैट पर वापस जाने के लिए बैक तीर पर टैप करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Tap Back to return to the conversation.',
          ta: 'அரட்டைக்கு திரும்ப பேக் தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'बैक पर टैप करके चैट में लौटते हैं।', // REVIEW by native speaker
        },
        durationMs: 2000,
      },
    ],
  },
  {
    id: 'C4',
    code: 'C4',
    title: {
      en: 'C4: Send a Text Message',
      ta: 'C4: உரைச் செய்தி அனுப்புதல்', // REVIEW by native speaker
      hi: 'C4: संदेश भेजना', // REVIEW by native speaker
    },
    subtitle: {
      en: 'Tap message box, type "Hello Amma", tap Send, and notice read ticks.',
      ta: 'செய்தி பெட்டியில் "Hello Amma" என அடித்து அனுப்பவும்.', // REVIEW by native speaker
      hi: 'मैसेज बॉक्स में "Hello Amma" लिखें, भेजें और टिक देखें।', // REVIEW by native speaker
    },
    initialSubStep: 'INSIDE_CHAT',
    yourTurnPrompt: {
      en: 'Now your turn: Tap the input box, type "Hello Amma", and tap Send.',
      ta: 'இப்போது உங்கள் முறை: "Hello Amma" என்று தட்டச்சு செய்து அனுப்பவும்.', // REVIEW by native speaker
      hi: 'अब आप करें: "Hello Amma" लिखें और सेंड बटन दबाएं।', // REVIEW by native speaker
    },
    expectedActionTargetIds: ['msg-input', 'send-btn', 'mic-btn'],
    actions: [
      {
        type: 'tap',
        targetId: 'msg-input',
        caption: {
          en: 'Tap inside the message box at the bottom to start typing.',
          ta: 'தட்டச்சு செய்ய கீழே உள்ள செய்தி பெட்டியைத் தொடவும்.', // REVIEW by native speaker
          hi: 'लिखने के लिए नीचे मैसेज बॉक्स पर टैप करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Tap the message box.',
          ta: 'செய்தி பெட்டியைத் தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'मैसेज बॉक्स पर टैप करते हैं।', // REVIEW by native speaker
        },
        durationMs: 1800,
      },
      {
        type: 'type',
        targetId: 'msg-input',
        textToType: 'Hello Amma',
        caption: {
          en: 'Type "Hello Amma" into the message box.',
          ta: '"Hello Amma" என்று அன்பாக தட்டச்சு செய்கிறேன்.', // REVIEW by native speaker
          hi: '"Hello Amma" टाइप करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Type Hello Amma.',
          ta: 'ஹலோ அம்மா என அடிக்கிறேன்.', // REVIEW by native speaker
          hi: 'हैलो अम्मा टाइप करते हैं।', // REVIEW by native speaker
        },
        durationMs: 2200,
      },
      {
        type: 'tap',
        targetId: 'send-btn',
        caption: {
          en: 'Tap the green Send button. The message appears with delivery ticks!',
          ta: 'அனுப்ப பச்சை நிற அம்பு குறியைத் தொடவும். செய்தி டிக் குறியுடன் செல்லும்!', // REVIEW by native speaker
          hi: 'हरे सेंड बटन पर टैप करें। डबल टिक के साथ संदेश पहुँच जाएगा!', // REVIEW by native speaker
        },
        voice: {
          en: 'Tap Send. The message appears with ticks, and a reply arrives.',
          ta: 'அனுப்ப சென்ட் தொடுகிறேன். செய்தி சென்றதும் பதில் வருகிறது.', // REVIEW by native speaker
          hi: 'सेंड दबाएं। संदेश पहुँच गया और उत्तर भी आ गया।', // REVIEW by native speaker
        },
        durationMs: 2500,
      },
      {
        type: 'point',
        targetId: 'mic-btn',
        caption: {
          en: 'Tip: You can also press and hold this microphone button to record your voice.',
          ta: 'குறிப்பு: இந்த மைக் பொத்தானை அழுத்திப் பிடித்து குரல் செய்தியாகவும் பேசலாம்.', // REVIEW by native speaker
          hi: 'सुझाव: आप इस माइक बटन को दबाकर आवाज में भी संदेश भेज सकते हैं।', // REVIEW by native speaker
        },
        voice: {
          en: 'You can also press, speak, and release the microphone button for voice notes.',
          ta: 'குரல் வழியாக பேச மைக் குறியீட்டை அழுத்திப் பேசலாம்.', // REVIEW by native speaker
          hi: 'आवाज में बात करने के लिए माइक बटन का इस्तेमाल कर सकते हैं।', // REVIEW by native speaker
        },
        durationMs: 3000,
        highlightOnly: true,
      },
    ],
  },
  {
    id: 'C5',
    code: 'C5',
    title: {
      en: 'C5: Attach and Send a Photo',
      ta: 'C5: புகைப்படம் இணைத்து அனுப்புதல்', // REVIEW by native speaker
      hi: 'C5: फोटो भेजना', // REVIEW by native speaker
    },
    subtitle: {
      en: 'Tap the paperclip, select Photo, choose sample image, and tap Send.',
      ta: 'பேப்பர் கிளிப் தொட்டு, படம் தேர்ந்தெடுத்து அனுப்பவும்.', // REVIEW by native speaker
      hi: 'पेपरक्लिप दबाएं, फोटो चुनें और भेजें।', // REVIEW by native speaker
    },
    initialSubStep: 'INSIDE_CHAT',
    yourTurnPrompt: {
      en: 'Now your turn: Tap the paperclip, tap Photos, and pick a photo to send.',
      ta: 'இப்போது உங்கள் முறை: பேப்பர் கிளிப் தொட்டு, புகைப்படங்களில் ஒன்றை தேர்வு செய்து அனுப்பவும்.', // REVIEW by native speaker
      hi: 'अब आप करें: पेपरक्लिप दबाकर फोटो चुनें और भेजें।', // REVIEW by native speaker
    },
    expectedActionTargetIds: ['attach-btn', 'attach-photo', 'photo-sample-1'],
    actions: [
      {
        type: 'tap',
        targetId: 'attach-btn',
        caption: {
          en: 'Tap the paperclip icon to open the sharing options.',
          ta: 'பகிர்வு விருப்பங்களைத் திறக்க இந்த பேப்பர் கிளிப் குறியீட்டைத் தொடவும்.', // REVIEW by native speaker
          hi: 'शेयरिंग विकल्प खोलने के लिए पेपरक्लिप आइकन पर टैप करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Tap the paperclip to open the share menu.',
          ta: 'பேப்பர் கிளிப்பைத் தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'पेपरक्लिप पर टैप करते हैं।', // REVIEW by native speaker
        },
        durationMs: 2000,
      },
      {
        type: 'tap',
        targetId: 'attach-photo',
        caption: {
          en: 'Tap "Photo" from the menu to choose from your gallery.',
          ta: 'கேலரியிலிருந்து படத்தைத் தேர்ந்தெடுக்க "Photos" என்பதைத் தொடவும்.', // REVIEW by native speaker
          hi: 'गैलरी से चित्र चुनने के लिए "Photos" पर टैप करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Tap Photo.',
          ta: 'போட்டோஸ் ஐகானைத் தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'फोटो पर टैप करते हैं।', // REVIEW by native speaker
        },
        durationMs: 2200,
      },
      {
        type: 'tap',
        targetId: 'photo-sample-1',
        caption: {
          en: 'Pick any of the sample photos. It is sent instantly with a single tap!',
          ta: 'இதில் உள்ள புகைப்படங்களில் ஒன்றை தொடுங்கள், அது உடனே அம்மாவுக்கு அனுப்பப்படும்!', // REVIEW by native speaker
          hi: 'किसी भी फोटो पर टैप करें, वह तुरंत भेज दी जाएगी!', // REVIEW by native speaker
        },
        voice: {
          en: 'Pick the sample photo. Tapping it sends it right away.',
          ta: 'படத்தைத் தொட்டதும் அது உடனே அனுப்பப்படுகிறது.', // REVIEW by native speaker
          hi: 'फोटो चुनते ही वह तुरंत भेज दी जाती है।', // REVIEW by native speaker
        },
        durationMs: 2600,
      },
    ],
  },
  {
    id: 'C6',
    code: 'C6',
    title: {
      en: 'C6: Share Live Location Safely',
      ta: 'C6: இருப்பிடம் பகிர்தல் மற்றும் பாதுகாப்பு', // REVIEW by native speaker
      hi: 'C6: लाइव लोकेशन साझा करना', // REVIEW by native speaker
    },
    subtitle: {
      en: 'Paperclip -> Location, compare "Send location" vs "Live location", and how to Stop.',
      ta: 'பேப்பர் கிளிப் -> லொகேஷன் தொட்டு, இருப்பிடத்தை அனுப்பவும் அல்லது நிறுத்தவும்.', // REVIEW by native speaker
      hi: 'पेपरक्लिप -> लोकेशन से अपना स्थान सुरक्षित रूप से साझा करें।', // REVIEW by native speaker
    },
    initialSubStep: 'INSIDE_CHAT',
    yourTurnPrompt: {
      en: 'Now your turn: Tap paperclip, tap Location, and send your location.',
      ta: 'இப்போது உங்கள் முறை: பேப்பர் கிளிப் தொட்டு லொகேஷன் அனுப்பவும்.', // REVIEW by native speaker
      hi: 'अब आप करें: पेपरक्लिप से लोकेशन खोलकर भेजें।', // REVIEW by native speaker
    },
    expectedActionTargetIds: ['attach-btn', 'attach-location', 'send-location', 'stop-sharing'],
    actions: [
      {
        type: 'tap',
        targetId: 'attach-btn',
        caption: {
          en: 'Tap the paperclip icon in the message bar.',
          ta: 'செய்தி பட்டியில் உள்ள பேப்பர் கிளிப்பைத் தொடவும்.', // REVIEW by native speaker
          hi: 'मैसेज बार में पेपरक्लिप आइकन पर टैप करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Tap the paperclip.',
          ta: 'பேப்பர் கிளிப்பைத் தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'पेपरक्लिप दबाते हैं।', // REVIEW by native speaker
        },
        durationMs: 1800,
      },
      {
        type: 'tap',
        targetId: 'attach-location',
        caption: {
          en: 'Tap the orange "Location" icon.',
          ta: 'ஆரஞ்சு நிற "Location" குறியீட்டைத் தொடவும்.', // REVIEW by native speaker
          hi: 'नारंगी "Location" आइकन पर टैप करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Tap Location.',
          ta: 'லொகேஷன் தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'लोकेशन पर टैप करते हैं।', // REVIEW by native speaker
        },
        durationMs: 2000,
      },
      {
        type: 'tap',
        targetId: 'send-location',
        caption: {
          en: 'Tap "Send this location" for your current static pin. Share only with people you trust!',
          ta: '"Send this location" தொடவும். நம்பிக்கையான குடும்பத்தினருக்கு மட்டுமே லொகேஷன் பகிர வேண்டும்!', // REVIEW by native speaker
          hi: '"Send this location" दबाएं। केवल विश्वसनीय लोगों के साथ ही लोकेशन साझा करें!', // REVIEW by native speaker
        },
        voice: {
          en: 'Demo sending current location. Share your location only with people you trust.',
          ta: 'நம்பிக்கையானவர்களுக்கு மட்டுமே இருப்பிடத்தை பகிரவும்.', // REVIEW by native speaker
          hi: 'लोकेशन भेजें। केवल भरोसेमंद लोगों से साझा करें।', // REVIEW by native speaker
        },
        durationMs: 2800,
      },
      {
        type: 'point',
        targetId: 'stop-sharing',
        caption: {
          en: 'When sharing live location, you can tap "Stop sharing" at any moment to cancel it.',
          ta: 'நேரலை இருப்பிடத்தை எப்போது வேண்டுமானாலும் "Stop sharing" தொட்டு நிறுத்தலாம்.', // REVIEW by native speaker
          hi: 'आप किसी भी समय "Stop sharing" दबाकर लोकेशन बंद कर सकते हैं।', // REVIEW by native speaker
        },
        voice: {
          en: 'Here is where you can tap Stop sharing anytime.',
          ta: 'எப்போது வேண்டுமானாலும் நிறுத்த ஸ்டாப் ஷேரிங் தொடலாம்.', // REVIEW by native speaker
          hi: 'यहाँ से आप लोकेशन शेयरिंग रोक सकते हैं।', // REVIEW by native speaker
        },
        durationMs: 2800,
        highlightOnly: true,
      },
    ],
  },
  {
    id: 'C7',
    code: 'C7',
    title: {
      en: 'C7: Make a Voice or Video Call',
      ta: 'C7: ஆடியோ மற்றும் வீடியோ அழைப்பு', // REVIEW by native speaker
      hi: 'C7: वॉइस और वीडियो कॉल करना', // REVIEW by native speaker
    },
    subtitle: {
      en: 'Tap call icon, simulate answer, toggle Mute, Video, Speaker, and End Call.',
      ta: 'அழைப்பைத் தொடங்கி, மைக், வீடியோ மாற்றி, முடிவில் சிவப்பு பொத்தானால் நிறைவு செய்யவும்.', // REVIEW by native speaker
      hi: 'कॉल शुरू करें, म्यूट और वीडियो जांचें, फिर रेड बटन से समाप्त करें।', // REVIEW by native speaker
    },
    initialSubStep: 'INSIDE_CHAT',
    yourTurnPrompt: {
      en: 'Now your turn: Tap the call icon, try Mute and Video toggles, and tap End Call.',
      ta: 'இப்போது உங்கள் முறை: அழைப்பைத் தொடங்கி, மைக், வீடியோ சோதித்து முடித்து வைக்கவும்.', // REVIEW by native speaker
      hi: 'अब आप करें: कॉल शुरू करें, म्यूट और वीडियो बदलकर देखें, फिर कॉल काटें।', // REVIEW by native speaker
    },
    expectedActionTargetIds: ['call-voice-btn', 'call-mute', 'call-video', 'call-end'],
    actions: [
      {
        type: 'tap',
        targetId: 'call-voice-btn',
        caption: {
          en: 'Tap the phone call icon in the chat header to start a call.',
          ta: 'அழைக்க மேலே உள்ள தொலைபேசி ஐகானைத் தொடவும்.', // REVIEW by native speaker
          hi: 'कॉल करने के लिए ऊपर फोन आइकन पर टैप करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Tap the call icon in the header.',
          ta: 'அழைப்பு பொத்தானைத் தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'कॉल आइकन पर टैप करते हैं।', // REVIEW by native speaker
        },
        durationMs: 2200,
      },
      {
        type: 'tap',
        targetId: 'call-mute',
        caption: {
          en: 'Mute on and off: When muted, others cannot hear your background sounds.',
          ta: 'மைக் மியூட்: இதை அழுத்தினால் உங்கள் பக்கத்து சத்தம் மற்றவர்களுக்கு கேட்காது.', // REVIEW by native speaker
          hi: 'म्यूट ऑन/ऑफ: म्यूट होने पर दूसरी तरफ आपकी आवाज नहीं जाएगी।', // REVIEW by native speaker
        },
        voice: {
          en: 'Mute on and off: others cannot hear you.',
          ta: 'மைக் நிறுத்த மியூட் தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'म्यूट ऑन और ऑफ करने से दूसरों को आवाज नहीं जाती।', // REVIEW by native speaker
        },
        durationMs: 2400,
      },
      {
        type: 'tap',
        targetId: 'call-video',
        caption: {
          en: 'Video on and off: Tap to show your camera preview or switch to voice only.',
          ta: 'வீடியோ ஆன்/ஆப்: கேமராவை ஆன் செய்ய அல்லது ஆப் செய்ய இதைத் தொடலாம்.', // REVIEW by native speaker
          hi: 'वीडियो ऑन/ऑफ: कैमरा चालू या बंद करने के लिए इसे दबाएं।', // REVIEW by native speaker
        },
        voice: {
          en: 'Video on and off: a camera preview appears or disappears.',
          ta: 'வீடியோவை ஆன் மற்றும் ஆப் செய்கிறேன்.', // REVIEW by native speaker
          hi: 'वीडियो ऑन और ऑफ करके देखते हैं।', // REVIEW by native speaker
        },
        durationMs: 2400,
      },
      {
        type: 'point',
        targetId: 'call-speaker',
        caption: {
          en: 'Speaker: Switches sound between earpiece and loud speaker.',
          ta: 'ஸ்பீக்கர்: சத்தமாக கேட்க ஸ்பீக்கரை ஆன் செய்யலாம்.', // REVIEW by native speaker
          hi: 'स्पीकर: आवाज को जोर से सुनने के लिए स्पीकर चालू करें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Speaker switches between loud audio and earpiece.',
          ta: 'சத்தமாக கேட்க ஸ்பீக்கர் பயன்படுகிறது.', // REVIEW by native speaker
          hi: 'लाउडस्पीकर के लिए इसका उपयोग करें।', // REVIEW by native speaker
        },
        durationMs: 2000,
        highlightOnly: true,
      },
      {
        type: 'point',
        targetId: 'call-share-screen',
        caption: {
          en: 'Share Screen: Only for trusted tech help. Never share with unknown callers!',
          ta: 'திரைப் பகிர்வு: தெரியாதவர்களுடன் ஒருபோதும் திரையைப் பகிரக் கூடாது.', // REVIEW by native speaker
          hi: 'स्क्रीन शेयर: अजनबियों के साथ कभी स्क्रीन साझा न करें!', // REVIEW by native speaker
        },
        voice: {
          en: 'Share screen should never be used with unknown callers.',
          ta: 'தெரியாத அழைப்பாளர்களிடம் ஒருபோதும் திரையைப் பகிரக் கூடாது.', // REVIEW by native speaker
          hi: 'अपरिचितों के साथ स्क्रीन शेयर न करें।', // REVIEW by native speaker
        },
        durationMs: 2400,
        highlightOnly: true,
      },
      {
        type: 'tap',
        targetId: 'call-end',
        caption: {
          en: 'End Call: Tap the red button to hang up and disconnect cleanly.',
          ta: 'அழைப்பை நிறைவு செய்ய கீழே உள்ள சிவப்பு End Call பொத்தானைத் தொடவும்.', // REVIEW by native speaker
          hi: 'कॉल समाप्त करने के लिए लाल एंड कॉल बटन दबाएं।', // REVIEW by native speaker
        },
        voice: {
          en: 'Finally tap the red End call button.',
          ta: 'அழைப்பை முடிக்க சிவப்பு பொத்தானைத் தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'कॉल काटने के लिए लाल बटन दबाते हैं।', // REVIEW by native speaker
        },
        durationMs: 2400,
      },
    ],
  },
  {
    id: 'C8',
    code: 'C8',
    title: {
      en: 'C8: Answer a Call & Scam Screen-Share Drill',
      ta: 'C8: அழைப்பை ஏற்றல் & மோசடி பாதுகாப்பு பயிற்சி', // REVIEW by native speaker
      hi: 'C8: कॉल उठाना और स्क्रीन शेयर फ्रॉड से बचाव', // REVIEW by native speaker
    },
    subtitle: {
      en: 'Practice Answer (green) vs Decline (red), then reject a scammer asking for screen-share.',
      ta: 'அழைப்பை ஏற்க பச்சை, மறுக்க சிவப்பு. மோசடி அழைப்பாளரின் திரைப்பகிர்வை நிராகரிக்கவும்.', // REVIEW by native speaker
      hi: 'कॉल उठाना और काटना, और स्क्रीन शेयर मांगने वाले धोखेबाज को रिजेक्ट करना।', // REVIEW by native speaker
    },
    initialSubStep: 'INCOMING_CALL_AMMA',
    yourTurnPrompt: {
      en: 'Now your turn: Answer Amma\'s call, then Decline the scammer screen-share request.',
      ta: 'இப்போது உங்கள் முறை: அம்மாவின் அழைப்பை ஏற்றிடுங்கள், மோசடி அழைப்பை நிராகரியுங்கள்.', // REVIEW by native speaker
      hi: 'अब आप करें: अम्मा की कॉल उठाएं और फ्रॉड कॉल को रिजेक्ट करें।', // REVIEW by native speaker
    },
    expectedActionTargetIds: ['call-answer', 'call-end', 'call-decline'],
    actions: [
      {
        type: 'tap',
        targetId: 'call-answer',
        caption: {
          en: 'Incoming call from Amma! Tap the green Answer button to speak.',
          ta: 'அம்மா அழைக்கிறார்! பேச பச்சை நிற Answer பொத்தானைத் தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'अम्मा की कॉल आई है! बात करने के लिए हरा बटन दबाते हैं।', // REVIEW by native speaker
        },
        voice: {
          en: 'Incoming call from Amma. Tap green Answer to talk.',
          ta: 'அம்மாவின் அழைப்பை ஏற்க பச்சை பொத்தானைத் தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'कॉल उठाने के लिए हरा बटन दबाते हैं।', // REVIEW by native speaker
        },
        durationMs: 2400,
      },
      {
        type: 'tap',
        targetId: 'call-end',
        caption: {
          en: 'After speaking, tap the red button to hang up.',
          ta: 'பேசி முடித்ததும் அழைப்பை முடிக்க சிவப்பு பொத்தானைத் தொடவும்.', // REVIEW by native speaker
          hi: 'बात पूरी होने पर लाल बटन दबाकर कॉल काटें।', // REVIEW by native speaker
        },
        voice: {
          en: 'Tap End Call to finish.',
          ta: 'முடிக்க சிவப்பு பொத்தானைத் தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'कॉल काटने के लिए लाल बटन दबाते हैं।', // REVIEW by native speaker
        },
        durationMs: 2000,
      },
      {
        type: 'point',
        targetId: 'scam-call-alert',
        caption: {
          en: 'CRITICAL DRILL: Unknown caller claims to be "Bank Support" asking to share screen!',
          ta: 'முக்கிய எச்சரிக்கை: தெரியாத நபர் வங்கி அதிகாரி எனக்கூறி திரையைப் பகிர சொல்கிறார்!', // REVIEW by native speaker
          hi: 'सावधान: अनजान व्यक्ति बैंक सपोर्ट बनकर स्क्रीन शेयर करने को कह रहा है!', // REVIEW by native speaker
        },
        voice: {
          en: 'Warning! Sharing your screen can show OTPs and PINs; never do it for a caller.',
          ta: 'எச்சரிக்கை! திரையைப் பகிர்ந்தால் உங்கள் ரகசிய OTP மற்றும் PIN தெரிந்துவிடும். ஒருபோதும் செய்யக்கூடாது.', // REVIEW by native speaker
          hi: 'सावधान! स्क्रीन शेयर करने से आपके ओटीपी और पिन दिख सकते हैं। ऐसा कभी न करें।', // REVIEW by native speaker
        },
        durationMs: 3400,
        highlightOnly: true,
      },
      {
        type: 'tap',
        targetId: 'call-decline',
        caption: {
          en: 'Protect yourself: Tap the red Decline button immediately to reject the scam!',
          ta: 'பாதுகாப்பாக இருக்க: உடனடியாக சிவப்பு Decline பொத்தானைத் தொட்டு நிராகரிக்கவும்!', // REVIEW by native speaker
          hi: 'सुरक्षित रहें: तुरंत लाल डिक्लाइन बटन दबाकर कॉल काटें!', // REVIEW by native speaker
        },
        voice: {
          en: 'Always tap Decline for suspicious calls.',
          ta: 'மோசடி அழைப்பை உடனே நிராகரிக்க சிவப்பு Decline தொடுகிறேன்.', // REVIEW by native speaker
          hi: 'संदिग्ध कॉल को हमेशा लाल डिक्लाइन दबाकर काटें।', // REVIEW by native speaker
        },
        durationMs: 2600,
      },
    ],
  },
];
