import { ConfidenceScoreBreakdown, LanguageCode, PlacementProfile, StepAttempt } from '../types';

export function calculateDigitalConfidenceIndex(
  attempts: StepAttempt[],
  placement: PlacementProfile,
  lang: LanguageCode = 'ta'
): ConfidenceScoreBreakdown {
  if (attempts.length === 0) {
    return {
      overallScore: 70,
      accuracyScore: 70,
      speedScore: 70,
      vigilanceScore: 70,
      unassistedRate: 100,
      hesitationAverageMs: 3200,
      totalAttempts: 0,
      mistakesCount: 0,
      replaysUsed: 0,
      levelTitle: lang === 'ta' ? 'வளரும் பயனாளி' : 'Confident Explorer',
      summaryFeedback:
        lang === 'ta'
          ? 'பயிற்சியை வெற்றிகரமாக முடித்துள்ளீர்கள். தொடர்ந்து பயிற்சி செய்தால் முழு தன்னம்பிக்கை பெறலாம்.'
          : 'You completed your guided practice well. Regular practice builds complete independence.',
      recommendations: [
        lang === 'ta'
          ? 'அடுத்ததாக FirstTapPay மோசடி விழிப்புணர்வு பயிற்சியை தொடங்குங்கள்.'
          : 'Next, practice the FirstTapPay scam drill.',
      ],
    };
  }

  // Group attempts by step_id
  const stepMap = new Map<string, StepAttempt[]>();
  attempts.forEach((att) => {
    const list = stepMap.get(att.step_id) || [];
    list.push(att);
    stepMap.set(att.step_id, list);
  });

  const totalSteps = stepMap.size;
  let correctFirstTryCount = 0;
  let totalHesitationMs = 0;
  let mistakesCount = 0;
  let scamAttemptVigilant = true;

  stepMap.forEach((stepAttempts, stepId) => {
    // First attempt hesitation
    const firstAttempt = stepAttempts[0];
    if (firstAttempt) {
      totalHesitationMs += firstAttempt.hesitation_ms;
      if (firstAttempt.correct) {
        correctFirstTryCount++;
      } else {
        mistakesCount += stepAttempts.filter((a) => !a.correct).length;
      }
    }

    if (stepId.includes('fake') || stepId.includes('scam')) {
      if (firstAttempt && !firstAttempt.correct) {
        scamAttemptVigilant = false;
      }
    }
  });

  const avgHesitationMs = Math.round(totalHesitationMs / Math.max(1, totalSteps));
  const unassistedRate = Math.round((correctFirstTryCount / Math.max(1, totalSteps)) * 100);

  // Speed score (lower hesitation is higher score, with reasonable lower bound)
  let speedScore = 100;
  if (avgHesitationMs > 8000) {
    speedScore = Math.max(40, Math.round(100 - (avgHesitationMs - 8000) / 200));
  } else if (avgHesitationMs > 4000) {
    speedScore = Math.max(65, Math.round(100 - (avgHesitationMs - 4000) / 160));
  }

  // Accuracy score
  const accuracyScore = Math.max(
    30,
    Math.round(100 - (mistakesCount / Math.max(1, totalSteps)) * 25)
  );

  // Vigilance score
  const vigilanceScore = scamAttemptVigilant ? 95 : 60;

  // Composite overall score
  const rawScore =
    accuracyScore * 0.4 +
    speedScore * 0.25 +
    unassistedRate * 0.25 +
    vigilanceScore * 0.1;
  const overallScore = Math.min(100, Math.max(35, Math.round(rawScore)));

  // Title & plain-language feedback
  let levelTitle = '';
  let summaryFeedback = '';
  const recommendations: string[] = [];

  if (lang === 'ta') {
    if (overallScore >= 85) {
      levelTitle = 'டிஜிட்டல் சாம்பியன் (முழு தன்னம்பிக்கை)';
      summaryFeedback = `அருமையான முன்னேற்றம்! உங்கள் சராசரி தயக்கம் வெறும் ${(avgHesitationMs / 1000).toFixed(1)} வினாடிகள் மட்டுமே. நீங்கள் தொடுதல் படிகளை மிகச் சரியாக புரிந்து கொண்டுள்ளீர்கள்.`;
    } else if (overallScore >= 70) {
      levelTitle = 'தன்னம்பிக்கை பயனாளி (நம்பிக்கையான நிலை)';
      summaryFeedback = `சிறந்த தொடக்கம்! பெரும்பாலான படிகளை நீங்களே செய்து முடித்துள்ளீர்கள். பணம் அனுப்புவதற்கு முன் பெயரை சரிபார்ப்பதில் இன்னும் சிறிது கவனம் செலுத்தினால் முழு சுதந்திரம் கிடைக்கும்.`;
    } else {
      levelTitle = 'வளரும் பயனாளி (ஆரம்ப நிலை)';
      summaryFeedback = `பயப்பட வேண்டாம்! தவறு செய்வது கற்றலின் ஒரு பகுதி. இந்த மாதிரி செயலியில் எத்தனை முறை வேண்டுமானாலும் பயிற்சி செய்யலாம். உங்கள் வேகம் நாளுக்கு நாள் கூடும்.`;
    }

    if (scamAttemptVigilant) {
      recommendations.push('மோசடி கோரிக்கையை உடனடியாக நிராகரித்தீர்கள் — இது மிகச் சிறந்த விழிப்புணர்வு!');
    } else {
      recommendations.push('பணம் பெற PIN தேவையில்லை என்பதை எப்போதும் நினைவில் வையுங்கள்.');
    }
    recommendations.push('அடுத்ததாக FirstTapPay அல்லது Creyo வணிக வரவு-செலவு கணக்கு பயிற்சியை முடிக்கலாம்.');
  } else if (lang === 'hi') {
    if (overallScore >= 85) {
      levelTitle = 'डिजिटल चैंपियन (पूर्ण आत्मविश्वास)';
      summaryFeedback = `शानदार प्रगति! आपका औसत संकोच केवल ${(avgHesitationMs / 1000).toFixed(1)} सेकंड था। आप बिना किसी झिझक के सही विकल्प चुन रहे हैं।`;
    } else if (overallScore >= 70) {
      levelTitle = 'आत्मविश्वासी उपयोगकर्ता';
      summaryFeedback = `बहुत अच्छा प्रयास! आपने ज्यादातर कार्य स्वयं किए। नाम और राशि जांचने में थोड़ा और अभ्यास आपको पूरी तरह आत्मनिर्भर बनाएगा।`;
    } else {
      levelTitle = 'सीखने वाला उपयोगकर्ता';
      summaryFeedback = `चिंता न करें! अभ्यास से ही गति आती है। यह केवल एक सुरक्षित अभ्यास माहौल है।`;
    }
    recommendations.push(
      scamAttemptVigilant
        ? 'आपने धोखाधड़ी वाले अनुरोध को तुरंत पहचान लिया — बहुत बढ़िया!'
        : 'याद रखें, पैसे प्राप्त करने के लिए कभी भी PIN की आवश्यकता नहीं होती।'
    );
    recommendations.push('अब Creyo या FirstTapMessage के अन्य चरणों का अभ्यास करें।');
  } else {
    // English & Tanglish
    if (overallScore >= 85) {
      levelTitle = 'Digital Champion (Fully Independent)';
      summaryFeedback = `Outstanding fluency! Your average response hesitation was just ${(avgHesitationMs / 1000).toFixed(1)}s with ${unassistedRate}% unassisted completion.`;
    } else if (overallScore >= 70) {
      levelTitle = 'Confident Explorer (Steady Progress)';
      summaryFeedback = `Great foundation! You navigated standard screens with ease. A few more repetitions on name verification and PIN safety will make you fully independent.`;
    } else {
      levelTitle = 'Developing Learner (Safe Practice)';
      summaryFeedback = `Good effort! Hands-on repetition will eliminate hesitation. Because there is zero real-world financial risk here, practice freely.`;
    }
    recommendations.push(
      scamAttemptVigilant
        ? 'You spotted the fake KYC refund scam accurately on your first try.'
        : 'Always remember: never enter your PIN to receive money.'
    );
    recommendations.push('Continue to the Creyo finance ledger drill or practice location sharing.');
  }

  return {
    overallScore,
    accuracyScore,
    speedScore,
    vigilanceScore,
    unassistedRate,
    hesitationAverageMs: avgHesitationMs,
    totalAttempts: attempts.length,
    mistakesCount,
    replaysUsed: attempts.filter((a) => a.attempt_number > 2).length,
    levelTitle,
    summaryFeedback,
    recommendations,
  };
}
