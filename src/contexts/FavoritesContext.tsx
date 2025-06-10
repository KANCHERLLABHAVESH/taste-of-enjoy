
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface FavoriteItem {
  id: string;
  user_id: string;
  item_id: string;
  restaurant_id: string;
  name: string;
  price: number;
  image: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  isLoading: boolean;
  addFavorite: (item: Omit<FavoriteItem, "id" | "user_id">) => Promise<void>;
  removeFavorite: (itemId: string) => Promise<void>;
  isFavorite: (itemId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch favorites when user changes
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavorites([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("favorite_items")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching favorites:", error);
          return;
        }

        setFavorites(data || []);
      } catch (error) {
        console.error("Unexpected error fetching favorites:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const addFavorite = async (item: Omit<FavoriteItem, "id" | "user_id">) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.from("favorite_items").insert({
        user_id: user.id,
        ...item,
      }).select();

      if (error) {
        console.error("Error adding favorite:", error);
        toast({
          title: "Error",
          description: "Failed to add to favorites",
          variant: "destructive",
        });
        return;
      }

      if (data && data[0]) {
        setFavorites([...favorites, data[0]]);
        toast({
          title: "Added to favorites",
          description: `${item.name} added to your favorites`,
        });
      }
    } catch (error) {
      console.error("Unexpected error adding favorite:", error);
      toast({
        title: "Error",
        description: "Failed to add to favorites",
        variant: "destructive",
      });
    }
  };

  const removeFavorite = async (itemId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("favorite_items")
        .delete()
        .eq("user_id", user.id)
        .eq("item_id", itemId);

      if (error) {
        console.error("Error removing favorite:", error);
        toast({
          title: "Error",
          description: "Failed to remove from favorites",
          variant: "destructive",
        });
        return;
      }

      const removedItem = favorites.find(fav => fav.item_id === itemId);
      setFavorites(favorites.filter(fav => fav.item_id !== itemId));
      toast({
        title: "Removed from favorites",
        description: removedItem ? `${removedItem.name} removed from your favorites` : "Item removed from your favorites",
      });
    } catch (error) {
      console.error("Unexpected error removing favorite:", error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (itemId: string) => {
    return favorites.some(fav => fav.item_id === itemId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        addFavorite,
        removeFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
