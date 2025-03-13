
import { useState } from 'react';
import { Channel, Country, Category } from '@/types';
import { API_BASE_URL, STORAGE_KEYS } from './config';
import * as channelService from './channelService';
import * as categoryService from './categoryService';
import * as countryService from './countryService';

// Sync state
let syncInProgress = false;

// Sync all data from the API
export const syncAllData = async (): Promise<boolean> => {
  // Prevent multiple simultaneous syncs
  if (syncInProgress) {
    console.log('Sync already in progress');
    return false;
  }
  
  syncInProgress = true;
  console.log('Starting data sync...');
  
  try {
    // Fetch all data types
    const channelsPromise = fetch(`${API_BASE_URL}/channels`);
    const categoriesPromise = fetch(`${API_BASE_URL}/categories`);
    const countriesPromise = fetch(`${API_BASE_URL}/countries`);
    
    const [channelsResponse, categoriesResponse, countriesResponse] = 
      await Promise.all([channelsPromise, categoriesPromise, countriesPromise]);
    
    if (!channelsResponse.ok || !categoriesResponse.ok || !countriesResponse.ok) {
      throw new Error('Failed to fetch data from API');
    }
    
    // Parse responses
    const channels: Channel[] = await channelsResponse.json();
    const categories: Category[] = await categoriesResponse.json();
    const countries: Country[] = await countriesResponse.json();
    
    // Store data locally
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
    
    // Update last sync time
    const syncTime = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, syncTime);
    
    console.log('Data sync completed successfully');
    syncInProgress = false;
    return true;
  } catch (error) {
    console.error('Error during data sync:', error);
    syncInProgress = false;
    return false;
  }
};

// Get the last sync time
export const getLastSyncTime = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
};

// Check if sync is needed (no data or older than 24 hours)
export const isSyncNeeded = (): boolean => {
  const lastSync = getLastSyncTime();
  
  if (!lastSync) {
    return true;
  }
  
  // Check if channels exist
  const hasChannels = !!localStorage.getItem(STORAGE_KEYS.CHANNELS);
  const hasCategories = !!localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  const hasCountries = !!localStorage.getItem(STORAGE_KEYS.COUNTRIES);
  
  if (!hasChannels || !hasCategories || !hasCountries) {
    return true;
  }
  
  // Check if last sync was more than 24 hours ago
  const lastSyncTime = new Date(lastSync).getTime();
  const currentTime = new Date().getTime();
  const hoursSinceSync = (currentTime - lastSyncTime) / (1000 * 60 * 60);
  
  return hoursSinceSync > 24;
};

// Check if sync is currently in progress
export const isSyncInProgress = (): boolean => {
  return syncInProgress;
};
