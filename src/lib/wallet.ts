import { isConnected, requestAccess, getAddress } from "@stellar/freighter-api";

/**
 * Checks if the Freighter Wallet browser extension is installed.
 */
export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const result = await isConnected();
    return !!result?.isConnected;
  } catch {
    return false;
  }
}

/**
 * Connects the Freighter Wallet and retrieves the user's active public key.
 * Throws an error if Freighter is not installed, or if the connection request fails.
 */
export async function connectWallet(): Promise<string> {
  const installed = await isFreighterInstalled();
  if (!installed) {
    throw new Error("Freighter Wallet is not installed. Please install the extension from freighter.app.");
  }

  try {
    const result = await requestAccess();
    if (result.error) {
      throw new Error(result.error);
    }
    if (!result.address) {
      throw new Error("No active public key returned. Please make sure your Freighter Wallet is unlocked and shared.");
    }
    return result.address;
  } catch (error: any) {
    // Freighter throws if the user rejects the connection or locks their wallet
    throw new Error(
      error?.message || "Freighter Wallet connection was rejected or failed. Please check the extension."
    );
  }
}

/**
 * Retrieves the currently active public key from the Freighter Wallet.
 */
export async function getActivePublicKey(): Promise<string | null> {
  const installed = await isFreighterInstalled();
  if (!installed) return null;

  try {
    const result = await getAddress();
    if (result.error || !result.address) {
      return null;
    }
    return result.address;
  } catch {
    return null;
  }
}
