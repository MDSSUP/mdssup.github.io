/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Dev only: treat a missing or refused camera as non-fatal.
   * See pages/scan/camera.ts.
   */
  readonly VITE_ALLOW_MISSING_CAMERA?: string;

  /**
   * Overrides for the settings in config.ts, read as the app is built.
   */
  readonly VITE_PASSCODE_HASH?: string;
  readonly VITE_SCAN_TIMEOUT_MS?: string;
  readonly VITE_STUDENT_ID_PATTERN?: string;
  readonly VITE_ADMIN_NAME?: string;
  readonly VITE_MEMBER_LIST_URL?: string;
  readonly VITE_MEMBER_LIST_MAX_AGE_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Facts about the build, filled in by the "define" setting in vite.config.ts.
declare const __APP_VERSION__: string;
declare const __BUILD_COMMIT__: string;
declare const __BUILD_TIME__: string;
declare const __VITE_VERSION__: string;
declare const __ZXING_VERSION__: string;
