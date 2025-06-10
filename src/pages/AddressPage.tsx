
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AddressForm from "@/components/AddressForm";

const AddressPage = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Calculate order summary
  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 0 ? 49 : 0; // ₹49 delivery fee
  const tax = subtotal * 0.05; // 5% GST
  const total = subtotal + deliveryFee + tax;

  const handleAddressSelected = (street: string, city: string, state: string, zipCode: string) => {
    setIsProcessing(true);
    
    // Store delivery address in session storage to use in payment page and tracking page
    sessionStorage.setItem('deliveryAddress', JSON.stringify({
      street,
      city,
      state,
      zipCode
    }));
    
    // Navigate to payment page
    navigate('/payment');
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6 pl-0 flex items-center text-food-dark"
        onClick={() => navigate('/cart')}
        disabled={isProcessing}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cart
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-6">Delivery Details</h1>
          <AddressForm onAddressSelected={handleAddressSelected} />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddressPage;
