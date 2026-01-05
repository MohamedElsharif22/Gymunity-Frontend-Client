/**
 * Body State and Health Tracking Models
 * Aligns with Gymunity Backend API specification
 */

/**
 * Body state log for tracking progress
 * Records weight, body composition, measurements, and photos
 */
export interface BodyStateLog {
  id: number;
  clientProfileId: number;
  weightKg: number;
  bodyFatPercent?: number;
  measurementsJson?: string;
  photoFrontUrl?: string;
  photoSideUrl?: string;
  photoBackUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
