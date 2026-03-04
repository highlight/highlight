/**
 * Returns true if the current browser is Safari (excluding Chrome/Edge)
 */
export function isSafari(): boolean {
  const ua = navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(ua);
}
