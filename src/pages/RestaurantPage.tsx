
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useRestaurant, useMenuItems } from "@/services/api";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Clock, Search, Plus, Heart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const RestaurantPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: restaurant, isLoading: restaurantLoading } = useRestaurant(id || "");
  const { data: menuItems, isLoading: menuLoading } = useMenuItems(id || "");
  const { addToCart } = useCart();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get unique categories from menu items
  const categories = menuItems ? 
    Array.from(new Set(menuItems.map(item => item.category))) : 
    [];
  
  // Filter menu items based on search query
  const filteredMenuItems = menuItems?.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      restaurantId: item.restaurantId,
      name: item.name,
      price: item.price,
      image: item.image
    });
    
    toast({
      title: "Added to cart",
      description: `${item.name} added to your cart`
    });
  };

  const handleToggleFavorite = (item: any) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add favorites",
        variant: "destructive",
      });
      return;
    }

    if (isFavorite(item.id)) {
      removeFavorite(item.id);
    } else {
      addFavorite({
        item_id: item.id,
        restaurant_id: item.restaurantId,
        name: item.name,
        price: item.price,
        image: item.image
      });
    }
  };

  if (restaurantLoading || menuLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
          <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant || !menuItems) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">Restaurant not found</h2>
        <p className="mt-4">The restaurant you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="mt-6">
          <a href="/">Back to Home</a>
        </Button>
      </div>
    );
  }

  // Function to render a menu item card
  const renderMenuItemCard = (item: any) => (
    <Card key={item.id} className="overflow-hidden">
      <div className="h-40 overflow-hidden relative">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover"
        />
        <button 
          onClick={() => handleToggleFavorite(item)}
          className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md"
        >
          <Heart 
            className={`h-5 w-5 ${isFavorite(item.id) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} 
          />
        </button>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold">{item.name}</h3>
          <span className="font-semibold">₹{item.price.toFixed(2)}</span>
        </div>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
        <Button 
          className="w-full bg-food-primary hover:bg-food-primary/90"
          onClick={() => handleAddToCart(item)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Restaurant Header */}
      <div className="relative h-64 rounded-xl overflow-hidden mb-6">
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
            <p className="text-lg mb-2">{restaurant.cuisine}</p>
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center bg-black/30 px-3 py-1 rounded-full">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 mr-1" />
                <span>{restaurant.rating}</span>
              </div>
              <div className="flex items-center bg-black/30 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4 mr-1" />
                <span>{restaurant.deliveryTime}</span>
              </div>
              <div className="flex items-center bg-black/30 px-3 py-1 rounded-full">
                <span>Delivery: ₹{restaurant.deliveryFee.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input 
          type="text"
          placeholder="Search menu items..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Menu Tabs */}
      {searchQuery ? (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          {filteredMenuItems?.length === 0 ? (
            <p className="text-gray-500">No items found matching "{searchQuery}"</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems?.map(renderMenuItemCard)}
            </div>
          )}
        </div>
      ) : (
        <Tabs defaultValue={categories[0] || "all"} className="mt-6">
          <TabsList className="mb-6 w-full overflow-x-auto flex flex-nowrap justify-start pb-2">
            {categories.map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="px-4 py-2 mx-1 whitespace-nowrap"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <h2 className="text-xl font-semibold mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems
                  .filter(item => item.category === category)
                  .map(renderMenuItemCard)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default RestaurantPage;
