import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    const addressData = sessionStorage.getItem('deliveryAddress');
    
    if (!addressData) {
      navigate('/address');
      return;
    }
    
    try {
      const parsedAddress = JSON.parse(addressData);
      console.log("Retrieved delivery address:", parsedAddress);
      setDeliveryAddress(parsedAddress);
    } catch (error) {
      console.error("Error parsing delivery address:", error);
      navigate('/address');
    }
  }, [navigate]);

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = 49; // ₹49 delivery fee
  const tax = subtotal * 0.05; // 5% GST
  const total = subtotal + deliveryFee + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to complete your payment",
      });
      navigate("/login");
      return;
    }
    
    if (!deliveryAddress) {
      toast({
        variant: "destructive",
        title: "Delivery address missing",
        description: "Please provide your delivery address",
      });
      navigate("/address");
      return;
    }
    
    if (!contactPhone) {
      toast({
        variant: "destructive",
        title: "Contact number required",
        description: "Please provide your contact number",
      });
      return;
    }
    
    setLoading(true);

    try {
      const orderId = "ORD" + Math.floor(Math.random() * 1000000);
      
      console.log("Saving payment details:", {
        user_id: user.id,
        order_id: orderId,
        payment_method: paymentMethod,
        amount: total,
        delivery_address: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        zip_code: deliveryAddress.zipCode
      });
      
      const { error } = await supabase
        .from('payment_details')
        .insert({
          user_id: user.id,
          order_id: orderId,
          payment_method: paymentMethod,
          amount: total,
          delivery_address: deliveryAddress.street,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          zip_code: deliveryAddress.zipCode,
          status: 'completed'
        });
      
      if (error) {
        console.error("Error saving payment details:", error);
        toast({
          variant: "destructive",
          title: "Payment failed",
          description: "There was an error processing your payment. Please try again.",
        });
        setLoading(false);
        return;
      }
      
      sessionStorage.setItem('contactPhone', contactPhone);
      
      await clearCart();
      
      toast({
        title: "Payment successful!",
        description: `Order #${orderId} has been placed.`,
      });
      
      navigate(`/tracking/${orderId}`);
    } catch (error) {
      console.error("Unexpected error processing payment:", error);
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!deliveryAddress) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6 pl-0 flex items-center text-food-dark"
        onClick={() => navigate('/address')}
        disabled={loading}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Address
      </Button>
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Choose your payment method and enter details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="payment-method">Payment Method</Label>
                      <RadioGroup 
                        id="payment-method" 
                        value={paymentMethod} 
                        onValueChange={setPaymentMethod}
                        className="flex flex-col space-y-2 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="font-normal">Credit/Debit Card</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="upi" id="upi" />
                          <Label htmlFor="upi" className="font-normal">UPI</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="netbanking" id="netbanking" />
                          <Label htmlFor="netbanking" className="font-normal">Net Banking</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cod" id="cod" />
                          <Label htmlFor="cod" className="font-normal">Cash on Delivery</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {paymentMethod === "card" && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="card-number">Card Number</Label>
                          <Input id="card-number" placeholder="1234 5678 9012 3456" className="mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input id="expiry" placeholder="MM/YY" className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input id="cvv" placeholder="123" className="mt-1" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="card-name">Name on Card</Label>
                          <Input id="card-name" placeholder="John Doe" className="mt-1" />
                        </div>
                      </div>
                    )}

                    {paymentMethod === "upi" && (
                      <div>
                        <Label htmlFor="upi-id">UPI ID</Label>
                        <Input id="upi-id" placeholder="yourname@upi" className="mt-1" />
                      </div>
                    )}

                    {paymentMethod === "netbanking" && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bank">Select Bank</Label>
                          <select id="bank" className="w-full border border-gray-300 rounded-md p-2 mt-1">
                            <option value="">Select your bank</option>
                            <option value="sbi">State Bank of India</option>
                            <option value="hdfc">HDFC Bank</option>
                            <option value="icici">ICICI Bank</option>
                            <option value="axis">Axis Bank</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="phone">Contact Number</Label>
                      <Input 
                        id="phone" 
                        placeholder="Enter your phone number" 
                        className="mt-1"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div className="bg-gray-100 p-4 rounded-md">
                      <h3 className="font-medium mb-2">Delivery Address</h3>
                      <p>{deliveryAddress.street}</p>
                      <p>{deliveryAddress.city}, {deliveryAddress.zipCode}</p>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
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
              <CardFooter>
                <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Processing..." : "Complete Payment"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
