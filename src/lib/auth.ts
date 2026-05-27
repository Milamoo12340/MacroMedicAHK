import { StorageKeys, loadJSON, saveJSON, useStore } from "@/lib/storage";
import type { StaffAccount, StaffRole } from "@/types";

// Simple SHA-256 hashing using Web Crypto. Tokens never leave the device.
const PEPPER = "macromedic-v1-pepper";

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPassword(password: string, username: string): Promise<string> {
  return sha256(`${PEPPER}:${username.toLowerCase()}:${password}`);
}

export function listAccounts(): StaffAccount[] {
  return loadJSON<StaffAccount[]>(StorageKeys.staffAccounts, []);
}

export async function registerStaff(input: {
  username: string;
  displayName?: string;
  email?: string;
  password: string;
  role: StaffRole;
}): Promise<StaffAccount> {
  const accounts = listAccounts();
  const exists = accounts.find(
    (a) => a.username.toLowerCase() === input.username.toLowerCase(),
  );
  if (exists) throw new Error("That username is already taken");
  if (input.password.length < 4) throw new Error("Password must be at least 4 characters");

  const passwordHash = await hashPassword(input.password, input.username);
  const account: StaffAccount = {
    id: `staff-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    username: input.username.trim(),
    displayName: (input.displayName?.trim() || input.username).trim(),
    email: input.email?.trim(),
    passwordHash,
    role: input.role,
    createdAt: new Date().toISOString(),
  };
  saveJSON(StorageKeys.staffAccounts, [...accounts, account]);
  return account;
}

export async function loginStaff(
  username: string,
  password: string,
): Promise<StaffAccount> {
  const accounts = listAccounts();
  const account = accounts.find(
    (a) => a.username.toLowerCase() === username.toLowerCase(),
  );
  if (!account) throw new Error("No staff account with that username");
  const hash = await hashPassword(password, account.username);
  if (hash !== account.passwordHash) throw new Error("Wrong password");

  const updated: StaffAccount = { ...account, lastLogin: new Date().toISOString() };
  saveJSON(
    StorageKeys.staffAccounts,
    accounts.map((a) => (a.id === account.id ? updated : a)),
  );
  saveJSON(StorageKeys.currentUserId, account.id);
  return updated;
}

export function getCurrentUser(): StaffAccount | null {
  const id = loadJSON<string | null>(StorageKeys.currentUserId, null);
  if (!id) return null;
  const accounts = listAccounts();
  return accounts.find((a) => a.id === id) ?? null;
}

export function logout(): void {
  saveJSON(StorageKeys.currentUserId, null);
}

export async function updatePassword(
  accountId: string,
  newPassword: string,
): Promise<void> {
  const accounts = listAccounts();
  const account = accounts.find((a) => a.id === accountId);
  if (!account) throw new Error("Account not found");
  if (newPassword.length < 4) throw new Error("Password must be at least 4 characters");
  const passwordHash = await hashPassword(newPassword, account.username);
  saveJSON(
    StorageKeys.staffAccounts,
    accounts.map((a) => (a.id === accountId ? { ...a, passwordHash } : a)),
  );
}

export function deleteAccount(accountId: string): void {
  const accounts = listAccounts();
  saveJSON(
    StorageKeys.staffAccounts,
    accounts.filter((a) => a.id !== accountId),
  );
  const currentId = loadJSON<string | null>(StorageKeys.currentUserId, null);
  if (currentId === accountId) saveJSON(StorageKeys.currentUserId, null);
}

export function updateAccount(
  accountId: string,
  patch: Partial<Pick<StaffAccount, "displayName" | "email" | "role">>,
): void {
  const accounts = listAccounts();
  saveJSON(
    StorageKeys.staffAccounts,
    accounts.map((a) => (a.id === accountId ? { ...a, ...patch } : a)),
  );
}

// --- React hook ---------------------------------------------------------

export function useCurrentUser(): StaffAccount | null {
  const [currentId] = useStore<string | null>(StorageKeys.currentUserId, null);
  const [accounts] = useStore<StaffAccount[]>(StorageKeys.staffAccounts, []);
  if (!currentId) return null;
  return accounts.find((a) => a.id === currentId) ?? null;
}
