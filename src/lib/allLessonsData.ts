import { LanguageCode } from '../types';

export interface LocalizedString {
  en: string;
  ta: string;
}

export interface DemoStep {
  id: string;
  targetId: string;
  action: 'wait' | 'tap' | 'type' | 'point';
  textToType?: string;
  say: LocalizedString;
  guideText: LocalizedString;
  screen: string;
  waitMs?: number;
}

export interface PracticeStep {
  id: string;
  targetId: string;
  actionType: 'tap' | 'type';
  expectedScreen: string;
  say: LocalizedString;
  guideText: LocalizedString;
  // Dynamic validation helper (for inputs)
  validateInput?: (val: string, task: PracticeTaskData) => boolean;
  completionSay?: LocalizedString;
}

export interface PracticeTaskData {
  app: 'whatsapp' | 'gpay';
  lessonId: number;
  round: 1 | 2;
  name: string;
  nameTa: string;
  phone: string; // e.g. "98412 36705"
  phoneRaw: string; // e.g. "9841236705"
  amount?: string;
  message?: string;
  messageTa?: string;
  taskBanner: LocalizedString;
}

export interface LessonDefinition {
  id: number;
  app: 'whatsapp' | 'gpay';
  title: LocalizedString;
  shortTitle: LocalizedString;
  successMessage: LocalizedString;
  introSay: LocalizedString;
  demoSteps: DemoStep[];
  createPractice: (round: 1 | 2) => {
    task: PracticeTaskData;
    steps: PracticeStep[];
  };
}

// Realistic random generator for names and 10-digit phone numbers
const REALISTIC_NAMES = [
  { en: 'Ravi', ta: 'ரவி' },
  { en: 'Priya', ta: 'பிரியா' },
  { en: 'Lakshmi', ta: 'லட்சுமி' },
  { en: 'Kumar', ta: 'குமார்' },
  { en: 'Anand', ta: 'ஆனந்த்' },
  { en: 'Deepa', ta: 'தீபா' },
];

const REALISTIC_PREFIXES = ['98412', '97890', '94431', '88381', '98840', '99401'];

export function generateRealisticPhone(): { formatted: string; raw: string } {
  const prefix = REALISTIC_PREFIXES[Math.floor(Math.random() * REALISTIC_PREFIXES.length)];
  const suffix = Math.floor(10000 + Math.random() * 90000).toString();
  return {
    formatted: `${prefix} ${suffix}`,
    raw: `${prefix}${suffix}`,
  };
}

export const ALL_LESSONS: LessonDefinition[] = [
  // ==================== WHATSAPP LESSON 1: Save a contact ====================
  {
    id: 1,
    app: 'whatsapp',
    title: {
      en: '1. Save a new contact',
      ta: '1. புதிய தொடர்பை சேமித்தல்',
    },
    shortTitle: {
      en: 'Save contact',
      ta: 'தொடர்பை சேமி',
    },
    introSay: {
      en: 'This is the WhatsApp home page. Now we are going to learn how to save a contact.',
      ta: 'இது வாட்ஸ்அப் முகப்புப் பக்கம். இப்போது ஒரு புதிய தொடர்பை எப்படி சேமிப்பது என்று கற்போம்.',
    },
    successMessage: {
      en: 'Great job! You saved a contact.',
      ta: 'அருமை! நீங்கள் ஒரு புதிய தொடர்பை வெற்றிகரமாக சேமித்துவிட்டீர்கள்.',
    },
    demoSteps: [
      {
        id: 'wa_l1_s1',
        targetId: '',
        action: 'wait',
        say: {
          en: 'This is the WhatsApp home page.',
          ta: 'இது வாட்ஸ்அப் முகப்புப் பக்கம்.',
        },
        guideText: { en: '', ta: '' },
        screen: 'HOME',
        waitMs: 2500,
      },
      {
        id: 'wa_l1_s2',
        targetId: '',
        action: 'wait',
        say: {
          en: 'Now we are going to learn how to save a contact.',
          ta: 'இப்போது ஒரு புதிய தொடர்பை எப்படி சேமிப்பது என்று கற்போம்.',
        },
        guideText: { en: '', ta: '' },
        screen: 'HOME',
        waitMs: 1500,
      },
      {
        id: 'wa_l1_s3',
        targetId: 'new-contact-fab',
        action: 'tap',
        say: {
          en: 'Tap the New Contact button.',
          ta: 'பச்சை நிற புதிய தொடர்பு பொத்தானைத் தொடவும்.',
        },
        guideText: {
          en: 'Tap + New Contact',
          ta: 'புதிய தொடர்பு பொத்தானைத் தொடவும்',
        },
        screen: 'HOME',
      },
      {
        id: 'wa_l1_s4',
        targetId: 'contact-name-input',
        action: 'type',
        textToType: 'Ravi',
        say: {
          en: 'Type the name of the contact.',
          ta: 'நபரின் பெயரை தட்டச்சு செய்யுங்கள்.',
        },
        guideText: {
          en: 'Type name here',
          ta: 'பெயரை தட்டச்சு செய்க',
        },
        screen: 'NEW_CONTACT',
      },
      {
        id: 'wa_l1_s5',
        targetId: 'contact-phone-input',
        action: 'type',
        textToType: '9841236705',
        say: {
          en: 'Type the phone number.',
          ta: 'தொலைபேசி எண்ணை தட்டச்சு செய்யுங்கள்.',
        },
        guideText: {
          en: 'Type phone number',
          ta: 'எண்ணை தட்டச்சு செய்க',
        },
        screen: 'NEW_CONTACT',
      },
      {
        id: 'wa_l1_s6',
        targetId: 'save-contact-btn',
        action: 'tap',
        say: {
          en: 'Now tap Save to save the contact.',
          ta: 'இப்போது சேமிக்க Save என்பதைத் தொடவும்.',
        },
        guideText: {
          en: 'Tap Save',
          ta: 'Save என்பதைத் தொடவும்',
        },
        screen: 'NEW_CONTACT',
      },
      {
        id: 'wa_l1_s7',
        targetId: '',
        action: 'wait',
        say: {
          en: 'The contact is saved and appears in your chat list.',
          ta: 'தொடர்பு சேமிக்கப்பட்டு உங்கள் அரட்டைப் பட்டியலில் வந்துவிட்டது.',
        },
        guideText: { en: '', ta: '' },
        screen: 'HOME',
        waitMs: 2500,
      },
    ],
    createPractice: (round: 1 | 2) => {
      const person = REALISTIC_NAMES[(round === 1 ? 0 : 1) % REALISTIC_NAMES.length];
      const phoneObj = generateRealisticPhone();
      const task: PracticeTaskData = {
        app: 'whatsapp',
        lessonId: 1,
        round,
        name: person.en,
        nameTa: person.ta,
        phone: phoneObj.formatted,
        phoneRaw: phoneObj.raw,
        taskBanner: {
          en: `Save a contact named ${person.en} with the number ${phoneObj.formatted}.`,
          ta: `${phoneObj.formatted} என்ற எண்ணில் ${person.ta} பெயரை தொடர்பில் சேமிக்கவும்.`,
        },
      };

      const steps: PracticeStep[] = [
        {
          id: 'p1_s1',
          targetId: 'new-contact-fab',
          actionType: 'tap',
          expectedScreen: 'HOME',
          say: {
            en: 'Tap the New Contact button.',
            ta: 'புதிய தொடர்பு பொத்தானைத் தொடவும்.',
          },
          guideText: {
            en: 'Tap + New Contact',
            ta: '+ புதிய தொடர்பு',
          },
        },
        {
          id: 'p1_s2',
          targetId: 'contact-name-input',
          actionType: 'type',
          expectedScreen: 'NEW_CONTACT',
          say: {
            en: `Type the name: ${person.en}.`,
            ta: `${person.ta} என்று பெயரை தட்டச்சு செய்யுங்கள்.`,
          },
          guideText: {
            en: `Type ${person.en}`,
            ta: `${person.ta} என தட்டச்சு செய்க`,
          },
          validateInput: (val) => val.trim().length > 0,
          completionSay: {
            en: 'Good. Now type the phone number.',
            ta: 'நன்று. இப்போது தொலைபேசி எண்ணை உள்ளிடவும்.',
          },
        },
        {
          id: 'p1_s3',
          targetId: 'contact-phone-input',
          actionType: 'type',
          expectedScreen: 'NEW_CONTACT',
          say: {
            en: `Type the number: ${phoneObj.formatted}.`,
            ta: `${phoneObj.formatted} என்ற எண்ணை தட்டச்சு செய்யுங்கள்.`,
          },
          guideText: {
            en: `Type ${phoneObj.formatted}`,
            ta: `${phoneObj.formatted} என தட்டச்சு செய்க`,
          },
          validateInput: (val) => val.replace(/\s+/g, '') === phoneObj.raw,
          completionSay: {
            en: 'Good. Now tap Save to save the contact.',
            ta: 'நன்று. இப்போது சேமிக்க Save என்பதைத் தொடவும்.',
          },
        },
        {
          id: 'p1_s4',
          targetId: 'save-contact-btn',
          actionType: 'tap',
          expectedScreen: 'NEW_CONTACT',
          say: {
            en: 'Now tap Save to save the contact.',
            ta: 'இப்போது சேமிக்க Save என்பதைத் தொடவும்.',
          },
          guideText: {
            en: 'Tap Save',
            ta: 'Save என்பதைத் தொடவும்',
          },
        },
      ];

      return { task, steps };
    },
  },

  // ==================== WHATSAPP LESSON 2: Search and send message ====================
  {
    id: 2,
    app: 'whatsapp',
    title: {
      en: '2. Search for a person and send a message',
      ta: '2. ஒருவரைத் தேடி செய்தி அனுப்புதல்',
    },
    shortTitle: {
      en: 'Search & message',
      ta: 'தேடி செய்தி அனுப்பு',
    },
    introSay: {
      en: 'This is the WhatsApp home page. Now we will search for a person and send a message.',
      ta: 'இது வாட்ஸ்அப் முகப்புப் பக்கம். இப்போது ஒருவரைத் தேடி செய்தி அனுப்புவோம்.',
    },
    successMessage: {
      en: 'Great job! You searched for a person and sent a message.',
      ta: 'அருமை! நீங்கள் ஒருவரைத் தேடி வெற்றிகரமாக செய்தி அனுப்பிவிட்டீர்கள்.',
    },
    demoSteps: [
      {
        id: 'wa_l2_s1',
        targetId: '',
        action: 'wait',
        say: {
          en: 'This is the WhatsApp home page. Now we will search for a person and send a message.',
          ta: 'இது வாட்ஸ்அப் முகப்புப் பக்கம். இப்போது ஒருவரைத் தேடி செய்தி அனுப்புவோம்.',
        },
        guideText: { en: '', ta: '' },
        screen: 'HOME',
        waitMs: 2500,
      },
      {
        id: 'wa_l2_s2',
        targetId: 'search-icon-btn',
        action: 'tap',
        say: {
          en: 'Tap the search icon at the top.',
          ta: 'மேலே உள்ள தேடல் குறியீட்டைத் தொடவும்.',
        },
        guideText: {
          en: 'Tap search icon',
          ta: 'தேடல் குறியீடு',
        },
        screen: 'HOME',
      },
      {
        id: 'wa_l2_s3',
        targetId: 'search-input-field',
        action: 'type',
        textToType: 'Amma',
        say: {
          en: 'Type the name of the person you want to find.',
          ta: 'நீங்கள் தேடும் நபரின் பெயரை தட்டச்சு செய்யுங்கள்.',
        },
        guideText: {
          en: 'Type name here',
          ta: 'பெயரை தட்டச்சு செய்க',
        },
        screen: 'SEARCH',
      },
      {
        id: 'wa_l2_s4',
        targetId: 'search-result-amma',
        action: 'tap',
        say: {
          en: 'Tap the person name to open the conversation.',
          ta: 'அரட்டையைத் திறக்க நபரின் பெயரைத் தொடவும்.',
        },
        guideText: {
          en: 'Tap person',
          ta: 'நபரின் பெயரைத் தொடவும்',
        },
        screen: 'SEARCH',
      },
      {
        id: 'wa_l2_s5',
        targetId: 'chat-input-box',
        action: 'tap',
        say: {
          en: 'Tap the message box to start typing.',
          ta: 'செய்தி தட்டச்சு செய்ய செய்திப் பெட்டியைத் தொடவும்.',
        },
        guideText: {
          en: 'Tap message box',
          ta: 'செய்திப் பெட்டி',
        },
        screen: 'CHAT',
      },
      {
        id: 'wa_l2_s6',
        targetId: 'chat-input-field',
        action: 'type',
        textToType: 'Hello Amma',
        say: {
          en: 'Type your message on the keyboard.',
          ta: 'உங்கள் செய்தியை தட்டச்சு செய்யுங்கள்.',
        },
        guideText: {
          en: 'Type message',
          ta: 'செய்தி தட்டச்சு செய்க',
        },
        screen: 'CHAT',
      },
      {
        id: 'wa_l2_s7',
        targetId: 'send-message-btn',
        action: 'tap',
        say: {
          en: 'Now tap the green Send button.',
          ta: 'இப்போது பச்சை நிற Send பொத்தானைத் தொடவும்.',
        },
        guideText: {
          en: 'Tap Send',
          ta: 'Send தொடவும்',
        },
        screen: 'CHAT',
      },
      {
        id: 'wa_l2_s8',
        targetId: '',
        action: 'wait',
        say: {
          en: 'Your message is sent and appears with checkmarks.',
          ta: 'உங்கள் செய்தி அனுப்பப்பட்டுவிட்டது.',
        },
        guideText: { en: '', ta: '' },
        screen: 'CHAT',
        waitMs: 2200,
      },
    ],
    createPractice: (round: 1 | 2) => {
      const contact = round === 1 ? { en: 'Amma', ta: 'அம்மா' } : { en: 'Ravi', ta: 'ரவி' };
      const msg =
        round === 1
          ? { en: 'Hello', ta: 'வணக்கம்' }
          : { en: 'Good morning', ta: 'காலை வணக்கம்' };

      const task: PracticeTaskData = {
        app: 'whatsapp',
        lessonId: 2,
        round,
        name: contact.en,
        nameTa: contact.ta,
        phone: '98412 36705',
        phoneRaw: '9841236705',
        message: msg.en,
        messageTa: msg.ta,
        taskBanner: {
          en: `Search for ${contact.en} and send the message "${msg.en}".`,
          ta: `${contact.ta} வை தேடி "${msg.ta}" என்று செய்தி அனுப்பவும்.`,
        },
      };

      const steps: PracticeStep[] = [
        {
          id: 'p2_s1',
          targetId: 'search-icon-btn',
          actionType: 'tap',
          expectedScreen: 'HOME',
          say: {
            en: 'Tap the search icon at the top.',
            ta: 'மேலே உள்ள தேடல் குறியீட்டைத் தொடவும்.',
          },
          guideText: {
            en: 'Tap search',
            ta: 'தேடல் குறியீடு',
          },
        },
        {
          id: 'p2_s2',
          targetId: 'search-input-field',
          actionType: 'type',
          expectedScreen: 'SEARCH',
          say: {
            en: `Type "${contact.en}" in the search field.`,
            ta: `தேடல் பகுதியில் "${contact.ta}" என தட்டச்சு செய்க.`,
          },
          guideText: {
            en: `Type ${contact.en}`,
            ta: `${contact.ta} என தட்டச்சு செய்க`,
          },
          validateInput: (val) => val.trim().length > 1,
          completionSay: {
            en: `Good. Now tap ${contact.en} to open the chat.`,
            ta: `நன்று. இப்போது ${contact.ta} பெயரைத் தொட்டு அரட்டையைத் திறக்கவும்.`,
          },
        },
        {
          id: 'p2_s3',
          targetId: round === 1 ? 'search-result-amma' : 'search-result-ravi',
          actionType: 'tap',
          expectedScreen: 'SEARCH',
          say: {
            en: `Tap ${contact.en} to open the chat.`,
            ta: `அரட்டையைத் திறக்க ${contact.ta} என்பதைத் தொடவும்.`,
          },
          guideText: {
            en: `Tap ${contact.en}`,
            ta: `${contact.ta} தொடவும்`,
          },
        },
        {
          id: 'p2_s4',
          targetId: 'chat-input-box',
          actionType: 'tap',
          expectedScreen: 'CHAT',
          say: {
            en: 'Tap the message box to start typing.',
            ta: 'செய்தி தட்டச்சு செய்ய செய்திப் பெட்டியைத் தொடவும்.',
          },
          guideText: {
            en: 'Tap message box',
            ta: 'செய்திப் பெட்டி',
          },
        },
        {
          id: 'p2_s5',
          targetId: 'chat-input-field',
          actionType: 'type',
          expectedScreen: 'CHAT',
          say: {
            en: `Type your message "${msg.en}".`,
            ta: `"${msg.ta}" என செய்தியை தட்டச்சு செய்யுங்கள்.`,
          },
          guideText: {
            en: `Type "${msg.en}"`,
            ta: `"${msg.ta}" என தட்டச்சு செய்க`,
          },
          validateInput: (val) => val.trim().length > 1,
          completionSay: {
            en: 'Good. Now tap the green Send button.',
            ta: 'நன்று. இப்போது பச்சை நிற Send பொத்தானைத் தொடவும்.',
          },
        },
        {
          id: 'p2_s6',
          targetId: 'send-message-btn',
          actionType: 'tap',
          expectedScreen: 'CHAT',
          say: {
            en: 'Now tap the green Send button.',
            ta: 'இப்போது பச்சை நிற Send பொத்தானைத் தொடவும்.',
          },
          guideText: {
            en: 'Tap Send',
            ta: 'Send தொடவும்',
          },
        },
      ];

      return { task, steps };
    },
  },

  // ==================== WHATSAPP LESSON 3: Send a photo ====================
  {
    id: 3,
    app: 'whatsapp',
    title: {
      en: '3. Send a photo',
      ta: '3. புகைப்படம் அனுப்புதல்',
    },
    shortTitle: {
      en: 'Send photo',
      ta: 'புகைப்படம் அனுப்பு',
    },
    introSay: {
      en: 'This is your chat with Amma. Now we will learn how to send a photo.',
      ta: 'இப்போது புகைப்படத்தை எப்படி பகிர்வது என்று கற்போம்.',
    },
    successMessage: {
      en: 'Great job! You learned how to send a photo.',
      ta: 'அருமை! நீங்கள் ஒரு புகைப்படத்தை வெற்றிகரமாக அனுப்பிவிட்டீர்கள்.',
    },
    demoSteps: [
      {
        id: 'wa_l3_s1',
        targetId: '',
        action: 'wait',
        say: {
          en: 'This is your chat with Amma. Now we will learn how to send a photo.',
          ta: 'இப்போது புகைப்படத்தை எப்படி பகிர்வது என்று கற்போம்.',
        },
        guideText: { en: '', ta: '' },
        screen: 'CHAT',
        waitMs: 2200,
      },
      {
        id: 'wa_l3_s2',
        targetId: 'paperclip-attach-btn',
        action: 'tap',
        say: {
          en: 'Tap the paperclip icon in the message bar.',
          ta: 'செய்திப் பட்டியில் உள்ள இணைப்புக் குறியீட்டைத் (Paperclip) தொடவும்.',
        },
        guideText: {
          en: 'Tap paperclip',
          ta: 'இணைப்புக் குறியீடு',
        },
        screen: 'CHAT',
      },
      {
        id: 'wa_l3_s3',
        targetId: 'share-menu-photo',
        action: 'tap',
        say: {
          en: 'Tap Photo to choose an image from your gallery.',
          ta: 'புகைப்படத்தைத் தேர்ந்தெடுக்க Photo என்பதைத் தொடவும்.',
        },
        guideText: {
          en: 'Tap Photo',
          ta: 'Photo தொடவும்',
        },
        screen: 'SHARING_MENU',
      },
      {
        id: 'wa_l3_s4',
        targetId: 'sample-photo-1',
        action: 'tap',
        say: {
          en: 'Select the sample photo you want to send.',
          ta: 'மாதிரிப் புகைப்படத்தைத் தேர்ந்தெடுக்கவும்.',
        },
        guideText: {
          en: 'Select photo',
          ta: 'புகைப்படத்தைத் தேர்வு செய்க',
        },
        screen: 'PHOTO_PICKER',
      },
      {
        id: 'wa_l3_s5',
        targetId: 'send-photo-btn',
        action: 'tap',
        say: {
          en: 'Now tap Send to share the photo.',
          ta: 'புகைப்படத்தை அனுப்ப Send என்பதைத் தொடவும்.',
        },
        guideText: {
          en: 'Tap Send',
          ta: 'Send தொடவும்',
        },
        screen: 'PHOTO_PICKER',
      },
      {
        id: 'wa_l3_s6',
        targetId: '',
        action: 'wait',
        say: {
          en: 'The photo is sent and appears right inside the chat.',
          ta: 'புகைப்படம் வெற்றிகரமாக அனுப்பப்பட்டுவிட்டது.',
        },
        guideText: { en: '', ta: '' },
        screen: 'CHAT',
        waitMs: 2200,
      },
    ],
    createPractice: (round: 1 | 2) => {
      const task: PracticeTaskData = {
        app: 'whatsapp',
        lessonId: 3,
        round,
        name: 'Amma',
        nameTa: 'அம்மா',
        phone: '98412 36705',
        phoneRaw: '9841236705',
        taskBanner: {
          en: 'In chat with Amma, tap the paperclip, select Photo, and send it.',
          ta: 'அம்மாவுடனான அரட்டையில் இணைப்புக் குறியீட்டைத் தொட்டு Photo தேர்வு செய்து அனுப்பவும்.',
        },
      };

      const steps: PracticeStep[] = [
        {
          id: 'p3_s1',
          targetId: 'paperclip-attach-btn',
          actionType: 'tap',
          expectedScreen: 'CHAT',
          say: {
            en: 'Tap the paperclip icon in the message bar.',
            ta: 'செய்திப் பட்டியில் உள்ள இணைப்புக் குறியீட்டைத் (Paperclip) தொடவும்.',
          },
          guideText: {
            en: 'Tap paperclip',
            ta: 'இணைப்புக் குறியீடு',
          },
        },
        {
          id: 'p3_s2',
          targetId: 'share-menu-photo',
          actionType: 'tap',
          expectedScreen: 'SHARING_MENU',
          say: {
            en: 'Tap Photo to choose an image from your gallery.',
            ta: 'புகைப்படத்தைத் தேர்ந்தெடுக்க Photo என்பதைத் தொடவும்.',
          },
          guideText: {
            en: 'Tap Photo',
            ta: 'Photo தொடவும்',
          },
        },
        {
          id: 'p3_s3',
          targetId: 'sample-photo-1',
          actionType: 'tap',
          expectedScreen: 'PHOTO_PICKER',
          say: {
            en: 'Select the sample photo you want to send.',
            ta: 'மாதிரிப் புகைப்படத்தைத் தேர்ந்தெடுக்கவும்.',
          },
          guideText: {
            en: 'Select photo',
            ta: 'புகைப்படத்தைத் தேர்வு செய்க',
          },
          completionSay: {
            en: 'Good. Now tap Send to share the photo.',
            ta: 'நன்று. இப்போது அனுப்ப Send என்பதைத் தொடவும்.',
          },
        },
        {
          id: 'p3_s4',
          targetId: 'send-photo-btn',
          actionType: 'tap',
          expectedScreen: 'PHOTO_PICKER',
          say: {
            en: 'Now tap Send to share the photo.',
            ta: 'இப்போது அனுப்ப Send என்பதைத் தொடவும்.',
          },
          guideText: {
            en: 'Tap Send',
            ta: 'Send தொடவும்',
          },
        },
      ];

      return { task, steps };
    },
  },

  // ==================== WHATSAPP LESSON 4: Send location ====================
  {
    id: 4,
    app: 'whatsapp',
    title: {
      en: '4. Send a location',
      ta: '4. இருப்பிடம் (Location) பகிர்வு',
    },
    shortTitle: {
      en: 'Send location',
      ta: 'இருப்பிடம் பகிர்',
    },
    introSay: {
      en: 'This is your chat with Amma. Now we will learn how to share your location safely.',
      ta: 'இப்போது உங்கள் இருப்பிடத்தை (Location) பாதுகாப்பாக பகிர்வதை கற்போம்.',
    },
    successMessage: {
      en: 'Great job! You learned how to share your location.',
      ta: 'அருமை! நீங்கள் இருப்பிடத்தை வெற்றிகரமாக பகிர்ந்துவிட்டீர்கள்.',
    },
    demoSteps: [
      {
        id: 'wa_l4_s1',
        targetId: '',
        action: 'wait',
        say: {
          en: 'This is your chat with Amma. Now we will learn how to share your location safely.',
          ta: 'இப்போது உங்கள் இருப்பிடத்தை (Location) பாதுகாப்பாக பகிர்வதை கற்போம்.',
        },
        guideText: { en: '', ta: '' },
        screen: 'CHAT',
        waitMs: 2200,
      },
      {
        id: 'wa_l4_s2',
        targetId: 'paperclip-attach-btn',
        action: 'tap',
        say: {
          en: 'Tap the paperclip icon to open sharing options.',
          ta: 'இணைப்புக் குறியீட்டைத் (Paperclip) தொடவும்.',
        },
        guideText: {
          en: 'Tap paperclip',
          ta: 'இணைப்புக் குறியீடு',
        },
        screen: 'CHAT',
      },
      {
        id: 'wa_l4_s3',
        targetId: 'share-menu-location',
        action: 'tap',
        say: {
          en: 'Tap Location to open the map options.',
          ta: 'Location என்பதைத் தொடவும்.',
        },
        guideText: {
          en: 'Tap Location',
          ta: 'Location தொடவும்',
        },
        screen: 'SHARING_MENU',
      },
      {
        id: 'wa_l4_s4',
        targetId: 'send-current-location-btn',
        action: 'tap',
        say: {
          en: "Tap 'Send this location' to share where you are.",
          ta: "'Send this location' என்பதைத் தொட்டு இருப்பிடத்தை அனுப்பவும்.",
        },
        guideText: {
          en: 'Tap Send this location',
          ta: 'Send this location',
        },
        screen: 'LOCATION',
      },
      {
        id: 'wa_l4_s5',
        targetId: '',
        action: 'wait',
        say: {
          en: 'The location card with the map is now shared in the chat.',
          ta: 'இருப்பிடம் வெற்றிகரமாக பகிரப்பட்டது.',
        },
        guideText: { en: '', ta: '' },
        screen: 'CHAT',
        waitMs: 2200,
      },
    ],
    createPractice: (round: 1 | 2) => {
      const task: PracticeTaskData = {
        app: 'whatsapp',
        lessonId: 4,
        round,
        name: 'Amma',
        nameTa: 'அம்மா',
        phone: '98412 36705',
        phoneRaw: '9841236705',
        taskBanner: {
          en: 'In chat with Amma, tap the paperclip, select Location, and send your location.',
          ta: 'அம்மாவுடனான அரட்டையில் இணைப்புக் குறியீட்டைத் தொட்டு Location தேர்வு செய்து பகிரவும்.',
        },
      };

      const steps: PracticeStep[] = [
        {
          id: 'p4_s1',
          targetId: 'paperclip-attach-btn',
          actionType: 'tap',
          expectedScreen: 'CHAT',
          say: {
            en: 'Tap the paperclip icon in the message bar.',
            ta: 'செய்திப் பட்டியில் உள்ள இணைப்புக் குறியீட்டைத் தொடவும்.',
          },
          guideText: {
            en: 'Tap paperclip',
            ta: 'இணைப்புக் குறியீடு',
          },
        },
        {
          id: 'p4_s2',
          targetId: 'share-menu-location',
          actionType: 'tap',
          expectedScreen: 'SHARING_MENU',
          say: {
            en: 'Tap Location to open the map options.',
            ta: 'Location என்பதைத் தொடவும்.',
          },
          guideText: {
            en: 'Tap Location',
            ta: 'Location தொடவும்',
          },
        },
        {
          id: 'p4_s3',
          targetId: 'send-current-location-btn',
          actionType: 'tap',
          expectedScreen: 'LOCATION',
          say: {
            en: "Tap 'Send this location' to share where you are.",
            ta: "'Send this location' என்பதைத் தொட்டு இருப்பிடத்தை அனுப்பவும்.",
          },
          guideText: {
            en: 'Send this location',
            ta: 'Send this location',
          },
        },
      ];

      return { task, steps };
    },
  },

  // ==================== WHATSAPP LESSON 5: Calls ====================
  {
    id: 5,
    app: 'whatsapp',
    title: {
      en: '5. Calls (voice call and video call)',
      ta: '5. அழைப்புகள் (குரல் மற்றும் வீடியோ அழைப்பு)',
    },
    shortTitle: {
      en: 'Calls',
      ta: 'அழைப்புகள்',
    },
    introSay: {
      en: 'This is your chat with Amma. Now we will learn how to make voice and video calls.',
      ta: 'இப்போது குரல் அழைப்பு மற்றும் வீடியோ அழைப்பு செய்வதைக் கற்போம்.',
    },
    successMessage: {
      en: 'Great job! You mastered WhatsApp voice and video calls.',
      ta: 'அருமை! நீங்கள் அழைப்பு செய்வதை வெற்றிகரமாக பயின்றுவிட்டீர்கள்.',
    },
    demoSteps: [
      {
        id: 'wa_l5_s1',
        targetId: '',
        action: 'wait',
        say: {
          en: 'This is your chat with Amma. Now we will learn how to make voice and video calls.',
          ta: 'இப்போது குரல் அழைப்பு மற்றும் வீடியோ அழைப்பு செய்வதைக் கற்போம்.',
        },
        guideText: { en: '', ta: '' },
        screen: 'CHAT',
        waitMs: 2200,
      },
      {
        id: 'wa_l5_s2',
        targetId: 'header-voice-call-btn',
        action: 'tap',
        say: {
          en: 'Tap the phone call icon at the top to start an audio call.',
          ta: 'குரல் அழைப்பு செய்ய மேலே உள்ள தொலைபேசி குறியீட்டைத் தொடவும்.',
        },
        guideText: {
          en: 'Tap call icon',
          ta: 'அழைப்பு குறியீடு',
        },
        screen: 'CHAT',
      },
      {
        id: 'wa_l5_s3',
        targetId: 'call-video-control',
        action: 'point',
        say: {
          en: 'On the call page, you can see controls like Speaker, Mute, and Video.',
          ta: 'அழைப்பு பக்கத்தில் Speaker, Mute, மற்றும் Video கட்டுப்பாடுகளைக் காணலாம்.',
        },
        guideText: {
          en: 'Video call toggle',
          ta: 'வீடியோ கட்டுப்பாடு',
        },
        screen: 'CALL',
        waitMs: 2000,
      },
      {
        id: 'wa_l5_s4',
        targetId: 'end-call-btn',
        action: 'tap',
        say: {
          en: 'Tap the red button to end the call cleanly.',
          ta: 'அழைப்பை முடிக்க சிவப்பு நிற பொத்தானைத் தொடவும்.',
        },
        guideText: {
          en: 'Tap red End call',
          ta: 'அழைப்பை முடிக்கவும்',
        },
        screen: 'CALL',
      },
      {
        id: 'wa_l5_s5',
        targetId: 'chat-back-arrow',
        action: 'tap',
        say: {
          en: 'Tap Back to return to the home screen.',
          ta: 'முகப்புப் பக்கத்திற்கு செல்ல Back பொத்தானைத் தொடவும்.',
        },
        guideText: {
          en: 'Tap Back',
          ta: 'பின்செல்லவும்',
        },
        screen: 'CHAT',
      },
      {
        id: 'wa_l5_s6',
        targetId: 'bottom-tab-calls',
        action: 'tap',
        say: {
          en: 'Tap the Calls tab at the bottom to view your call history.',
          ta: 'அழைப்பு வரலாற்றைக் காண கீழே உள்ள Calls பகுதியைத் தொடவும்.',
        },
        guideText: {
          en: 'Tap Calls tab',
          ta: 'Calls தாவல்',
        },
        screen: 'HOME',
      },
      {
        id: 'wa_l5_s7',
        targetId: '',
        action: 'wait',
        say: {
          en: 'Here you can see all your recent voice and video calls.',
          ta: 'இங்கு உங்கள் முந்தைய அனைத்து அழைப்புகளையும் பார்க்கலாம்.',
        },
        guideText: { en: '', ta: '' },
        screen: 'HOME',
        waitMs: 2200,
      },
    ],
    createPractice: (round: 1 | 2) => {
      const task: PracticeTaskData = {
        app: 'whatsapp',
        lessonId: 5,
        round,
        name: 'Amma',
        nameTa: 'அம்மா',
        phone: '98412 36705',
        phoneRaw: '9841236705',
        taskBanner: {
          en: 'In chat with Amma, start a voice call, then end the call, and view the Calls tab.',
          ta: 'அம்மாவுக்கு குரல் அழைப்பு செய்து, பின் துண்டித்து, Calls வரலாற்றைப் பார்க்கவும்.',
        },
      };

      const steps: PracticeStep[] = [
        {
          id: 'p5_s1',
          targetId: 'header-voice-call-btn',
          actionType: 'tap',
          expectedScreen: 'CHAT',
          say: {
            en: 'Tap the phone call icon at the top to start an audio call.',
            ta: 'குரல் அழைப்பு செய்ய தொலைபேசி குறியீட்டைத் தொடவும்.',
          },
          guideText: {
            en: 'Tap call icon',
            ta: 'அழைப்பு குறியீடு',
          },
        },
        {
          id: 'p5_s2',
          targetId: 'end-call-btn',
          actionType: 'tap',
          expectedScreen: 'CALL',
          say: {
            en: 'Tap the red button to end the call cleanly.',
            ta: 'அழைப்பை முடிக்க சிவப்பு நிற பொத்தானைத் தொடவும்.',
          },
          guideText: {
            en: 'Tap red End call',
            ta: 'அழைப்பை முடிக்கவும்',
          },
        },
        {
          id: 'p5_s3',
          targetId: 'chat-back-arrow',
          actionType: 'tap',
          expectedScreen: 'CHAT',
          say: {
            en: 'Tap Back to return to the home screen.',
            ta: 'முகப்புப் பக்கத்திற்கு செல்ல Back பொத்தானைத் தொடவும்.',
          },
          guideText: {
            en: 'Tap Back',
            ta: 'பின்செல்லவும்',
          },
        },
        {
          id: 'p5_s4',
          targetId: 'bottom-tab-calls',
          actionType: 'tap',
          expectedScreen: 'HOME',
          say: {
            en: 'Tap the Calls tab at the bottom to view your call history.',
            ta: 'அழைப்பு வரலாற்றைக் காண கீழே உள்ள Calls பகுதியைத் தொடவும்.',
          },
          guideText: {
            en: 'Tap Calls tab',
            ta: 'Calls தாவல்',
          },
        },
      ];

      return { task, steps };
    },
  },

  // ==================== GPAY LESSON 1: Pay someone ====================
  {
    id: 101,
    app: 'gpay',
    title: {
      en: '1. Pay someone (Send to phone number)',
      ta: '1. ஒருவருக்கு பணம் அனுப்புதல் (தொலைபேசி எண் வழி)',
    },
    shortTitle: {
      en: 'Pay someone',
      ta: 'பணம் அனுப்பு',
    },
    introSay: {
      en: 'This is the Google Pay home page. Now I will show you how to pay someone safely.',
      ta: 'இது கூகுள் பே முகப்புப் பக்கம். இப்போது ஒருவருக்கு பாதுகாப்பாக பணம் அனுப்புவதை கற்போம்.',
    },
    successMessage: {
      en: 'Great job! You successfully completed sending money.',
      ta: 'அருமை! நீங்கள் வெற்றிகரமாக பணம் அனுப்பிவிட்டீர்கள்.',
    },
    demoSteps: [
      {
        id: 'gp_l1_s1',
        targetId: '',
        action: 'wait',
        say: {
          en: 'This is the home page. Here you can check your balance and all actions.',
          ta: 'இது முகப்புப் பக்கம். இங்கு உங்கள் வங்கி இருப்பையும் சேவைகளையும் காணலாம்.',
        },
        guideText: { en: '', ta: '' },
        screen: 'HOME',
        waitMs: 2500,
      },
      {
        id: 'gp_l1_s2',
        targetId: 'tile-send-money',
        action: 'tap',
        say: {
          en: 'Tap Send to number to start paying someone.',
          ta: 'பணம் அனுப்ப "எண்ணிற்கு அனுப்புதல்" என்பதைத் தொடவும்.',
        },
        guideText: {
          en: 'Tap Send to number',
          ta: 'எண்ணிற்கு அனுப்புதல்',
        },
        screen: 'HOME',
      },
      {
        id: 'gp_l1_s3',
        targetId: 'phone-input',
        action: 'type',
        textToType: '9841236705',
        say: {
          en: "Type the person's phone number.",
          ta: 'பணம் பெற வேண்டிய நபரின் தொலைபேசி எண்ணை தட்டச்சு செய்யுங்கள்.',
        },
        guideText: {
          en: 'Type phone number',
          ta: 'எண்ணை தட்டச்சு செய்க',
        },
        screen: 'SEND_PHONE',
      },
      {
        id: 'gp_l1_s4',
        targetId: 'contact-ravi',
        action: 'tap',
        say: {
          en: "The app shows the name for this number. Check it is the right person and tap Continue.",
          ta: 'இந்த எண்ணிற்குரிய நபரின் பெயர் தெரிகிறது. சரியான நபர் என உறுதி செய்து தொடரவும்.',
        },
        guideText: {
          en: 'Tap Continue',
          ta: 'தொடரவும்',
        },
        screen: 'SEND_PHONE',
      },
      {
        id: 'gp_l1_s5',
        targetId: 'pay-btn',
        action: 'tap',
        say: {
          en: 'Enter the amount and tap Pay.',
          ta: 'அனுப்ப வேண்டிய தொகையை உள்ளிட்டு Pay என்பதைத் தொடவும்.',
        },
        guideText: {
          en: 'Tap Pay',
          ta: 'Pay என்பதைத் தொடவும்',
        },
        screen: 'AMOUNT',
      },
      {
        id: 'gp_l1_s6',
        targetId: 'pin-dots',
        action: 'type',
        textToType: '1234',
        say: {
          en: 'Enter your 4-digit UPI PIN.',
          ta: 'உங்கள் 4 இலக்க ரகசிய PIN எண்ணை உள்ளிடவும்.',
        },
        guideText: {
          en: 'Enter PIN 1234',
          ta: 'PIN 1234 உள்ளிடவும்',
        },
        screen: 'PIN',
      },
      {
        id: 'gp_l1_s7',
        targetId: '',
        action: 'wait',
        say: {
          en: 'Payment successful! Money is sent directly from your bank.',
          ta: 'வெற்றிகரமாக பணம் அனுப்பப்பட்டது! அருமை!',
        },
        guideText: { en: '', ta: '' },
        screen: 'SUCCESS',
        waitMs: 2500,
      },
    ],
    createPractice: (round: 1 | 2) => {
      // PART A5: Consistent name everywhere! E.g. "Ravi" in banner, hint, matched contact.
      const person = round === 1 ? { en: 'Ravi', ta: 'ரவி' } : { en: 'Lakshmi', ta: 'லட்சுமி' };
      const phoneObj = generateRealisticPhone();
      const amount = round === 1 ? '50' : '100';

      const task: PracticeTaskData = {
        app: 'gpay',
        lessonId: 101,
        round,
        name: person.en,
        nameTa: person.ta,
        phone: phoneObj.formatted,
        phoneRaw: phoneObj.raw,
        amount,
        taskBanner: {
          en: `Send ₹${amount} to ${person.en} (${phoneObj.formatted}).`,
          ta: `${person.ta} (${phoneObj.formatted}) என்பவருக்கு ₹${amount} அனுப்பவும்.`,
        },
      };

      const steps: PracticeStep[] = [
        {
          id: 'gp_p1',
          targetId: 'tile-send-money',
          actionType: 'tap',
          expectedScreen: 'HOME',
          say: {
            en: 'Tap Send to number.',
            ta: 'பணம் அனுப்ப "எண்ணிற்கு அனுப்புதல்" என்பதைத் தொடவும்.',
          },
          guideText: {
            en: 'Tap Send to number',
            ta: 'எண்ணிற்கு அனுப்புதல்',
          },
        },
        {
          id: 'gp_p2',
          targetId: 'phone-input',
          actionType: 'type',
          expectedScreen: 'SEND_PHONE',
          say: {
            en: `Type ${person.en}'s number: ${phoneObj.formatted}.`,
            ta: `${person.ta} அவர்களின் ${phoneObj.formatted} என்ற எண்ணை தட்டச்சு செய்யுங்கள்.`,
          },
          guideText: {
            en: `Type ${phoneObj.formatted}`,
            ta: `${phoneObj.formatted} என தட்டச்சு செய்க`,
          },
          validateInput: (val) => val.replace(/\s+/g, '') === phoneObj.raw,
          completionSay: {
            en: 'Good. Now tap Continue.',
            ta: 'நன்று. இப்போது தொடரவும் என்பதைத் தொடவும்.',
          },
        },
        {
          id: 'gp_p3',
          targetId: 'contact-ravi', // Matched contact button
          actionType: 'tap',
          expectedScreen: 'SEND_PHONE',
          say: {
            en: `Tap ${person.en} to continue.`,
            ta: `தொடர ${person.ta} பெயரைத் தொடவும்.`,
          },
          guideText: {
            en: 'Tap Continue',
            ta: 'தொடரவும்',
          },
        },
        {
          id: 'gp_p4',
          targetId: 'pay-btn',
          actionType: 'tap',
          expectedScreen: 'AMOUNT',
          say: {
            en: `Enter ₹${amount} and tap Pay.`,
            ta: `₹${amount} என உள்ளிட்டு Pay என்பதைத் தொடவும்.`,
          },
          guideText: {
            en: `Pay ₹${amount}`,
            ta: `Pay ₹${amount}`,
          },
        },
        {
          id: 'gp_p5',
          targetId: 'key-1', // First PIN key
          actionType: 'tap',
          expectedScreen: 'PIN',
          say: {
            en: 'Enter your 4-digit PIN 1234.',
            ta: 'உங்கள் 4 இலக்க PIN 1234 என உள்ளிடவும்.',
          },
          guideText: {
            en: 'Enter PIN 1234',
            ta: 'PIN 1234 உள்ளிடவும்',
          },
        },
      ];

      return { task, steps };
    },
  },
];
