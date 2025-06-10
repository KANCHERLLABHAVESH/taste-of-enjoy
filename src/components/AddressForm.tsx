
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
}

const AddressForm = ({ onAddressSelected }: { onAddressSelected: (address: string, city: string, state: string, zipCode: string) => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserAddresses();
    }
  }, [user]);

  const fetchUserAddresses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) {
        console.error("Error fetching addresses:", error);
        return;
      }

      if (data && data.length > 0) {
        setAddresses(data);
        // Select the default address if available
        const defaultAddress = data.find(addr => addr.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      }
    } catch (error) {
      console.error("Unexpected error fetching addresses:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to continue",
      });
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      if (selectedAddressId === "new") {
        // Validate inputs
        if (!street || !city || !state || !zipCode) {
          toast({
            variant: "destructive",
            title: "Missing information",
            description: "Please fill in all address fields",
          });
          setLoading(false);
          return;
        }

        // Save new address to Supabase
        const { data, error } = await supabase
          .from('addresses')
          .insert({
            user_id: user.id,
            street,
            city,
            state,
            zip_code: zipCode,
            is_default: addresses.length === 0 // Set as default if this is the first address
          })
          .select();

        if (error) {
          console.error("Error saving address:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save address. Please try again.",
          });
          setLoading(false);
          return;
        }

        // Pass the address to the parent component (now including state)
        onAddressSelected(street, city, state, zipCode);
        
        toast({
          title: "Address saved",
          description: "Your address has been saved for future orders",
        });
      } else {
        // Use existing address
        const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
        if (selectedAddress) {
          onAddressSelected(
            selectedAddress.street,
            selectedAddress.city,
            selectedAddress.state,
            selectedAddress.zip_code
          );
        }
      }
    } catch (error) {
      console.error("Unexpected error saving address:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelection = (id: string) => {
    setSelectedAddressId(id);
    
    if (id !== "new") {
      const selectedAddress = addresses.find(addr => addr.id === id);
      if (selectedAddress) {
        setStreet(selectedAddress.street);
        setCity(selectedAddress.city);
        setState(selectedAddress.state);
        setZipCode(selectedAddress.zip_code);
      }
    } else {
      // Clear form for new address
      setStreet("");
      setCity("");
      setState("");
      setZipCode("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Address</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {addresses.length > 0 && (
            <div className="space-y-3">
              <Label>Select Address</Label>
              <RadioGroup value={selectedAddressId} onValueChange={handleAddressSelection} className="space-y-3">
                {addresses.map(address => (
                  <div key={address.id} className="flex items-center space-x-2 border p-3 rounded-md">
                    <RadioGroupItem value={address.id} id={`address-${address.id}`} />
                    <Label htmlFor={`address-${address.id}`} className="flex-1 cursor-pointer">
                      <div>
                        <p>{address.street}</p>
                        <p className="text-sm text-gray-500">
                          {address.city}, {address.state} {address.zip_code}
                        </p>
                      </div>
                    </Label>
                  </div>
                ))}
                <div className="flex items-center space-x-2 border p-3 rounded-md">
                  <RadioGroupItem value="new" id="address-new" />
                  <Label htmlFor="address-new" className="cursor-pointer">Use a new address</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {(selectedAddressId === "new" || addresses.length === 0) && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input 
                  id="street" 
                  value={street} 
                  onChange={(e) => setStreet(e.target.value)} 
                  placeholder="123 Main St" 
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  placeholder="Mumbai" 
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input 
                  id="state" 
                  value={state} 
                  onChange={(e) => setState(e.target.value)} 
                  placeholder="Maharashtra" 
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="zipCode">PIN Code</Label>
                <Input 
                  id="zipCode" 
                  value={zipCode} 
                  onChange={(e) => setZipCode(e.target.value)} 
                  placeholder="400001" 
                  className="mt-1" 
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-food-primary hover:bg-food-primary/90"
            disabled={loading}
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddressForm;
