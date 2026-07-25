import {
  GoogleAuthProvider,
  getAuth,
  getIdToken,
  signInWithCredential,
  signOut,
} from "@react-native-firebase/auth";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import apiClient from "src/utils/api/client";
import { endpoints } from "src/utils/endpoints";
import { ENV } from "src/utils/constants/env";
import {
  getGuestDeviceId,
  markGuestConverted,
} from "src/features/guest/store/guestStore";
import type { AuthResponse, GoogleAuthResult } from "../types/auth.types";

let isConfigured = false;

function mapGoogleSignInError(error: unknown): Error {
  if (isErrorWithCode(error)) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return new Error("Google sign-in was cancelled.");
    }
    if (error.code === statusCodes.IN_PROGRESS) {
      return new Error("Google sign-in is already in progress.");
    }
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return new Error("Google Play Services is not available on this device.");
    }
  }

  if (error instanceof Error) {
    const message = error.message;
    if (message.includes("DEVELOPER_ERROR")) {
      return new Error(
        "Google Sign-In is not configured for this build. Add your app SHA fingerprints in Firebase and reinstall the app."
      );
    }
    if (
      message.includes("accessToken cannot be empty") ||
      message.includes("IllegalArgumentException")
    ) {
      return new Error(
        "Google sign-in failed to return valid credentials. Please try again."
      );
    }
    if (message.includes("auth/operation-not-allowed")) {
      return new Error(
        "Google sign-in is not enabled in Firebase Authentication. Enable the Google provider in Firebase Console."
      );
    }
    if (message.includes("auth/invalid-credential")) {
      return new Error(
        "Google sign-in credentials expired or are invalid. Please try again."
      );
    }
  }

  return error instanceof Error
    ? error
    : new Error("Unable to continue with Google. Please try again.");
}

function ensureGoogleConfigured() {
  if (isConfigured) return;

  GoogleSignin.configure({
    webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
  isConfigured = true;
}

/** Clear cached Google/Firebase sessions so the account picker opens every time. */
async function resetGoogleSignInSession(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // No cached Google session — safe to continue.
  }

  try {
    const firebaseAuth = getAuth();
    if (firebaseAuth.currentUser) {
      await signOut(firebaseAuth);
    }
  } catch {
    // Firebase session cleanup is best-effort before a fresh sign-in.
  }
}

/**
 * Native Google Sign-In → Firebase Auth → backend JWT session.
 */
export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  ensureGoogleConfigured();

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    await resetGoogleSignInSession();
    const signInResponse = await GoogleSignin.signIn();

    if (signInResponse.type === "cancelled") {
      throw new Error("Google sign-in was cancelled.");
    }

    const { idToken, accessToken } = await GoogleSignin.getTokens();

    if (!idToken) {
      throw new Error("Google sign-in did not return an ID token.");
    }

    const firebaseAuth = getAuth();
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const userCredential = await signInWithCredential(firebaseAuth, credential);
    const firebaseIdToken = await getIdToken(userCredential.user, true);

    const authResponse = await apiClient.post<AuthResponse>(endpoints.auth.google, {
      idToken: firebaseIdToken,
      deviceId: getGuestDeviceId(),
    });

    markGuestConverted();
    return {
      session: authResponse.data.data,
      isNewUser: authResponse.status === 201,
    };
  } catch (error) {
    throw mapGoogleSignInError(error);
  }
}
