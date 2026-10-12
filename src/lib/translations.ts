import { LanguageCode } from '../types';

export interface TranslationDictionary {
  guideName: string;
  appTitle: string;
  appSubtitle: string;
  practiceBanner: string;
  bankPracticeBanner: string;
  askSelvi: string;
  back: string;
  next: string;
  continue: string;
  confirm: string;
  yes: string;
  no: string;
  confidenceScaleHint: string;
  safeReassurance: string;
  showMeAgain: string;
  replayVoice: string;
  mute: string;
  unmute: string;
  startLearning: string;
  changeLanguage: string;
  placementTitle: string;
  placementSubtitle: string;
  introTitle: string;
  introText: string;
  homeTitle: string;
  homeSubtitle: string;
  startModule: string;
  recommendedTag: string;
  digitalConfidenceTitle: string;
  digitalConfidenceSubtitle: string;
  placementComparison: string;
  restartJourney: string;
  tryAnotherModule: string;
  doubtDrawerTitle: string;
  doubtDrawerSubtitle: string;
  typeDoubtPlaceholder: string;
  sendDoubt: string;
  resumePractice: string;
  presetDoubts: { q: string; a: string }[];
  placementQuestions: {
    id: string;
    type: 'yes_no' | 'scale';
    question: string;
    subtext: string;
    voiceText: string;
  }[];
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  ta: {
    guideName: 'செல்வி',
    appTitle: 'FirstTap',
    appSubtitle: 'அனைவருக்குமான குரல்வழி டிஜிட்டல் கற்றல் துணைவன்',
    practiceBanner: 'பயிற்சி பயன்முறை — உண்மையான செயலி அல்ல',
    bankPracticeBanner: 'வங்கி பயன்முறை: உண்மையான செயலி அல்ல',
    askSelvi: 'செல்வியிடம் கேட்கவும்',
    back: 'பின்செல்',
    next: 'அடுத்தது',
    continue: 'தொடரவும்',
    confirm: 'உறுதி செய்க',
    yes: 'ஆம்',
    no: 'இல்லை',
    confidenceScaleHint: '1 (குறைவு) முதல் 10 (நிறைவு) வரை தேர்ந்தெடுக்கவும்',
    safeReassurance: 'இங்கு உங்கள் சொந்த பணமோ, ரகசிய விவரங்களோ தேவையில்லை. தைரியமாக தொட்டுப் பாருங்கள்!',
    showMeAgain: 'மீண்டும் காட்டுங்கள்',
    replayVoice: 'மீண்டும் பேசவும்',
    mute: 'ஒலி நிறுத்து',
    unmute: 'ஒலி இயக்கு',
    startLearning: 'தமிழிற் தொடங்கலாம்',
    changeLanguage: 'மொழி மாற்றம்',
    placementTitle: 'உங்களைப் பற்றி தெரிந்து கொள்வோம்',
    placementSubtitle: 'உங்களுக்கு ஏற்றவாறு பாடங்களை ஒழுங்கமைக்க 8 எளிய கேள்விகள்',
    introTitle: 'வணக்கம்! நான் உங்கள் வழிகாட்டி செல்வி',
    introText:
      'ஸ்மார்ட்போன் மற்றும் UPI செயலிகளை எளிய முறையில், எந்த பயமும் இல்லாமல் பயன்படுத்த நான் உங்களுக்கு கற்றுத் தருவேன். இதில் தவறுகள் செய்தாலும் எந்த பண இழப்பும் ஏற்படாது. தயக்கமின்றி தொடங்கலாம்!',
    homeTitle: 'கற்றல் முகப்பு',
    homeSubtitle: 'உங்களின் விருப்பத்திற்கு ஏற்ப தேர்ந்தெடுக்கப்பட்ட பயிற்சிப் பாடங்கள்',
    startModule: 'பயிற்சியைத் தொடங்கு',
    recommendedTag: 'உங்களுக்கு பரிந்துரைக்கப்படுகிறது',
    digitalConfidenceTitle: 'டிஜிட்டல் நம்பிக்கை குறியீடு',
    digitalConfidenceSubtitle: 'உங்கள் பயிற்சி முடிவுகளின் முழு பகுப்பாய்வு',
    placementComparison: 'தொடக்க நிலை vs தற்போதைய முன்னேற்றம்',
    restartJourney: 'மீண்டும் முதல் இருந்து கற்க',
    tryAnotherModule: 'அடுத்த பாடம் கற்க',
    doubtDrawerTitle: 'செல்வியிடம் உங்கள் சந்தேகத்தைக் கேளுங்கள்',
    doubtDrawerSubtitle: 'எந்தக் கேள்வியானாலும் பயப்படாமல் கேளுங்கள், உடனடியாக விளக்குகிறேன்',
    typeDoubtPlaceholder: 'உங்கள் சந்தேகத்தை தட்டச்சு செய்யவும் அல்லது பேசவும்...',
    sendDoubt: 'கேள்',
    resumePractice: 'பயிற்சியைத் தொடரவும்',
    presetDoubts: [
      {
        q: 'யாராவது பணம் அனுப்ப கோரிக்கை வைத்தால் என் பணம் போகுமா?',
        a: 'ஆம்! கோரிக்கையை ஏற்று (Approve) PIN அடித்தால் உங்கள் கணக்கிலிருந்து பணம் மற்றவருக்கு சென்றுவிடும். பணம் பெற ஒருபோதும் PIN தேவையில்லை!',
      },
      {
        q: 'தவறான PIN 3 முறை போட்டால் என்ன ஆகும்?',
        a: 'உண்மையான வங்கியில் உங்கள் கணக்கு 24 மணி நேரம் தற்காலிகமாக பூட்டப்படும். ஆனால் இந்த பயிற்சி செயலியில் எதுவும் ஆகாது, எத்தனை முறையும் முயற்சிக்கலாம்.',
      },
      {
        q: 'வாட்ஸ்அப்பில் லொகேஷன் பகிர்வது பாதுகாப்பானதா?',
        a: 'உங்களுக்கு தெரிந்த குடும்பத்தினர், நண்பர்களுடன் மட்டுமே பகிர வேண்டும். அறிமுகமில்லாத நபர்களுக்கு அனுப்பாதீர்கள். எப்போது வேண்டுமானாலும் நிறுத்தலாம்.',
      },
      {
        q: 'வங்கியிலிருந்து போன் செய்து OTP கேட்டால் தரலாமா?',
        a: 'ஒருபோதும் தரக்கூடாது! எந்த வங்கியும் போனில் OTP அல்லது PIN கேட்காது. அப்படி கேட்டால் அது 100% மோசடி.',
      },
    ],
    placementQuestions: [
      {
        id: 'q1',
        type: 'yes_no',
        question: 'இதற்கு முன் ஸ்மார்ட்போன் பயன்படுத்தியிருக்கிறீர்களா?',
        subtext: 'தொடுதிரை கைபேசி',
        voiceText: 'இதற்கு முன் ஸ்மார்ட்போன் பயன்படுத்தியிருக்கிறீர்களா?',
      },
      {
        id: 'q2',
        type: 'yes_no',
        question: 'இதற்கு முன் வாட்ஸ்அப் அல்லது செய்தி அனுப்பும் செயலிகளை பயன்படுத்தியுள்ளீர்களா?',
        subtext: 'மெசேஜ் அல்லது வாய்ஸ் நோட் அனுப்புவது',
        voiceText: 'இதற்கு முன் வாட்ஸ்அப் அல்லது செய்தி அனுப்பும் செயலிகளை பயன்படுத்தியுள்ளீர்களா?',
      },
      {
        id: 'q3',
        type: 'yes_no',
        question: 'வாட்ஸ்அப்பில் புகைப்படம் அல்லது உங்கள் இருப்பிடத்தை (Location) பகிர தெரியுமா?',
        subtext: 'கேமரா படம் அல்லது கூகிள் மேப் இருப்பிடம்',
        voiceText: 'வாட்ஸ்அப்பில் புகைப்படம் அல்லது உங்கள் இருப்பிடத்தை பகிர தெரியுமா?',
      },
      {
        id: 'q4',
        type: 'yes_no',
        question: 'மற்றவர்கள் உதவி இல்லாமல் சுயமாக இன்டர்நெட் அல்லது செயலிகளை பார்த்திருக்கிறீர்களா?',
        subtext: 'யூடியூப், கூகிள் அல்லது பிற செயலிகள்',
        voiceText: 'மற்றவர்கள் உதவி இல்லாமல் சுயமாக இன்டர்நெட் அல்லது செயலிகளை பார்த்திருக்கிறீர்களா?',
      },
      {
        id: 'q5',
        type: 'scale',
        question: 'மொபைலில் செயலிகளையும் மெனுக்களையும் பயன்படுத்த உங்களுக்கு எவ்வளவு தன்னம்பிக்கை உள்ளது?',
        subtext: 'பொதுவான டிஜிட்டல் பயன்பாட்டு நம்பிக்கை (1 முதல் 10 வரை)',
        voiceText: 'மொபைலில் செயலிகளையும் மெனுக்களையும் பயன்படுத்த உங்களுக்கு எவ்வளவு தன்னம்பிக்கை உள்ளது?',
      },
      {
        id: 'q6',
        type: 'yes_no',
        question: 'இதற்கு முன் கூகிள் பே, போன்பே அல்லது BHIM போன்ற UPI பண பரிவர்த்தனை செய்திருக்கிறீர்களா?',
        subtext: 'கடையில் QR ஸ்கேன் அல்லது மொபைல் எண்ணிற்கு பணம்',
        voiceText: 'இதற்கு முன் UPI மூலம் டிஜிட்டல் பண பரிவர்த்தனை செய்திருக்கிறீர்களா?',
      },
      {
        id: 'q7',
        type: 'scale',
        question: 'சுயமாக யாருடைய உதவியும் இன்றி ஆன்லைனில் பணம் செலுத்த எவ்வளவு தன்னம்பிக்கை உள்ளது?',
        subtext: 'பணம் செலுத்தும் நம்பிக்கை (1 முதல் 10 வரை)',
        voiceText: 'சுயமாக யாருடைய உதவியும் இன்றி ஆன்லைனில் பணம் செலுத்த எவ்வளவு தன்னம்பிக்கை உள்ளது?',
      },
      {
        id: 'q8',
        type: 'scale',
        question: 'PIN அல்லது OTP கேட்கும் போலி அழைப்பு மற்றும் செய்திகளை கண்டறிய உங்களுக்கு எவ்வளவு நம்பிக்கை உள்ளது?',
        subtext: 'மோசடி விழிப்புணர்வு நம்பிக்கை (1 முதல் 10 வரை)',
        voiceText: 'PIN அல்லது OTP கேட்கும் போலி செய்திகளை கண்டறிய உங்களுக்கு எவ்வளவு நம்பிக்கை உள்ளது?',
      },
    ],
  },
  hi: {
    guideName: 'सेलवी',
    appTitle: 'FirstTap',
    appSubtitle: 'सभी के लिए आवाज़-आधारित डिजिटल साक्षरता साथी',
    practiceBanner: 'अभ्यास मोड — असली ऐप नहीं है',
    bankPracticeBanner: 'बैंक मोड: असली ऐप नहीं है',
    askSelvi: 'सेलवी से पूछें',
    back: 'पीछे जाएं',
    next: 'आगे',
    continue: 'जारी रखें',
    confirm: 'पुष्टि करें',
    yes: 'हाँ',
    no: 'नहीं',
    confidenceScaleHint: '1 (कम) से 10 (पूरा) के बीच चुनें',
    safeReassurance: 'यहाँ आपके असली पैसे या बैंक खाते का कोई जोखिम नहीं है। बेझिझक सीखें!',
    showMeAgain: 'मुझे फिर से दिखाएं',
    replayVoice: 'फिर से सुनें',
    mute: 'आवाज़ बंद',
    unmute: 'आवाज़ चालू',
    startLearning: 'सीखना शुरू करें',
    changeLanguage: 'भाषा बदलें',
    placementTitle: 'आइए आपके बारे में जानें',
    placementSubtitle: 'आपके अनुसार पाठ तैयार करने के लिए 8 सरल प्रश्न',
    introTitle: 'नमस्ते! मैं आपकी गाइड सेलवी हूँ',
    introText:
      'मैं आपको बिना किसी डर के स्मार्टफोन और UPI पेमेंट का सुरक्षित उपयोग करना सिखाऊंगी। यहाँ गलती होने पर भी कोई पैसा नहीं कटेगा।',
    homeTitle: 'सीखने का होम पेज',
    homeSubtitle: 'आपकी कुशलता के अनुसार चुने गए अभ्यास मॉड्यूल',
    startModule: 'अभ्यास शुरू करें',
    recommendedTag: 'आपके लिए अनुशंसित',
    digitalConfidenceTitle: 'डिजिटल आत्मविश्वास सूचकांक',
    digitalConfidenceSubtitle: 'आपके प्रदर्शन और सीखने की विस्तृत रिपोर्ट',
    placementComparison: 'शुरुआती स्तर बनाम वर्तमान प्रदर्शन',
    restartJourney: 'शुरू से दोबारा सीखें',
    tryAnotherModule: 'दूसरा पाठ आज़माएं',
    doubtDrawerTitle: 'सेलवी से सवाल पूछें',
    doubtDrawerSubtitle: 'कोई भी संदेह हो तो बिना हिचकिचाहट पूछें',
    typeDoubtPlaceholder: 'अपना सवाल लिखें या बोलें...',
    sendDoubt: 'पूछें',
    resumePractice: 'अभ्यास जारी रखें',
    presetDoubts: [
      {
        q: 'क्या पैसे पाने के लिए कभी PIN डालना पड़ता है?',
        a: 'बिल्कुल नहीं! पैसे प्राप्त करने के लिए कभी भी PIN की आवश्यकता नहीं होती। PIN केवल पैसे भेजने के लिए होता है।',
      },
      {
        q: 'यदि बैंक अधिकारी बनकर कोई OTP मांगे तो?',
        a: 'कभी न बताएं! बैंक कभी भी फोन पर OTP या PIN नहीं मांगता। यह पूरी तरह से धोखाधड़ी है।',
      },
    ],
    placementQuestions: [
      {
        id: 'q1',
        type: 'yes_no',
        question: 'क्या आपने पहले कभी स्मार्टफोन का उपयोग किया है?',
        subtext: 'टचस्क्रीन फोन',
        voiceText: 'क्या आपने पहले कभी स्मार्टफोन का उपयोग किया है?',
      },
      {
        id: 'q2',
        type: 'yes_no',
        question: 'क्या आपने कभी व्हाट्सएप या मैसेजिंग ऐप का उपयोग किया है?',
        subtext: 'मैसेज या वॉयस नोट भेजना',
        voiceText: 'क्या आपने कभी व्हाट्सएप का उपयोग किया है?',
      },
      {
        id: 'q3',
        type: 'yes_no',
        question: 'क्या आपको व्हाट्सएप पर फोटो या अपनी लोकेशन शेयर करना आता है?',
        subtext: 'तस्वीर या गूगल मैप लोकेशन',
        voiceText: 'क्या आपको व्हाट्सएप पर फोटो या लोकेशन शेयर करना आता है?',
      },
      {
        id: 'q4',
        type: 'yes_no',
        question: 'क्या आपने बिना किसी की मदद के खुद इंटरनेट या ऐप चलाए हैं?',
        subtext: 'यूट्यूब या अन्य ऐप',
        voiceText: 'क्या आपने बिना मदद के खुद इंटरनेट चलाया है?',
      },
      {
        id: 'q5',
        type: 'scale',
        question: 'फोन में ऐप और मेनू चलाने में आपको कितना आत्मविश्वास है?',
        subtext: 'सामान्य डिजिटल आत्मविश्वास (1 से 10)',
        voiceText: 'फोन में ऐप चलाने में आपको कितना आत्मविश्वास है?',
      },
      {
        id: 'q6',
        type: 'yes_no',
        question: 'क्या आपने पहले कभी UPI (Google Pay / PhonePe) से भुगतान किया है?',
        subtext: 'दुकान पर QR स्कैन या नंबर पर पैसे',
        voiceText: 'क्या आपने पहले कभी UPI से भुगतान किया है?',
      },
      {
        id: 'q7',
        type: 'scale',
        question: 'बिना किसी की सहायता के ऑनलाइन पेमेंट करने में आपको कितना भरोसा है?',
        subtext: 'पेमेंट आत्मविश्वास (1 से 10)',
        voiceText: 'अकेले ऑनलाइन पेमेंट करने में आपको कितना भरोसा है?',
      },
      {
        id: 'q8',
        type: 'scale',
        question: 'OTP या PIN मांगने वाले फर्जी कॉल और मैसेज पहचानने में आपको कितना भरोसा है?',
        subtext: 'धोखाधड़ी पहचान (1 से 10)',
        voiceText: 'फर्जी कॉल और मैसेज पहचानने में आपको कितना भरोसा है?',
      },
    ],
  },
  en: {
    guideName: 'Selvi',
    appTitle: 'FirstTap',
    appSubtitle: 'Voice-First AI Digital Literacy Companion',
    practiceBanner: 'Practice mode — not a real app',
    bankPracticeBanner: 'Bank mode: not a real app',
    askSelvi: 'Ask Selvi a doubt',
    back: 'Back',
    next: 'Next',
    continue: 'Continue',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    confidenceScaleHint: 'Select from 1 (Low) to 10 (High)',
    safeReassurance: 'No real bank accounts or money are used here. Tap freely and learn safely!',
    showMeAgain: 'Show me again',
    replayVoice: 'Hear again',
    mute: 'Mute',
    unmute: 'Unmute',
    startLearning: 'Start Learning',
    changeLanguage: 'Language',
    placementTitle: 'Let us understand your experience',
    placementSubtitle: '8 quick questions to personalize your learning track',
    introTitle: 'Hello! I am your guide Selvi',
    introText:
      'I am here to guide you through UPI payments, messaging, and digital tools step by step. Everything here is safe practice dummy credits. No real money, no real risk.',
    homeTitle: 'Learning Modules',
    homeSubtitle: 'Personalized practice tracks ordered for your comfort',
    startModule: 'Start Practice',
    recommendedTag: 'Recommended for you',
    digitalConfidenceTitle: 'Digital Confidence Index',
    digitalConfidenceSubtitle: 'Comprehensive analysis of your hands-on practice',
    placementComparison: 'Initial Placement vs. Measured Performance',
    restartJourney: 'Restart Track',
    tryAnotherModule: 'Try Another Module',
    doubtDrawerTitle: 'Ask Selvi a Question',
    doubtDrawerSubtitle: 'Ask any question with voice or text anytime',
    typeDoubtPlaceholder: 'Type or speak your question...',
    sendDoubt: 'Ask',
    resumePractice: 'Resume Practice',
    presetDoubts: [
      {
        q: 'Do I ever need to enter my UPI PIN to receive money?',
        a: 'Never! You only enter your UPI PIN to SEND money. If someone asks you to enter your PIN to get a refund or lottery, it is 100% a scam.',
      },
      {
        q: 'What happens if I type the wrong PIN?',
        a: 'In a real bank, typing it wrong 3 times blocks your UPI for 24 hours. In this sandbox, you have unlimited risk-free practice.',
      },
      {
        q: 'Is it safe to share location on WhatsApp?',
        a: 'Only share your live location with trusted family or friends. You can stop sharing at any time with a single tap.',
      },
      {
        q: 'Can a bank manager ask for my OTP on a call?',
        a: 'Never! Legitimate banks and officials never ask for OTPs or PINs. Never share it with anyone.',
      },
    ],
    placementQuestions: [
      {
        id: 'q1',
        type: 'yes_no',
        question: 'Have you used a smartphone before?',
        subtext: 'Touchscreen mobile phone',
        voiceText: 'Have you used a smartphone before?',
      },
      {
        id: 'q2',
        type: 'yes_no',
        question: 'Have you used WhatsApp or a messaging app before?',
        subtext: 'Sending text or audio voice notes',
        voiceText: 'Have you used WhatsApp or a messaging app before?',
      },
      {
        id: 'q3',
        type: 'yes_no',
        question: 'Do you know how to share a photo or your location on WhatsApp?',
        subtext: 'Sending photos or Google Map location',
        voiceText: 'Do you know how to share a photo or your location on WhatsApp?',
      },
      {
        id: 'q4',
        type: 'yes_no',
        question: 'Have you browsed the internet or used apps on your own, without someone helping you?',
        subtext: 'Watching YouTube or searching independently',
        voiceText: 'Have you browsed the internet or used apps on your own?',
      },
      {
        id: 'q5',
        type: 'scale',
        question: 'How confident are you using apps and menus on your phone in general?',
        subtext: 'General digital literacy (1 to 10)',
        voiceText: 'How confident are you using apps and menus on your phone in general?',
      },
      {
        id: 'q6',
        type: 'yes_no',
        question: 'Have you made a UPI/digital payment before?',
        subtext: 'Scanning QR at a shop or sending to a mobile number',
        voiceText: 'Have you made a UPI or digital payment before?',
      },
      {
        id: 'q7',
        type: 'scale',
        question: 'How confident are you making a payment on your own?',
        subtext: 'Digital payment confidence (1 to 10)',
        voiceText: 'How confident are you making a payment on your own?',
      },
      {
        id: 'q8',
        type: 'scale',
        question: 'How confident are you spotting a fake call or message asking for your PIN/OTP?',
        subtext: 'Scam-awareness confidence (1 to 10)',
        voiceText: 'How confident are you spotting a fake call or message asking for your PIN or OTP?',
      },
    ],
  },
};

