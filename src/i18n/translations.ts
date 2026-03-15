export type TranslationKey =
  | 'welcome' | 'selectLanguageText' | 'appTitle' | 'assistantTitle'
  | 'droneMonitor' | 'analysisResult' | 'cameraActive' | 'pointAtCrop'
  | 'processImages' | 'liveAi' | 'analyzingInfo' | 'matchConfidence'
  | 'whyHappened' | 'organicTreatment' | 'chemicalTreatment' | 'latestScan'
  | 'scannedToday' | 'healthy' | 'suspicious' | 'diseaseHotspot'
  | 'requestDroneScan' | 'requestDroneDesc' | 'submitRequest' | 'listening'
  | 'tapToSpeak' | 'liveCameraActive' | 'tourNext' | 'tourDone'
  | 'tourGallery' | 'tourCapture' | 'tourLiveAI' | 'tourProcess';

export type TranslationMap = Record<TranslationKey, string>;
export type Translations = Record<string, TranslationMap>;

export const translations: Translations = {
  en: {
    welcome: 'Welcome',
    selectLanguageText: 'Please select your language',
    appTitle: 'NeoAgri',
    assistantTitle: 'NeoAgri Assistant',
    droneMonitor: 'Drone Monitor',
    analysisResult: 'Analysis Result',
    cameraActive: 'Camera Active',
    pointAtCrop: '(Point at crop leaves)',
    processImages: 'Process Images',
    liveAi: 'Live AI',
    analyzingInfo: 'Analyzing crop images...',
    matchConfidence: 'Match',
    whyHappened: 'Why it happened',
    organicTreatment: 'Organic Treatment',
    chemicalTreatment: 'Chemical Treatment',
    latestScan: 'Latest Farm Scan',
    scannedToday: 'Scanned: Today, 08:30 AM',
    healthy: 'Healthy',
    suspicious: 'Suspicious',
    diseaseHotspot: 'Disease Hotspot',
    requestDroneScan: 'Request Drone Scan',
    requestDroneDesc: 'Request a government drone to scan your entire field for crop health and water levels.',
    submitRequest: 'Submit Request',
    listening: 'Listening...',
    tapToSpeak: 'Tap to speak',
    liveCameraActive: 'Live Camera Feed Active',
    tourNext: 'Next',
    tourDone: 'Got it!',
    tourGallery: 'Select previously taken photos of your crops here.',
    tourCapture: 'Tap here to capture a photo of the infected leaf.',
    tourLiveAI: 'Point your camera and get instant AI feedback on crop health.',
    tourProcess: 'Once you have captured the photos, tap here to analyze them.',
  },
  hi: {
    welcome: 'स्वागत है',
    selectLanguageText: 'कृपया अपनी भाषा चुनें',
    appTitle: 'नियोएग्री (NeoAgri)',
    assistantTitle: 'नियोएग्री सहायक',
    droneMonitor: 'ड्रोन मॉनिटर',
    analysisResult: 'विश्लेषण परिणाम',
    cameraActive: 'कैमरा सक्रिय है',
    pointAtCrop: '(फसल के पत्तों पर इंगित करें)',
    processImages: 'छवियों को प्रोसेस करें',
    liveAi: 'लाइव एआई (Live AI)',
    analyzingInfo: 'फसल की छवियों का विश्लेषण हो रहा है...',
    matchConfidence: 'मिलान',
    whyHappened: 'यह क्यों हुआ',
    organicTreatment: 'जैविक उपचार',
    chemicalTreatment: 'रासायनिक उपचार',
    latestScan: 'नवीनतम खेत स्कैन',
    scannedToday: 'स्कैन किया गया: आज, 08:30 पूर्वाह्न',
    healthy: 'स्वस्थ',
    suspicious: 'संदिग्ध',
    diseaseHotspot: 'रोग हॉटस्पॉट',
    requestDroneScan: 'ड्रोन स्कैन का अनुरोध करें',
    requestDroneDesc: 'फसल के स्वास्थ्य और जल स्तर के लिए अपने पूरे खेत को स्कैन करने के लिए सरकारी ड्रोन का अनुरोध करें।',
    submitRequest: 'अनुरोध सबमिट करें',
    listening: 'सुन रहा है...',
    tapToSpeak: 'बोलने के लिए टैप करें',
    liveCameraActive: 'लाइव कैमरा फ़ीड सक्रिय है',
    tourNext: 'अगला',
    tourDone: 'समझ गया!',
    tourGallery: 'अपनी फसलों की पहले से ली गई फ़ोटो यहां चुनें।',
    tourCapture: 'संक्रमित पत्ते की तस्वीर लेने के लिए यहां टैप करें।',
    tourLiveAI: 'अपना कैमरा इंगित करें और फसल के स्वास्थ्य पर त्वरित AI प्रतिक्रिया प्राप्त करें।',
    tourProcess: 'एक बार फ़ोटो कैप्चर कर लेने के बाद, उनका विश्लेषण करने के लिए यहां टैप करें।',
  },
};
