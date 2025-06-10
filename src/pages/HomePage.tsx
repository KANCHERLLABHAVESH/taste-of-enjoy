
import { useState } from "react";
import { Link } from "react-router-dom";
import { useRestaurants } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, Clock } from "lucide-react";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: restaurants, isLoading, error } = useRestaurants();
  
  // Filter restaurants based on search query
  const filteredRestaurants = restaurants?.filter(restaurant => 
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-food-primary to-food-secondary rounded-xl p-6 md:p-10 mb-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Delicious Food Delivered To Your Door</h1>
          <p className="text-lg md:text-xl mb-6">Order from your favorite restaurants and enjoy a quick delivery.</p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              type="text"
              placeholder="Search for food or cuisines..." 
              className="pl-10 bg-white text-gray-800 border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Categories Section - Moved to top */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Explore By Cuisine</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {["American", "Italian", "Japanese", "Mexican", "Indian", "Chinese"].map((cuisine) => (
            <Button 
              key={cuisine}
              variant="outline"
              className="h-16 text-lg font-medium border-2 hover:border-food-primary hover:text-food-primary"
              onClick={() => setSearchQuery(cuisine)}
            >
              {cuisine}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Restaurants Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Popular Restaurants</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-lg text-red-500">Failed to load restaurants. Please try again later.</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        ) : filteredRestaurants?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg">No restaurants found matching "{searchQuery}"</p>
            <Button className="mt-4" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants?.map((restaurant) => (
              <Link to={`/restaurant/${restaurant.id}`} key={restaurant.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={restaurant.image} 
                      alt={restaurant.name} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">{restaurant.name}</h3>
                    <p className="text-gray-500 mb-3">{restaurant.cuisine}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 fill-current mr-1" />
                        <span>{restaurant.rating}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <span>₹{restaurant.deliveryFee.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* About Section */}
      <div className="bg-food-light rounded-xl p-6 md:p-10 mb-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-food-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-food-primary">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Choose Restaurant</h3>
              <p className="text-gray-500">Browse through various restaurants and their menus</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-food-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-food-primary">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Select Food</h3>
              <p className="text-gray-500">Add your favorite items to your cart</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-food-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-food-primary">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Get Delivery</h3>
              <p className="text-gray-500">Enjoy quick and reliable food delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
