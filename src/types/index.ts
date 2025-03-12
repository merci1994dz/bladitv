
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
}
