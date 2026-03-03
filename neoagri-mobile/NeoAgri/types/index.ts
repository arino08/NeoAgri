/** Shared types for NeoAgri */

export interface PredictionResult {
  disease: string;
  confidence: number;
  severity: 'Low' | 'Moderate' | 'High';
  remedy: string;
  dosage: string;
  instructions: string;
  prevention: string;
  isHealthy: boolean;
  cropName: string;
  labelIndex: number;
}

export interface ScanRecord {
  id: string;
  photoUri: string;
  timestamp: number;
  prediction: PredictionResult;
  language: string;
}

export type LangKey = 'en' | 'hi' | 'mr';

export interface LocalizedDiseaseInfo {
  disease: string;
  severity: string;
  remedy: string;
  dosage: string;
  instructions: string;
  prevention: string;
}
