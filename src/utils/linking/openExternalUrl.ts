import { Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";

export async function openExternalUrl(url: string): Promise<void> {
  const trimmed = url.trim();
  if (!trimmed) return;

  try {
    await Linking.openURL(trimmed);
    return;
  } catch {
    // Fall through to in-app browser.
  }

  try {
    await WebBrowser.openBrowserAsync(trimmed);
  } catch {
    // Ignore link open failures.
  }
}
