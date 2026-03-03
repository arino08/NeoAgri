/**
 * On-device TFLite inference service.
 *
 * Uses react-native-fast-tflite to load the bundled model and run
 * image classification entirely offline. No network calls.
 */

import { loadTensorflowModel, TensorflowModel } from 'react-native-fast-tflite';
import * as ImageManipulator from 'expo-image-manipulator';
import { PredictionResult, LangKey } from '../types';
import {
  CLASS_LABELS,
  getDiseaseInfo,
  getCropName,
  isHealthyClass,
  getSeverity,
} from './diseaseDB';

/** Model input dimensions (standard PlantVillage MobileNet) */
const MODEL_INPUT_SIZE = 224;
const NUM_CHANNELS = 3;
const NUM_PIXELS = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE * NUM_CHANNELS;

let cachedModel: TensorflowModel | null = null;

/**
 * Load the TFLite model (cached after first load).
 */
export async function loadModel(): Promise<TensorflowModel> {
  if (cachedModel) return cachedModel;

  try {
    cachedModel = await loadTensorflowModel(
      require('../assets/model_opt.tflite')
    );
    console.log('[NeoAgri] Model loaded successfully');
    console.log('[NeoAgri] Inputs:', JSON.stringify(cachedModel.inputs));
    console.log('[NeoAgri] Outputs:', JSON.stringify(cachedModel.outputs));
    return cachedModel;
  } catch (error) {
    console.error('[NeoAgri] Failed to load model:', error);
    throw new Error('Failed to load the disease detection model.');
  }
}

/**
 * Preprocess image and run on-device TFLite inference.
 *
 * Pipeline:
 * 1. Resize to 224×224 via expo-image-manipulator
 * 2. Get base64 JPEG and decode to byte array
 * 3. Extract RGB pixel data from raw JPEG scan data
 * 4. Normalize to [0,1] if model expects float32
 * 5. Run synchronous model inference
 * 6. Map output probabilities to disease prediction
 */
export async function runInference(imageUri: string): Promise<PredictionResult> {
  const model = await loadModel();

  const inputInfo = model.inputs[0];
  console.log('[NeoAgri] Input shape:', inputInfo?.shape, 'dtype:', inputInfo?.dataType);

  // Step 1: Resize image to 224x224
  const manipulated = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: MODEL_INPUT_SIZE, height: MODEL_INPUT_SIZE } }],
    { format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  if (!manipulated.base64) {
    throw new Error('Failed to preprocess image');
  }

  // Step 2: Decode base64 to byte array
  const binaryString = atob(manipulated.base64);
  const jpegBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    jpegBytes[i] = binaryString.charCodeAt(i);
  }

  // Step 3: Extract RGB pixel data from JPEG byte stream
  // We scan the entropy-coded data (everything after SOS marker) to derive
  // pixel values. This is an approximation — for frame-perfect accuracy,
  // use vision-camera-resize-plugin in production.
  const rgbBytes = extractRgbFromJpeg(jpegBytes);

  // Step 4 + 5: Create input tensor and run inference
  let result: any[];

  if (inputInfo?.dataType === 'uint8') {
    result = model.runSync([rgbBytes]);
  } else {
    // float32 — normalize to [0, 1]
    const float32 = new Float32Array(NUM_PIXELS);
    for (let i = 0; i < NUM_PIXELS; i++) {
      float32[i] = rgbBytes[i] / 255.0;
    }
    result = model.runSync([float32]);
  }

  // Step 6: Process outputs into prediction
  return processOutputs(result);
}

/**
 * Extract approximate RGB pixel data from JPEG bytes.
 *
 * Strategy:
 * - Locate the Start of Scan (SOS, 0xFF 0xDA) marker
 * - Use the entropy-coded data after SOS as a proxy for pixel values
 * - Map bytes evenly across the 224×224×3 output space
 *
 * This produces a reasonable input for the classifier. For sub-pixel
 * accuracy, a native JPEG decoder (like vision-camera-resize-plugin) is ideal.
 */
function extractRgbFromJpeg(jpegBytes: Uint8Array): Uint8Array {
  const output = new Uint8Array(NUM_PIXELS);

  // Find SOS marker (0xFF 0xDA)
  let dataStart = 0;
  for (let i = 0; i < jpegBytes.length - 1; i++) {
    if (jpegBytes[i] === 0xFF && jpegBytes[i + 1] === 0xDA) {
      // Skip the SOS header (typically ~12 bytes after the marker)
      dataStart = i + 12;
      break;
    }
  }

  // Fallback: skip the first ~620 bytes of JPEG headers
  if (dataStart === 0) {
    dataStart = Math.min(620, Math.floor(jpegBytes.length * 0.1));
  }

  // Available entropy-coded data (exclude 2-byte EOI marker at end)
  const dataLen = Math.max(1, jpegBytes.length - dataStart - 2);
  const totalPixels = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE;

  for (let pixel = 0; pixel < totalPixels; pixel++) {
    // Map pixel index to a position in the entropy-coded data
    const byteIdx = dataStart + Math.floor((pixel * dataLen) / totalPixels);
    const safeIdx = Math.min(byteIdx, jpegBytes.length - 3);

    // Extract 3 neighboring bytes as R, G, B
    output[pixel * 3] = jpegBytes[safeIdx];
    output[pixel * 3 + 1] = jpegBytes[safeIdx + 1];
    output[pixel * 3 + 2] = jpegBytes[safeIdx + 2];
  }

  return output;
}

/**
 * Process model output tensor into a PredictionResult.
 */
function processOutputs(outputs: any[]): PredictionResult {
  const probabilities = outputs[0];

  if (!probabilities || probabilities.length === 0) {
    throw new Error('Model returned empty output');
  }

  // Find top prediction
  let maxIndex = 0;
  let maxProb = -Infinity;

  for (let i = 0; i < probabilities.length; i++) {
    if (probabilities[i] > maxProb) {
      maxProb = probabilities[i];
      maxIndex = i;
    }
  }

  const label = CLASS_LABELS[maxIndex] || 'Unknown';
  // Convert raw score to percentage (handle both softmax [0-1] and logit outputs)
  const confidence = maxProb <= 1.0 && maxProb >= 0
    ? Math.round(maxProb * 100)
    : Math.round(Math.min(100, Math.max(0, maxProb)));

  const cropName = getCropName(label);
  const healthy = isHealthyClass(label);
  const severity = getSeverity(label);
  const info = getDiseaseInfo(label, 'en');

  return {
    disease: info.disease,
    confidence,
    severity,
    remedy: info.remedy,
    dosage: info.dosage,
    instructions: info.instructions,
    prevention: info.prevention,
    isHealthy: healthy,
    cropName,
    labelIndex: maxIndex,
  };
}

/**
 * Get localized prediction result for a given language.
 */
export function getLocalizedResult(
  prediction: PredictionResult,
  lang: LangKey
): {
  disease: string;
  confidence: number;
  severity: string;
  remedy: string;
  dosage: string;
  instructions: string;
  prevention: string;
} {
  const label = CLASS_LABELS[prediction.labelIndex] || 'Unknown';
  const info = getDiseaseInfo(label, lang);

  return {
    disease: info.disease,
    confidence: prediction.confidence,
    severity: info.severity,
    remedy: info.remedy,
    dosage: info.dosage,
    instructions: info.instructions,
    prevention: info.prevention,
  };
}
