
export interface Channel {
  id: string;
  name: string;
  logo: string;
  streamUrl: string;
  category: string;
  country: string;
  isFavorite: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Country {
  id: string;
  name: string;
  flag: string;
  image: string;
}

// New types for admin functionality
export interface AdminChannel extends Channel {
  isEditing?: boolean;
}

export interface AdminCountry extends Country {
  isEditing?: boolean;
}

// New types for remote admin configuration
export interface RemoteAdminConfig {
  enabled: boolean;
  adminUrl: string;
  lastSyncTime?: string;
}

