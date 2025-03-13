
import { STORAGE_KEYS, DEFAULT_ADMIN_PASSWORD } from './config';

// Function to verify admin password
export const verifyAdminPassword = (password: string): boolean => {
  const storedPassword = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || DEFAULT_ADMIN_PASSWORD;
  return password === storedPassword;
};

// Function to update admin password
export const updateAdminPassword = (newPassword: string): void => {
  if (newPassword && newPassword.length >= 6) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPassword);
  } else {
    throw new Error('Password must be at least 6 characters long');
  }
};
