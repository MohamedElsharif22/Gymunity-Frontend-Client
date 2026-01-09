import { Injectable, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Google Sign-In response from Google library
 * Follows Google Identity Services library structure
 */
export interface GoogleSignInResponse {
  credential: string; // JWT ID token
  clientId?: string;
  select_by?: string;
}

/**
 * Wrapper service for Google Identity Services (gis)
 * Follows Angular best practices with signals for state management
 *
 * Usage:
 * 1. Initialize service by calling initialize() once in AppComponent
 * 2. Call signIn() when user clicks Google Sign-In button
 * 3. Service will emit the ID token via googleSignInResponse signal
 *
 * Reference: https://developers.google.com/identity/gsi/web
 */
@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private readonly googleClientId = environment.googleClientId;

  // Signal to track Google Sign-In response
  googleSignInResponse = signal<GoogleSignInResponse | null>(null);

  // Signal to track if Google library is loaded
  isGoogleLibraryLoaded = signal<boolean>(false);

  /**
   * Initialize Google Sign-In
   * Call this once during app initialization
   */
  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Load Google Identity Services library
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isGoogleLibraryLoaded.set(true);
        resolve();
      };

      script.onerror = () => {
        console.error('Failed to load Google Identity Services library');
        reject(new Error('Failed to load Google Sign-In library'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Initialize Google Sign-In button
   * Call this after component initializes
   *
   * @param containerId - The HTML element ID where the button should be rendered
   * @param onSuccess - Callback when sign-in is successful
   * @param onError - Callback when sign-in fails
   */
  initializeButton(
    containerId: string,
    onSuccess: (response: GoogleSignInResponse) => void,
    onError?: (error: any) => void
  ): void {
    if (!this.isGoogleLibraryLoaded()) {
      console.error('Google library not loaded. Call initialize() first.');
      return;
    }

    // Access Google's global object
    const google = (window as any).google;

    if (!google) {
      console.error('Google object not found');
      return;
    }

    google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: (response: GoogleSignInResponse) => {
        this.googleSignInResponse.set(response);
        onSuccess(response);
      },
      error_callback: onError || (() => {})
    });

    // Render the sign-in button
    google.accounts.id.renderButton(
      document.getElementById(containerId),
      {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        logo_alignment: 'left',
        width: '100%'
      }
    );
  }

  /**
   * Get the ID token from the current sign-in response
   */
  getIdToken(): string | null {
    const response = this.googleSignInResponse();
    return response?.credential || null;
  }

  /**
   * Clear the current sign-in response
   */
  clearSignInResponse(): void {
    this.googleSignInResponse.set(null);
  }

  /**
   * Sign out from Google
   */
  signOut(): void {
    const google = (window as any).google;
    if (google) {
      google.accounts.id.disableAutoSelect();
    }
    this.clearSignInResponse();
  }

  /**
   * Decode the ID token (client-side decoding - for reference only)
   * Note: Do NOT use client-side decoding for sensitive operations.
   * Always verify the token on the server side.
   *
   * @param idToken - The JWT ID token
   * @returns Decoded payload
   */
  decodeIdToken(idToken: string): any {
    try {
      const parts = idToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const decoded = JSON.parse(atob(parts[1]));
      return decoded;
    } catch (error) {
      console.error('Failed to decode ID token:', error);
      return null;
    }
  }
}
