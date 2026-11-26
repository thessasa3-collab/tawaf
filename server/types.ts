export type LanguageCode = 'ar' | 'en' | 'ur' | 'id';
export type TriageLevel = 'critical' | 'urgent' | 'stable';
export type ConsciousState = 'conscious' | 'confused' | 'unconscious';
export type HaramZone = 'mataf' | 'masa' | 'courtyards' | 'prayer_halls' | 'gates';
export type CaseStatus = 'open' | 'dispatched' | 'resolved';
export type TriageSource = 'ai' | 'local';
export type UserRole = 'admin' | 'responder';

export type BodyPartId =
  | 'head'
  | 'neck'
  | 'chest'
  | 'abdomen'
  | 'back'
  | 'left_arm'
  | 'right_arm'
  | 'left_leg'
  | 'right_leg'
  | 'feet';

export interface GpsLocation {
  lat: number;
  lng: number;
  accuracy: number | null;
  capturedAt: string;
  consentGiven: boolean;
}

export interface ResponderReportPayload {
  clinicalImpression: string;
  immediateActions: string[];
  recommendedEquipment: string;
  fieldPrecautions: string;
}

export interface TriageCaseRecord {
  id: string;
  level: TriageLevel;
  status: CaseStatus;
  source: TriageSource;
  language: LanguageCode;
  zone: HaramZone;
  conscious: ConsciousState;
  age: number | null;
  bodyPart: BodyPartId | null;
  gpsLocation?: GpsLocation | null;
  locationDetail?: string | null;
  symptoms: string;
  categoryTitle: string;
  summary: string;
  firstAidSteps: string[];
  warningSigns: string;
  responderReport: ResponderReportPayload;
  responderNotes: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TriageCaseInternal extends TriageCaseRecord {
  caseTokenHash: string;
}

export interface ResponderUserPublic {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export interface ResponderUserInternal extends ResponderUserPublic {
  passwordHash: string;
}

export interface AuthSessionPayload {
  sub: string;
  username: string;
  displayName: string;
  role: UserRole;
  iat: number;
  exp: number;
}
