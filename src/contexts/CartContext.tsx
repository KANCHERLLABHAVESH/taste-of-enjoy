
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: string;
  restaurantId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // Load cart from Supabase if user is authenticated, otherwise from localStorage
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id);
          
          if (error) {
            console.error("Error fetching cart items:", error);
            return;
          }
          
          if (data && data.length > 0) {
            const formattedItems: CartItem[] = data.map(item => ({
              id: item.item_id,
              restaurantId: item.restaurant_id,
              name: item.name,
              price: Number(item.price),
              quantity: item.quantity,
              image: item.image
            }));
            setCartItems(formattedItems);
          } else {
            // If no items in Supabase, check localStorage for any existing items
            const savedCart = localStorage.getItem("cart");
            if (savedCart) {
              const parsedCart = JSON.parse(savedCart);
              setCartItems(parsedCart);
              
              // Save these items to Supabase
              if (parsedCart.length > 0) {
                for (const item of parsedCart) {
                  await addToSupabaseCart(item);
                }
              }
            }
          }
        } catch (error) {
          console.error("Error loading cart:", error);
        }
      } else {
        // Not logged in, use localStorage only
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      }
    };

    loadCart();
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Helper function to add item to Supabase cart
  const addToSupabaseCart = async (item: CartItem) => {
    if (!user) return;
    
    try {
      // Check if item already exists in cart
      const { data: existingItems, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_id', item.id);
      
      if (fetchError) {
        console.error("Error checking existing cart item:", fetchError);
        return;
      }
      
      if (existingItems && existingItems.length > 0) {
        // Update quantity if item exists
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: item.quantity })
          .eq('user_id', user.id)
          .eq('item_id', item.id);
        
        if (updateError) {
          console.error("Error updating cart item quantity:", updateError);
        }
      } else {
        // Insert new item if it doesn't exist
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            item_id: item.id,
            restaurant_id: item.restaurantId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          });
        
        if (insertError) {
          console.error("Error adding item to cart:", insertError);
        }
      }
    } catch (error) {
      console.error("Unexpected error updating cart in Supabase:", error);
    }
  };

  // Helper function to remove item from Supabase cart
  const removeFromSupabaseCart = async (itemId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId);
      
      if (error) {
        console.error("Error removing item from cart:", error);
      }
    } catch (error) {
      console.error("Unexpected error removing from cart in Supabase:", error);
    }
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // If item exists, increment quantity
        const updatedItems = prevItems.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
        
        // Update Supabase if user is logged in
        if (user) {
          const updatedItem = updatedItems.find(i => i.id === item.id);
          if (updatedItem) {
            addToSupabaseCart(updatedItem);
          }
        }
        
        toast({
          title: "Cart updated",
          description: `${item.name} quantity increased`,
        });
        return updatedItems;
      } else {
        // Add new item with quantity 1
        const newItem = { ...item, quantity: 1 };
        
        // Add to Supabase if user is logged in
        if (user) {
          addToSupabaseCart(newItem);
        }
        
        toast({
          title: "Added to cart",
          description: `${item.name} added to your cart`,
        });
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === itemId);
      if (itemToRemove) {
        // Remove from Supabase if user is logged in
        if (user) {
          removeFromSupabaseCart(itemId);
        }
        
        toast({
          title: "Removed from cart",
          description: `${itemToRemove.name} removed from your cart`,
        });
      }
      return prevItems.filter(item => item.id !== itemId);
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      
      // Update in Supabase if user is logged in
      if (user) {
        const updatedItem = updatedItems.find(i => i.id === itemId);
        if (updatedItem) {
          addToSupabaseCart(updatedItem);
        }
      }
      
      return updatedItems;
    });
  };

  const clearCart = async () => {
    // Clear from Supabase if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
        
        if (error) {
          console.error("Error clearing cart in Supabase:", error);
        }
      } catch (error) {
        console.error("Unexpected error clearing cart in Supabase:", error);
      }
    }
    
    setCartItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        getCartTotal 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
