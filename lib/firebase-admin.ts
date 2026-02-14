import { cert, getApps, getApp, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

type ServiceAccountShape = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

function loadServiceAccount(): ServiceAccountShape | undefined {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : null;

  if (credentialsPath) {
    try {
      if (fs.existsSync(credentialsPath)) {
        const fileContent = fs.readFileSync(credentialsPath, 'utf8');
        const sanitized = fileContent.replace(/^\uFEFF/, '').trim();
        return JSON.parse(sanitized) as ServiceAccountShape;
      }
    } catch (error) {
      console.warn('Failed to read Firebase admin credentials file:', error);
    }
  }

  return undefined;
}

const serviceAccount = loadServiceAccount();

const projectId = process.env.FIREBASE_PROJECT_ID || serviceAccount?.project_id;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || serviceAccount?.client_email;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || serviceAccount?.private_key;
const privateKey = rawPrivateKey?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  throw new Error('Firebase admin credentials are not configured properly.');
}

const firebaseAdminApp = getApps().length
  ? getApp()
  : initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

const adminAuth = getAuth(firebaseAdminApp);
const adminDb = getFirestore(firebaseAdminApp);

export { firebaseAdminApp, adminAuth, adminDb };
