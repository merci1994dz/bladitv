
import { Channel, Country, Category } from '@/types';

// Export memory cache state types for data store
export interface DataStoreState {
  channels: Channel[];
  countries: Country[];
  categories: Category[];
  isSyncing: boolean;
}

// Export the initial state for the data store
export const initialState: DataStoreState = {
  channels: [],
  countries: [],
  categories: [],
  isSyncing: false
};
