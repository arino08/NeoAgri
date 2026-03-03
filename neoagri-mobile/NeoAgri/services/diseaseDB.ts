/**
 * PlantVillage 38-class label map + per-disease knowledge base.
 * Provides remedies, dosages, instructions, and prevention in EN, HI, MR.
 */

import { LocalizedDiseaseInfo, LangKey } from '../types';

/** The 38 class labels in the exact order the model outputs them. */
export const CLASS_LABELS: string[] = [
  'Apple___Apple_scab',
  'Apple___Black_rot',
  'Apple___Cedar_apple_rust',
  'Apple___healthy',
  'Blueberry___healthy',
  'Cherry_(including_sour)___Powdery_mildew',
  'Cherry_(including_sour)___healthy',
  'Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot',
  'Corn_(maize)___Common_rust_',
  'Corn_(maize)___Northern_Leaf_Blight',
  'Corn_(maize)___healthy',
  'Grape___Black_rot',
  'Grape___Esca_(Black_Measles)',
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
  'Grape___healthy',
  'Orange___Haunglongbing_(Citrus_greening)',
  'Peach___Bacterial_spot',
  'Peach___healthy',
  'Pepper,_bell___Bacterial_spot',
  'Pepper,_bell___healthy',
  'Potato___Early_blight',
  'Potato___Late_blight',
  'Potato___healthy',
  'Raspberry___healthy',
  'Soybean___healthy',
  'Squash___Powdery_mildew',
  'Strawberry___Leaf_scorch',
  'Strawberry___healthy',
  'Tomato___Bacterial_spot',
  'Tomato___Early_blight',
  'Tomato___Late_blight',
  'Tomato___Leaf_Mold',
  'Tomato___Septoria_leaf_spot',
  'Tomato___Spider_mites_Two-spotted_spider_mite',
  'Tomato___Target_Spot',
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
  'Tomato___Tomato_mosaic_virus',
  'Tomato___healthy',
];

/** Extract crop name from label like "Tomato___Late_blight" → "Tomato" */
export function getCropName(label: string): string {
  const crop = label.split('___')[0].replace(/_/g, ' ').replace(/,/g, ',');
  return crop
    .replace('(including sour)', '')
    .replace('(maize)', '')
    .replace('bell', '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Return true if the label is a healthy class */
export function isHealthyClass(label: string): boolean {
  return label.toLowerCase().endsWith('healthy');
}

/** Get human-readable disease name */
export function getDiseaseName(label: string): string {
  const parts = label.split('___');
  if (parts.length < 2) return label;
  const disease = parts[1].replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  return disease;
}

/**
 * Severity based on the type of disease.
 * This is a rough heuristic — in production, the model or a specialist should provide this.
 */
export function getSeverity(label: string): 'Low' | 'Moderate' | 'High' {
  const lower = label.toLowerCase();
  if (lower.includes('healthy')) return 'Low';
  if (lower.includes('virus') || lower.includes('greening') || lower.includes('mosaic')) return 'High';
  if (lower.includes('blight') || lower.includes('rot')) return 'High';
  if (lower.includes('mildew') || lower.includes('rust') || lower.includes('spot')) return 'Moderate';
  return 'Moderate';
}

/** Per-disease knowledge base in three languages */
type DiseaseDB = Record<string, Record<LangKey, LocalizedDiseaseInfo>>;

const DISEASE_DATA: DiseaseDB = {
  'Apple___Apple_scab': {
    en: { disease: 'Apple Scab', severity: 'Moderate', remedy: 'Captan / Mancozeb fungicide', dosage: '2g per liter of water', instructions: 'Spray every 7-10 days during wet weather. Remove fallen infected leaves.', prevention: 'Plant resistant varieties. Improve air circulation by pruning.' },
    hi: { disease: 'सेब का पपड़ी रोग', severity: 'मध्यम', remedy: 'कैप्टान / मैंकोजेब फफूंदनाशक', dosage: '2 ग्राम प्रति लीटर पानी', instructions: 'बरसात में हर 7-10 दिन छिड़काव करें। गिरी हुई संक्रमित पत्तियां हटाएं।', prevention: 'प्रतिरोधी किस्में लगाएं। छंटाई से हवा का प्रवाह बढ़ाएं।' },
    mr: { disease: 'सफरचंदाचा खरूज रोग', severity: 'मध्यम', remedy: 'कॅप्टान / मॅन्कोझेब बुरशीनाशक', dosage: '2 ग्रॅम प्रति लिटर पाणी', instructions: 'पावसाळ्यात दर 7-10 दिवसांनी फवारणी करा। गळून पडलेली बाधित पाने काढा.', prevention: 'प्रतिकारक वाण लावा. छाटणीने हवा खेळती ठेवा.' },
  },
  'Apple___Black_rot': {
    en: { disease: 'Apple Black Rot', severity: 'High', remedy: 'Thiophanate-methyl fungicide', dosage: '1.5g per liter of water', instructions: 'Spray at petal fall and repeat every 10-14 days. Remove mummified fruits.', prevention: 'Remove cankers and dead wood. Maintain good orchard sanitation.' },
    hi: { disease: 'सेब का काला सड़न', severity: 'गंभीर', remedy: 'थायोफेनेट-मिथाइल फफूंदनाशक', dosage: '1.5 ग्राम प्रति लीटर पानी', instructions: 'पंखुड़ी गिरने पर छिड़काव करें, हर 10-14 दिन दोहराएं। सड़े फल हटाएं।', prevention: 'कैंकर और मृत लकड़ी हटाएं। बाग की साफ-सफाई रखें।' },
    mr: { disease: 'सफरचंदाचा काळा कुज', severity: 'गंभीर', remedy: 'थायोफेनेट-मिथाइल बुरशीनाशक', dosage: '1.5 ग्रॅम प्रति लिटर पाणी', instructions: 'पाकळ्या गळाल्यावर फवारणी करा, दर 10-14 दिवसांनी पुन्हा करा.', prevention: 'कॅन्कर आणि मृत लाकूड काढा. बागेची स्वच्छता राखा.' },
  },
  'Apple___Cedar_apple_rust': {
    en: { disease: 'Cedar Apple Rust', severity: 'Moderate', remedy: 'Myclobutanil fungicide', dosage: '1g per liter of water', instructions: 'Apply at pink bud stage and repeat at 7-day intervals through petal fall.', prevention: 'Remove nearby cedar/juniper trees. Plant resistant varieties.' },
    hi: { disease: 'सीडर सेब जंग रोग', severity: 'मध्यम', remedy: 'माइक्लोब्यूटानिल फफूंदनाशक', dosage: '1 ग्राम प्रति लीटर पानी', instructions: 'गुलाबी कली अवस्था में लगाएं, पंखुड़ी गिरने तक 7 दिन के अंतराल पर दोहराएं।', prevention: 'पास के देवदार/जुनिपर पेड़ हटाएं। प्रतिरोधी किस्में लगाएं।' },
    mr: { disease: 'सीडर सफरचंद गंज रोग', severity: 'मध्यम', remedy: 'मायक्लोब्यूटानिल बुरशीनाशक', dosage: '1 ग्रॅम प्रति लिटर पाणी', instructions: 'गुलाबी कळी अवस्थेत लावा, पाकळ्या गळेपर्यंत 7 दिवसांच्या अंतराने पुन्हा करा.', prevention: 'जवळची देवदार/जुनिपर झाडे काढा. प्रतिकारक वाण लावा.' },
  },
  'Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot': {
    en: { disease: 'Gray Leaf Spot', severity: 'Moderate', remedy: 'Azoxystrobin / Propiconazole fungicide', dosage: '1ml per liter of water', instructions: 'Spray at first sign of lesions. Repeat every 14 days if disease persists.', prevention: 'Rotate crops. Use resistant hybrids. Manage crop residue.' },
    hi: { disease: 'धूसर पत्ती धब्बा', severity: 'मध्यम', remedy: 'एजोक्सीस्ट्रोबिन / प्रोपिकोनाज़ोल फफूंदनाशक', dosage: '1 मिली प्रति लीटर पानी', instructions: 'घाव के पहले लक्षण पर छिड़काव करें। रोग बना रहे तो 14 दिन बाद दोहराएं।', prevention: 'फसल चक्र अपनाएं। प्रतिरोधी संकर का उपयोग करें।' },
    mr: { disease: 'करड्या पानाचे ठिपके', severity: 'मध्यम', remedy: 'एजोक्सीस्ट्रोबिन / प्रोपिकोनाझोल बुरशीनाशक', dosage: '1 मिली प्रति लिटर पाणी', instructions: 'जखमांच्या पहिल्या लक्षणावर फवारणी करा. रोग कायम राहिल्यास 14 दिवसांनी पुन्हा करा.', prevention: 'पीक फेरपालट करा. प्रतिकारक संकरित वापरा.' },
  },
  'Corn_(maize)___Common_rust_': {
    en: { disease: 'Common Rust', severity: 'Moderate', remedy: 'Mancozeb / Propiconazole fungicide', dosage: '2g per liter of water', instructions: 'Spray when pustules first appear. Repeat every 10-14 days.', prevention: 'Plant resistant hybrids. Early planting reduces risk.' },
    hi: { disease: 'सामान्य जंग रोग', severity: 'मध्यम', remedy: 'मैंकोजेब / प्रोपिकोनाज़ोल फफूंदनाशक', dosage: '2 ग्राम प्रति लीटर पानी', instructions: 'दाने पहली बार दिखने पर छिड़काव करें। हर 10-14 दिन दोहराएं।', prevention: 'प्रतिरोधी संकर लगाएं। जल्दी बुवाई जोखिम कम करती है।' },
    mr: { disease: 'सामान्य गंज रोग', severity: 'मध्यम', remedy: 'मॅन्कोझेब / प्रोपिकोनाझोल बुरशीनाशक', dosage: '2 ग्रॅम प्रति लिटर पाणी', instructions: 'पुटकुळ्या पहिल्यांदा दिसल्यावर फवारणी करा. दर 10-14 दिवसांनी पुन्हा करा.', prevention: 'प्रतिकारक संकरित लावा. लवकर पेरणी धोका कमी करते.' },
  },
  'Corn_(maize)___Northern_Leaf_Blight': {
    en: { disease: 'Northern Leaf Blight', severity: 'High', remedy: 'Azoxystrobin + Propiconazole', dosage: '1ml per liter of water', instructions: 'Spray at early lesion stage. Repeat every 14 days. Cover both leaf surfaces.', prevention: 'Crop rotation with non-host crops. Tillage to bury residue.' },
    hi: { disease: 'उत्तरी पत्ती झुलसा', severity: 'गंभीर', remedy: 'एजोक्सीस्ट्रोबिन + प्रोपिकोनाज़ोल', dosage: '1 मिली प्रति लीटर पानी', instructions: 'प्रारंभिक घाव अवस्था में छिड़काव करें। हर 14 दिन दोहराएं।', prevention: 'गैर-मेजबान फसलों के साथ फसल चक्र। अवशेष दबाने के लिए जुताई।' },
    mr: { disease: 'उत्तरी पानांचा करपा', severity: 'गंभीर', remedy: 'एजोक्सीस्ट्रोबिन + प्रोपिकोनाझोल', dosage: '1 मिली प्रति लिटर पाणी', instructions: 'सुरुवातीच्या जखमेवर फवारणी करा. दर 14 दिवसांनी पुन्हा करा.', prevention: 'यजमान नसलेल्या पिकांसोबत पीक फेरपालट करा. अवशेष गाडण्यासाठी नांगरणी.' },
  },
  'Grape___Black_rot': {
    en: { disease: 'Grape Black Rot', severity: 'High', remedy: 'Mancozeb / Myclobutanil fungicide', dosage: '2g per liter of water', instructions: 'Begin sprays at bud break. Continue every 10-14 days until veraison.', prevention: 'Remove mummified berries. Prune for good air circulation.' },
    hi: { disease: 'अंगूर का काला सड़न', severity: 'गंभीर', remedy: 'मैंकोजेब / माइक्लोब्यूटानिल फफूंदनाशक', dosage: '2 ग्राम प्रति लीटर पानी', instructions: 'कली फूटने पर छिड़काव शुरू करें। वेराइसन तक हर 10-14 दिन जारी रखें।', prevention: 'सड़ी जामुन हटाएं। अच्छे वायु संचार के लिए छंटाई करें।' },
    mr: { disease: 'द्राक्षाचा काळा कुज', severity: 'गंभीर', remedy: 'मॅन्कोझेब / मायक्लोब्यूटानिल बुरशीनाशक', dosage: '2 ग्रॅम प्रति लिटर पाणी', instructions: 'कळी फुटताना फवारणी सुरू करा. व्हेरेसनपर्यंत दर 10-14 दिवसांनी सुरू ठेवा.', prevention: 'सुकलेल्या मण्या काढा. हवा खेळतीसाठी छाटणी करा.' },
  },
  'Grape___Esca_(Black_Measles)': {
    en: { disease: 'Esca (Black Measles)', severity: 'High', remedy: 'No effective chemical cure – manage symptoms', dosage: 'N/A', instructions: 'Remove and destroy severely affected vines. Apply wound sealant after pruning.', prevention: 'Avoid large pruning wounds. Use certified planting material.' },
    hi: { disease: 'एस्का (ब्लैक मीज़ल्स)', severity: 'गंभीर', remedy: 'कोई प्रभावी रासायनिक इलाज नहीं – लक्षण प्रबंधन', dosage: 'लागू नहीं', instructions: 'गंभीर रूप से प्रभावित बेलें हटाएं और नष्ट करें। छंटाई के बाद घाव सीलेंट लगाएं।', prevention: 'बड़े छंटाई घावों से बचें। प्रमाणित रोपण सामग्री का उपयोग करें।' },
    mr: { disease: 'एस्का (ब्लॅक मीझल्स)', severity: 'गंभीर', remedy: 'प्रभावी रासायनिक उपचार नाही – लक्षणे व्यवस्थापन', dosage: 'लागू नाही', instructions: 'गंभीरपणे बाधित वेली काढा आणि नष्ट करा. छाटणीनंतर जखम सीलंट लावा.', prevention: 'मोठ्या छाटणी जखमा टाळा. प्रमाणित लागवड साहित्य वापरा.' },
  },
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': {
    en: { disease: 'Grape Leaf Blight', severity: 'Moderate', remedy: 'Copper-based fungicide', dosage: '3g per liter of water', instructions: 'Spray at first sign of spotting. Repeat every 10 days.', prevention: 'Ensure good drainage. Avoid overhead irrigation.' },
    hi: { disease: 'अंगूर पत्ती झुलसा', severity: 'मध्यम', remedy: 'तांबा आधारित फफूंदनाशक', dosage: '3 ग्राम प्रति लीटर पानी', instructions: 'धब्बे के पहले लक्षण पर छिड़काव करें। हर 10 दिन दोहराएं।', prevention: 'अच्छी जल निकासी सुनिश्चित करें। ऊपर से सिंचाई से बचें।' },
    mr: { disease: 'द्राक्षा पानांचा करपा', severity: 'मध्यम', remedy: 'तांबे आधारित बुरशीनाशक', dosage: '3 ग्रॅम प्रति लिटर पाणी', instructions: 'ठिपक्यांच्या पहिल्या लक्षणावर फवारणी करा. दर 10 दिवसांनी पुन्हा करा.', prevention: 'चांगला निचरा सुनिश्चित करा. वरून पाणी देणे टाळा.' },
  },
  'Orange___Haunglongbing_(Citrus_greening)': {
    en: { disease: 'Citrus Greening (HLB)', severity: 'High', remedy: 'No cure – control psyllid vector + nutrient management', dosage: 'Imidacloprid 0.5ml/L for psyllid', instructions: 'Apply systemic insecticide for psyllid control. Supplement with foliar micronutrients (Zn, Mn, Fe).', prevention: 'Use disease-free nursery stock. Control Asian citrus psyllid populations.' },
    hi: { disease: 'साइट्रस ग्रीनिंग (HLB)', severity: 'गंभीर', remedy: 'कोई इलाज नहीं – सिल्लिड नियंत्रण + पोषक प्रबंधन', dosage: 'इमिडाक्लोप्रिड 0.5 मिली/लीटर', instructions: 'सिल्लिड नियंत्रण के लिए प्रणालीगत कीटनाशक लगाएं। पर्ण सूक्ष्म पोषक (Zn, Mn, Fe) का पूरक दें।', prevention: 'रोग-मुक्त नर्सरी स्टॉक का उपयोग करें। एशियाई साइट्रस सिल्लिड को नियंत्रित करें।' },
    mr: { disease: 'सायट्रस ग्रीनिंग (HLB)', severity: 'गंभीर', remedy: 'उपचार नाही – सिल्लिड नियंत्रण + पोषक व्यवस्थापन', dosage: 'इमिडाक्लोप्रिड 0.5 मिली/लिटर', instructions: 'सिल्लिड नियंत्रणासाठी प्रणालीगत कीटकनाशक लावा. पर्णीय सूक्ष्म पोषक (Zn, Mn, Fe) पूरक द्या.', prevention: 'रोग-मुक्त रोपवाटिका साठा वापरा. आशियाई सायट्रस सिल्लिड नियंत्रित करा.' },
  },
  'Peach___Bacterial_spot': {
    en: { disease: 'Bacterial Spot', severity: 'Moderate', remedy: 'Copper hydroxide + Mancozeb', dosage: '2g copper + 2g mancozeb per liter', instructions: 'Start application at petal fall. Repeat every 7-10 days.', prevention: 'Plant resistant varieties. Avoid overhead irrigation.' },
    hi: { disease: 'जीवाणु धब्बा', severity: 'मध्यम', remedy: 'कॉपर हाइड्रॉक्साइड + मैंकोजेब', dosage: '2 ग्राम कॉपर + 2 ग्राम मैंकोजेब प्रति लीटर', instructions: 'पंखुड़ी गिरने पर लगाना शुरू करें। हर 7-10 दिन दोहराएं।', prevention: 'प्रतिरोधी किस्में लगाएं। ऊपर से सिंचाई से बचें।' },
    mr: { disease: 'जीवाणू ठिपके', severity: 'मध्यम', remedy: 'कॉपर हायड्रॉक्साइड + मॅन्कोझेब', dosage: '2 ग्रॅम कॉपर + 2 ग्रॅम मॅन्कोझेब प्रति लिटर', instructions: 'पाकळ्या गळाल्यावर लागू करणे सुरू करा. दर 7-10 दिवसांनी पुन्हा करा.', prevention: 'प्रतिकारक वाण लावा. वरून पाणी देणे टाळा.' },
  },
  'Pepper,_bell___Bacterial_spot': {
    en: { disease: 'Bacterial Spot', severity: 'Moderate', remedy: 'Copper-based bactericide + Mancozeb', dosage: '2g per liter of water', instructions: 'Spray every 7-10 days. Avoid working with wet plants.', prevention: 'Use certified disease-free seeds. Crop rotation (2-3 years).' },
    hi: { disease: 'जीवाणु धब्बा', severity: 'मध्यम', remedy: 'तांबा आधारित जीवाणुनाशक + मैंकोजेब', dosage: '2 ग्राम प्रति लीटर पानी', instructions: 'हर 7-10 दिन छिड़काव करें। गीले पौधों के साथ काम करने से बचें।', prevention: 'प्रमाणित रोग-मुक्त बीज का उपयोग करें। फसल चक्र (2-3 वर्ष)।' },
    mr: { disease: 'जीवाणू ठिपके', severity: 'मध्यम', remedy: 'तांबे आधारित जीवाणूनाशक + मॅन्कोझेब', dosage: '2 ग्रॅम प्रति लिटर पाणी', instructions: 'दर 7-10 दिवसांनी फवारणी करा. ओल्या झाडांसोबत काम करणे टाळा.', prevention: 'प्रमाणित रोग-मुक्त बियाणे वापरा. पीक फेरपालट (2-3 वर्षे).' },
  },
  'Potato___Early_blight': {
    en: { disease: 'Early Blight', severity: 'Moderate', remedy: 'Mancozeb / Chlorothalonil fungicide', dosage: '2.5g per liter of water', instructions: 'Apply at first sign of lesions. Repeat every 7-10 days.', prevention: 'Rotate crops (3 year). Remove plant debris after harvest.' },
    hi: { disease: 'अगेती झुलसा', severity: 'मध्यम', remedy: 'मैंकोजेब / क्लोरोथालोनिल फफूंदनाशक', dosage: '2.5 ग्राम प्रति लीटर पानी', instructions: 'घाव के पहले लक्षण पर लगाएं। हर 7-10 दिन दोहराएं।', prevention: 'फसल चक्र (3 वर्ष) अपनाएं। कटाई के बाद पौधे के अवशेष हटाएं।' },
    mr: { disease: 'लवकर करपा', severity: 'मध्यम', remedy: 'मॅन्कोझेब / क्लोरोथॅलोनिल बुरशीनाशक', dosage: '2.5 ग्रॅम प्रति लिटर पाणी', instructions: 'जखमांच्या पहिल्या लक्षणावर लावा. दर 7-10 दिवसांनी पुन्हा करा.', prevention: 'पीक फेरपालट (3 वर्षे) करा. काढणीनंतर पीक अवशेष काढा.' },
  },
  'Potato___Late_blight': {
    en: { disease: 'Late Blight', severity: 'High', remedy: 'Mancozeb / Metalaxyl fungicide', dosage: '2g per liter of water', instructions: 'Spray on affected leaves every 7 days. Repeat 3 times.', prevention: 'Avoid overhead irrigation. Remove infected leaves immediately.' },
    hi: { disease: 'झुलसा रोग (लेट ब्लाइट)', severity: 'गंभीर', remedy: 'मैंकोजेब / मेटालैक्सिल फफूंदनाशक', dosage: '2 ग्राम प्रति लीटर पानी', instructions: 'प्रभावित पत्तियों पर हर 7 दिन छिड़काव करें। 3 बार दोहराएं।', prevention: 'ऊपर से सिंचाई से बचें। संक्रमित पत्तियों को तुरंत हटाएं।' },
    mr: { disease: 'करपा रोग (लेट ब्लाइट)', severity: 'गंभीर', remedy: 'मॅन्कोझेब / मेटालॅक्सिल बुरशीनाशक', dosage: '2 ग्रॅम प्रति लिटर पाणी', instructions: 'प्रभावित पानांवर दर 7 दिवसांनी फवारणी करा. 3 वेळा पुन्हा करा.', prevention: 'वरून पाणी देणे टाळा. बाधित पाने लगेच काढा.' },
  },
  'Squash___Powdery_mildew': {
    en: { disease: 'Powdery Mildew', severity: 'Moderate', remedy: 'Sulfur / Potassium bicarbonate', dosage: '3g sulfur per liter of water', instructions: 'Spray at first sign of white patches. Repeat every 7 days.', prevention: 'Ensure good air flow. Avoid excess nitrogen fertilizer.' },
    hi: { disease: 'चूर्णिल आसिता', severity: 'मध्यम', remedy: 'गंधक / पोटेशियम बाइकार्बोनेट', dosage: '3 ग्राम गंधक प्रति लीटर पानी', instructions: 'सफेद धब्बों के पहले लक्षण पर छिड़काव करें। हर 7 दिन दोहराएं।', prevention: 'अच्छा वायु प्रवाह सुनिश्चित करें। अत्यधिक नाइट्रोजन उर्वरक से बचें।' },
    mr: { disease: 'भुरी (पावडरी मिल्ड्यू)', severity: 'मध्यम', remedy: 'गंधक / पोटॅशियम बायकार्बोनेट', dosage: '3 ग्रॅम गंधक प्रति लिटर पाणी', instructions: 'पांढऱ्या ठिपक्यांच्या पहिल्या लक्षणावर फवारणी करा. दर 7 दिवसांनी पुन्हा करा.', prevention: 'चांगला हवा प्रवाह सुनिश्चित करा. जास्त नायट्रोजन खत टाळा.' },
  },
  'Cherry_(including_sour)___Powdery_mildew': {
    en: { disease: 'Cherry Powdery Mildew', severity: 'Moderate', remedy: 'Sulfur / Myclobutanil fungicide', dosage: '2g per liter of water', instructions: 'Spray when white patches appear. Repeat every 10-14 days.', prevention: 'Prune for air circulation. Avoid overhead watering.' },
    hi: { disease: 'चेरी चूर्णिल आसिता', severity: 'मध्यम', remedy: 'गंधक / माइक्लोब्यूटानिल फफूंदनाशक', dosage: '2 ग्राम प्रति लीटर पानी', instructions: 'सफेद धब्बे दिखने पर छिड़काव करें। हर 10-14 दिन दोहराएं।', prevention: 'हवा के लिए छंटाई करें। ऊपर से पानी देने से बचें।' },
    mr: { disease: 'चेरी भुरी', severity: 'मध्यम', remedy: 'गंधक / मायक्लोब्यूटानिल बुरशीनाशक', dosage: '2 ग्रॅम प्रति लिटर पाणी', instructions: 'पांढरे ठिपके दिसल्यावर फवारणी करा. दर 10-14 दिवसांनी पुन्हा करा.', prevention: 'हवेसाठी छाटणी करा. वरून पाणी देणे टाळा.' },
  },
  'Strawberry___Leaf_scorch': {
    en: { disease: 'Strawberry Leaf Scorch', severity: 'Moderate', remedy: 'Captan / Copper-based fungicide', dosage: '2g per liter of water', instructions: 'Spray at first sign. Remove heavily infected leaves. Repeat every 10 days.', prevention: 'Use drip irrigation. Renovate beds after harvest.' },
    hi: { disease: 'स्ट्रॉबेरी पत्ती झुलसा', severity: 'मध्यम', remedy: 'कैप्टान / तांबा आधारित फफूंदनाशक', dosage: '2 ग्राम प्रति लीटर पानी', instructions: 'पहले लक्षण पर छिड़काव करें। भारी संक्रमित पत्तियां हटाएं। हर 10 दिन दोहराएं।', prevention: 'ड्रिप सिंचाई का उपयोग करें। कटाई के बाद क्यारी का नवीनीकरण करें।' },
    mr: { disease: 'स्ट्रॉबेरी पान करपा', severity: 'मध्यम', remedy: 'कॅप्टान / तांबे आधारित बुरशीनाशक', dosage: '2 ग्रॅम प्रति लिटर पाणी', instructions: 'पहिल्या लक्षणावर फवारणी करा. जास्त बाधित पाने काढा. दर 10 दिवसांनी पुन्हा करा.', prevention: 'ठिबक सिंचन वापरा. काढणीनंतर वाफे नूतनीकरण करा.' },
  },
  'Tomato___Bacterial_spot': {
    en: { disease: 'Bacterial Spot', severity: 'Moderate', remedy: 'Copper hydroxide + Mancozeb', dosage: '2g per liter of water', instructions: 'Spray every 5-7 days in wet weather. Start at transplanting.', prevention: 'Use disease-free seeds/transplants. Avoid overhead irrigation.' },
    hi: { disease: 'जीवाणु धब्बा', severity: 'मध्यम', remedy: 'कॉपर हाइड्रॉक्साइड + मैंकोजेब', dosage: '2 ग्राम प्रति लीटर पानी', instructions: 'गीले मौसम में हर 5-7 दिन छिड़काव करें। रोपाई से शुरू करें।', prevention: 'रोग-मुक्त बीज/रोपे का उपयोग करें। ऊपर से सिंचाई से बचें।' },
    mr: { disease: 'जीवाणू ठिपके', severity: 'मध्यम', remedy: 'कॉपर हायड्रॉक्साइड + मॅन्कोझेब', dosage: '2 ग्रॅम प्रति लिटर पाणी', instructions: 'ओल्या हवामानात दर 5-7 दिवसांनी फवारणी करा. पुनर्लागवडीपासून सुरू करा.', prevention: 'रोग-मुक्त बियाणे/रोपे वापरा. वरून पाणी देणे टाळा.' },
  },
  'Tomato___Early_blight': {
    en: { disease: 'Early Blight', severity: 'Moderate', remedy: 'Chlorothalonil / Mancozeb', dosage: '2g per liter of water', instructions: 'Spray every 7-10 days when symptoms appear. Cover lower leaves well.', prevention: 'Mulch around base. Stake plants for air circulation. Rotate crops.' },
    hi: { disease: 'अगेती झुलसा', severity: 'मध्यम', remedy: 'क्लोरोथालोनिल / मैंकोजेब', dosage: '2 ग्राम प्रति लीटर पानी', instructions: 'लक्षण दिखने पर हर 7-10 दिन छिड़काव करें। निचली पत्तियों को अच्छे से ढकें।', prevention: 'आधार के चारों ओर मल्च करें। हवा के लिए पौधों को सहारा दें। फसल चक्र।' },
    mr: { disease: 'लवकर करपा', severity: 'मध्यम', remedy: 'क्लोरोथॅलोनिल / मॅन्कोझेब', dosage: '2 ग्रॅम प्रति लिटर पाणी', instructions: 'लक्षणे दिसल्यावर दर 7-10 दिवसांनी फवारणी करा. खालची पाने चांगली झाका.', prevention: 'बुंध्याभोवती आच्छादन करा. हवेसाठी झाडांना आधार द्या. पीक फेरपालट.' },
  },
  'Tomato___Late_blight': {
    en: { disease: 'Late Blight', severity: 'High', remedy: 'Mancozeb / Metalaxyl-M', dosage: '2.5g per liter of water', instructions: 'Spray immediately at first sign. Repeat every 5-7 days in wet conditions.', prevention: 'Destroy infected plants. Avoid overhead watering. Use resistant varieties.' },
    hi: { disease: 'झुलसा रोग (लेट ब्लाइट)', severity: 'गंभीर', remedy: 'मैंकोजेब / मेटालैक्सिल-एम', dosage: '2.5 ग्राम प्रति लीटर पानी', instructions: 'पहले लक्षण पर तुरंत छिड़काव करें। गीली स्थिति में हर 5-7 दिन दोहराएं।', prevention: 'संक्रमित पौधे नष्ट करें। ऊपर से पानी देने से बचें। प्रतिरोधी किस्में उपयोग करें।' },
    mr: { disease: 'करपा रोग (लेट ब्लाइट)', severity: 'गंभीर', remedy: 'मॅन्कोझेब / मेटालॅक्सिल-एम', dosage: '2.5 ग्रॅम प्रति लिटर पाणी', instructions: 'पहिल्या लक्षणावर लगेच फवारणी करा. ओल्या परिस्थितीत दर 5-7 दिवसांनी पुन्हा करा.', prevention: 'बाधित झाडे नष्ट करा. वरून पाणी देणे टाळा. प्रतिकारक वाण वापरा.' },
  },
  'Tomato___Leaf_Mold': {
    en: { disease: 'Leaf Mold', severity: 'Moderate', remedy: 'Chlorothalonil / Copper fungicide', dosage: '2g per liter of water', instructions: 'Spray at first sign of yellowing on upper leaf surface. Repeat every 7-10 days.', prevention: 'Improve ventilation in greenhouse. Reduce humidity.' },
    hi: { disease: 'पत्ती फफूंद', severity: 'मध्यम', remedy: 'क्लोरोथालोनिल / कॉपर फफूंदनाशक', dosage: '2 ग्राम प्रति लीटर पानी', instructions: 'ऊपरी पत्ती की सतह पर पीलापन के पहले लक्षण पर छिड़काव करें। हर 7-10 दिन दोहराएं।', prevention: 'ग्रीनहाउस में वेंटिलेशन सुधारें। नमी कम करें।' },
    mr: { disease: 'पान बुरशी', severity: 'मध्यम', remedy: 'क्लोरोथॅलोनिल / कॉपर बुरशीनाशक', dosage: '2 ग्रॅम प्रति लिटर पाणी', instructions: 'वरच्या पानाच्या पृष्ठभागावर पिवळेपणाच्या पहिल्या लक्षणावर फवारणी करा. दर 7-10 दिवसांनी पुन्हा करा.', prevention: 'हरितगृहात वायुवीजन सुधारा. आर्द्रता कमी करा.' },
  },
  'Tomato___Septoria_leaf_spot': {
    en: { disease: 'Septoria Leaf Spot', severity: 'Moderate', remedy: 'Chlorothalonil / Mancozeb', dosage: '2g per liter of water', instructions: 'Begin spraying when first spots appear on lower leaves. Repeat every 7-10 days.', prevention: 'Remove infected debris. Mulch around plants. Rotate crops.' },
    hi: { disease: 'सेप्टोरिया पत्ती धब्बा', severity: 'मध्यम', remedy: 'क्लोरोथालोनिल / मैंकोजेब', dosage: '2 ग्राम प्रति लीटर पानी', instructions: 'निचली पत्तियों पर पहले धब्बे दिखने पर छिड़काव शुरू करें। हर 7-10 दिन दोहराएं।', prevention: 'संक्रमित मलबा हटाएं। पौधों के चारों ओर मल्च करें। फसल चक्र।' },
    mr: { disease: 'सेप्टोरिया पान ठिपके', severity: 'मध्यम', remedy: 'क्लोरोथॅलोनिल / मॅन्कोझेब', dosage: '2 ग्रॅम प्रति लिटर पाणी', instructions: 'खालच्या पानांवर पहिले ठिपके दिसल्यावर फवारणी सुरू करा. दर 7-10 दिवसांनी पुन्हा करा.', prevention: 'बाधित अवशेष काढा. झाडांभोवती आच्छादन करा. पीक फेरपालट.' },
  },
  'Tomato___Spider_mites_Two-spotted_spider_mite': {
    en: { disease: 'Spider Mites', severity: 'Moderate', remedy: 'Abamectin / Neem oil', dosage: '0.5ml Abamectin or 5ml Neem oil per liter', instructions: 'Spray undersides of leaves thoroughly. Repeat every 5-7 days for 3 applications.', prevention: 'Maintain humidity. Avoid dusty conditions. Introduce predatory mites.' },
    hi: { disease: 'मकड़ी माइट', severity: 'मध्यम', remedy: 'एबामेक्टिन / नीम तेल', dosage: '0.5 मिली एबामेक्टिन या 5 मिली नीम तेल प्रति लीटर', instructions: 'पत्तियों के नीचे की तरफ अच्छी तरह छिड़काव करें। 3 बार हर 5-7 दिन दोहराएं।', prevention: 'नमी बनाए रखें। धूल भरी स्थिति से बचें। शिकारी माइट छोड़ें।' },
    mr: { disease: 'कोळी माइट', severity: 'मध्यम', remedy: 'अॅबामेक्टिन / कडुनिंबाचे तेल', dosage: '0.5 मिली अॅबामेक्टिन किंवा 5 मिली कडुनिंबाचे तेल प्रति लिटर', instructions: 'पानांच्या खालच्या बाजूस पूर्णपणे फवारणी करा. 3 वेळा दर 5-7 दिवसांनी पुन्हा करा.', prevention: 'आर्द्रता राखा. धुळीची परिस्थिती टाळा. शिकारी माइट सोडा.' },
  },
  'Tomato___Target_Spot': {
    en: { disease: 'Target Spot', severity: 'Moderate', remedy: 'Chlorothalonil / Azoxystrobin', dosage: '2g per liter of water', instructions: 'Spray at first sign of target-like spots. Repeat every 7-10 days.', prevention: 'Improve air circulation. Avoid overhead watering. Remove lower leaves.' },
    hi: { disease: 'लक्ष्य धब्बा', severity: 'मध्यम', remedy: 'क्लोरोथालोनिल / एजोक्सीस्ट्रोबिन', dosage: '2 ग्राम प्रति लीटर पानी', instructions: 'लक्ष्य जैसे धब्बों के पहले लक्षण पर छिड़काव करें। हर 7-10 दिन दोहराएं।', prevention: 'हवा का प्रवाह सुधारें। ऊपर से पानी से बचें। निचली पत्तियां हटाएं।' },
    mr: { disease: 'लक्ष्य ठिपके', severity: 'मध्यम', remedy: 'क्लोरोथॅलोनिल / एजोक्सीस्ट्रोबिन', dosage: '2 ग्रॅम प्रति लिटर पाणी', instructions: 'लक्ष्यासारख्या ठिपक्यांच्या पहिल्या लक्षणावर फवारणी करा. दर 7-10 दिवसांनी पुन्हा करा.', prevention: 'हवा खेळती सुधारा. वरून पाणी देणे टाळा. खालची पाने काढा.' },
  },
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {
    en: { disease: 'Yellow Leaf Curl Virus', severity: 'High', remedy: 'No cure – control whitefly vector', dosage: 'Imidacloprid 0.3ml/L for whitefly', instructions: 'Remove infected plants immediately. Apply systemic insecticide for whitefly control.', prevention: 'Use virus-resistant varieties. Install UV-reflective mulch. Use fine-mesh netting.' },
    hi: { disease: 'पीला पत्ती मरोड़ विषाणु', severity: 'गंभीर', remedy: 'कोई इलाज नहीं – सफेद मक्खी नियंत्रण', dosage: 'इमिडाक्लोप्रिड 0.3 मिली/लीटर', instructions: 'संक्रमित पौधे तुरंत हटाएं। सफेद मक्खी नियंत्रण के लिए प्रणालीगत कीटनाशक लगाएं।', prevention: 'विषाणु-प्रतिरोधी किस्में उपयोग करें। UV-परावर्तक मल्च लगाएं।' },
    mr: { disease: 'पिवळा पान मुरगळ विषाणू', severity: 'गंभीर', remedy: 'उपचार नाही – पांढरी माशी नियंत्रण', dosage: 'इमिडाक्लोप्रिड 0.3 मिली/लिटर', instructions: 'बाधित झाडे लगेच काढा. पांढऱ्या माशी नियंत्रणासाठी प्रणालीगत कीटकनाशक लावा.', prevention: 'विषाणू-प्रतिकारक वाण वापरा. UV-परावर्तक आच्छादन लावा.' },
  },
  'Tomato___Tomato_mosaic_virus': {
    en: { disease: 'Tomato Mosaic Virus', severity: 'High', remedy: 'No chemical cure – manage hygiene', dosage: 'N/A', instructions: 'Remove and destroy infected plants. Disinfect tools with 10% bleach solution.', prevention: 'Use resistant varieties. Wash hands before handling plants. Disinfect tools.' },
    hi: { disease: 'टमाटर मोज़ेक विषाणु', severity: 'गंभीर', remedy: 'कोई रासायनिक इलाज नहीं – स्वच्छता प्रबंधन', dosage: 'लागू नहीं', instructions: 'संक्रमित पौधे हटाएं और नष्ट करें। उपकरणों को 10% ब्लीच से कीटाणुरहित करें।', prevention: 'प्रतिरोधी किस्में उपयोग करें। पौधों को छूने से पहले हाथ धोएं।' },
    mr: { disease: 'टोमॅटो मोज़ेक विषाणू', severity: 'गंभीर', remedy: 'रासायनिक उपचार नाही – स्वच्छता व्यवस्थापन', dosage: 'लागू नाही', instructions: 'बाधित झाडे काढा आणि नष्ट करा. साधने 10% ब्लीचने निर्जंतुक करा.', prevention: 'प्रतिकारक वाण वापरा. झाडे हाताळण्यापूर्वी हात धुवा.' },
  },
};

/**
 * Generic healthy plant data for any crop.
 */
function getHealthyData(cropName: string): Record<LangKey, LocalizedDiseaseInfo> {
  return {
    en: {
      disease: `Healthy ${cropName}`,
      severity: 'None',
      remedy: 'No treatment needed',
      dosage: 'N/A',
      instructions: 'Your plant looks healthy! Continue regular care and monitoring.',
      prevention: 'Maintain good agricultural practices. Regular watering, proper spacing, and balanced fertilization.',
    },
    hi: {
      disease: `स्वस्थ ${cropName}`,
      severity: 'कोई नहीं',
      remedy: 'किसी उपचार की आवश्यकता नहीं',
      dosage: 'लागू नहीं',
      instructions: 'आपका पौधा स्वस्थ दिखता है! नियमित देखभाल और निगरानी जारी रखें।',
      prevention: 'अच्छी कृषि पद्धतियां बनाए रखें। नियमित पानी, उचित दूरी और संतुलित उर्वरक।',
    },
    mr: {
      disease: `निरोगी ${cropName}`,
      severity: 'काहीही नाही',
      remedy: 'उपचाराची गरज नाही',
      dosage: 'लागू नाही',
      instructions: 'तुमचे झाड निरोगी दिसते! नियमित काळजी आणि देखरेख सुरू ठेवा.',
      prevention: 'चांगल्या शेती पद्धती राखा. नियमित पाणी, योग्य अंतर आणि संतुलित खत.',
    },
  };
}

/**
 * Get the localized disease info for a given label and language.
 */
export function getDiseaseInfo(label: string, lang: LangKey): LocalizedDiseaseInfo {
  // Check if it's a healthy class
  if (isHealthyClass(label)) {
    const cropName = getCropName(label);
    return getHealthyData(cropName)[lang];
  }

  // Look up in the database
  if (DISEASE_DATA[label]) {
    return DISEASE_DATA[label][lang] || DISEASE_DATA[label].en;
  }

  // Fallback for unknown diseases
  const diseaseName = getDiseaseName(label);
  const cropName = getCropName(label);
  return {
    disease: `${diseaseName} (${cropName})`,
    severity: lang === 'en' ? 'Unknown' : lang === 'hi' ? 'अज्ञात' : 'अज्ञात',
    remedy: lang === 'en' ? 'Consult a local agricultural expert' : lang === 'hi' ? 'स्थानीय कृषि विशेषज्ञ से परामर्श करें' : 'स्थानिक कृषी तज्ञांचा सल्ला घ्या',
    dosage: lang === 'en' ? 'N/A' : 'लागू नहीं',
    instructions: lang === 'en' ? 'Please consult your nearest agricultural extension center for specific treatment.' : lang === 'hi' ? 'विशिष्ट उपचार के लिए अपने निकटतम कृषि विस्तार केंद्र से परामर्श करें।' : 'विशिष्ट उपचारासाठी जवळच्या कृषी विस्तार केंद्राचा सल्ला घ्या.',
    prevention: lang === 'en' ? 'Practice crop rotation and maintain field hygiene.' : lang === 'hi' ? 'फसल चक्र अपनाएं और खेत की स्वच्छता बनाए रखें।' : 'पीक फेरपालट करा आणि शेताची स्वच्छता राखा.',
  };
}
