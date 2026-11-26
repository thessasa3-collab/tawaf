export type BrowserFeature = 'geolocation' | 'microphone';

export interface PermissionDiagnostics {
  feature: BrowserFeature;
  isSecureContext: boolean;
  inIframe: boolean;
  policyAllowed: boolean | null;
  permissionState: PermissionState | 'unsupported';
}

interface PolicyAwareDocument {
  permissionsPolicy?: {
    allowsFeature?: (feature: string) => boolean;
  };
  featurePolicy?: {
    allowsFeature?: (feature: string) => boolean;
  };
}

export function isRunningInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin frame access throws SecurityError when embedded in an iframe
    return true;
  }
}

export function checkFeaturePolicyAllowed(feature: BrowserFeature): boolean | null {
  if (typeof document === 'undefined') return null;
  const doc = document as unknown as PolicyAwareDocument;
  try {
    if (typeof doc.permissionsPolicy?.allowsFeature === 'function') {
      return doc.permissionsPolicy.allowsFeature(feature);
    }
    if (typeof doc.featurePolicy?.allowsFeature === 'function') {
      return doc.featurePolicy.allowsFeature(feature);
    }
  } catch {
    return null;
  }
  return null;
}

export async function inspectPermissionDiagnostics(
  feature: BrowserFeature
): Promise<PermissionDiagnostics> {
  const isSecureContext =
    typeof window !== 'undefined' ? Boolean(window.isSecureContext) : true;
  const inIframe = isRunningInIframe();
  const policyAllowed = checkFeaturePolicyAllowed(feature);

  let permissionState: PermissionState | 'unsupported' = 'unsupported';
  if (
    typeof navigator !== 'undefined' &&
    navigator.permissions &&
    typeof navigator.permissions.query === 'function'
  ) {
    try {
      const status = await navigator.permissions.query({
        name: feature as PermissionName,
      });
      permissionState = status.state;
    } catch {
      permissionState = 'unsupported';
    }
  }

  return {
    feature,
    isSecureContext,
    inIframe,
    policyAllowed,
    permissionState,
  };
}

export function isPermissionsPolicyErrorMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('permissions policy') ||
    lower.includes('feature policy') ||
    lower.includes('disallowed by permissions') ||
    lower.includes('disabled in this document')
  );
}
