
import { useFavorites } from "@/contexts/FavoritesContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Star, Trash2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const FavoritesPage = () => {
  const { favorites, isLoading, removeFavorite } = useFavorites();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Favourites</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden border">
              <Skeleton className="h-40 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4 mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-6">My Favourites</h1>
        <div className="p-8 rounded-lg border border-dashed">
          <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-6">You don't have any favorite items yet</p>
          <Button asChild>
            <Link to="/">Explore Restaurants</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">My Favourites</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="h-40 overflow-hidden">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">{item.name}</h3>
                <span className="font-semibold">₹{item.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-4">
                <Button 
                  asChild 
                  className="bg-food-primary hover:bg-food-primary/90 flex-1 mr-2"
                >
                  <Link to={`/restaurant/${item.restaurant_id}`}>
                    View Restaurant
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => removeFavorite(item.item_id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
