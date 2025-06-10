
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { fetchRestaurantById } from "@/services/api";

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurantName, setRestaurantName] = useState<string>("");
  
  // Calculate subtotal, delivery fee, and total
  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 0 ? 49 : 0; // ₹49 delivery fee
  const tax = subtotal * 0.05; // 5% GST
  const total = subtotal + deliveryFee + tax;
  
  // Get restaurant info for the first item (assuming all items are from the same restaurant)
  const firstItem = cartItems[0];
  
  // Fetch restaurant name only if we have items in cart
  if (cartItems.length > 0 && !restaurantName && firstItem?.restaurantId) {
    fetchRestaurantById(firstItem.restaurantId).then(restaurant => {
      if (restaurant) {
        setRestaurantName(restaurant.name);
      }
    });
  }

  const handleDecreaseQuantity = (itemId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
    } else {
      removeFromCart(itemId);
    }
  };

  const handleIncreaseQuantity = (itemId: string, currentQuantity: number) => {
    updateQuantity(itemId, currentQuantity + 1);
  };

  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (cartItems.length > 0) {
      navigate("/address");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6 pl-0 flex items-center text-food-dark"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
          
          {cartItems.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                  <p className="text-gray-500 mb-6">Add some delicious items to your cart</p>
                  <Button onClick={() => navigate("/")}>Browse Restaurants</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {restaurantName && (
                <p className="text-lg mb-4">
                  Order from <span className="font-medium">{restaurantName}</span>
                </p>
              )}
              
              <Card>
                <CardContent className="pt-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center py-4 first:pt-0 last:pb-0">
                      <div className="h-20 w-20 rounded overflow-hidden mr-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-gray-500">₹{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                        >
                          {item.quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                        </Button>
                        <span className="mx-4 min-w-[1.5rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right ml-4 min-w-[70px]">
                        <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">GST (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-food-primary hover:bg-food-primary/90"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                {user ? "Proceed to Checkout" : "Login to Checkout"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
