
import { Country } from '@/types';
import { countries, channels } from './dataStore';
import { STORAGE_KEYS } from './config';

export const getCountries = async (): Promise<Country[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [...countries];
};

export const addCountry = async (country: Omit<Country, 'id'>): Promise<Country> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const newCountry: Country = {
    ...country,
    id: Date.now().toString()
  };
  
  countries.push(newCountry);
  localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
  
  return newCountry;
};

export const updateCountry = async (country: Country): Promise<Country> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = countries.findIndex(c => c.id === country.id);
  if (index === -1) throw new Error('Country not found');
  
  countries[index] = { ...country };
  localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
  
  return country;
};

export const deleteCountry = async (countryId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Check if country is used by any channel
  const countryInUse = channels.some(channel => channel.country === countryId);
  if (countryInUse) {
    throw new Error('Cannot delete country that is used by channels');
  }
  
  const index = countries.findIndex(c => c.id === countryId);
  if (index === -1) throw new Error('Country not found');
  
  countries.splice(index, 1);
  localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
};
