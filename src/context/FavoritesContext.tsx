import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteCity {
  id: string; // e.g. "lat,lon"
  name: string;
  lat: number;
  lon: number;
}

interface FavoritesContextData {
  favorites: FavoriteCity[];
  addFavorite: (city: FavoriteCity) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextData | undefined>(undefined);

const FAVORITES_KEY = '@weatherapp_favorites';

export const FavoritesProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      if (data) {
        setFavorites(JSON.parse(data));
      }
    } catch (e) {
      console.error('Failed to load favorites', e);
    }
  };

  const addFavorite = async (city: FavoriteCity) => {
    try {
      const newFavs = [...favorites, city];
      setFavorites(newFavs);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavs));
    } catch (e) {
      console.error('Failed to save favorite', e);
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      const newFavs = favorites.filter(f => f.id !== id);
      setFavorites(newFavs);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavs));
    } catch (e) {
      console.error('Failed to remove favorite', e);
    }
  };

  const isFavorite = (id: string) => {
    return favorites.some(f => f.id === id);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
