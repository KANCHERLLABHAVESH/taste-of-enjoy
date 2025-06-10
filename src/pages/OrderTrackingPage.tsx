
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, Package, Check } from "lucide-react";

interface TrackingStep {
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
  time: string;
  icon: React.ReactNode;
}

interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

const OrderTrackingPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [progress, setProgress] = useState(25);
  const [currentStep, setCurrentStep] = useState(1);
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);

  // Retrieve delivery address from sessionStorage
  useEffect(() => {
    const storedAddress = sessionStorage.getItem('deliveryAddress');
    if (storedAddress) {
      try {
        const parsedAddress = JSON.parse(storedAddress);
        console.log("Retrieved address:", parsedAddress);
        setDeliveryAddress(parsedAddress);
      } catch (error) {
        console.error("Error parsing delivery address:", error);
      }
    } else {
      console.log("No delivery address found in session storage");
    }
  }, []);

  // Simulate order tracking progress
  useEffect(() => {
    const calculateDeliveryTime = () => {
      const now = new Date();
      const deliveryTime = new Date(now.getTime() + 35 * 60000); // 35 minutes from now
      return deliveryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    setEstimatedDelivery(calculateDeliveryTime());

    // Simulate order progress updates
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        const newProgress = prevProgress + 5;
        
        // Update current step based on progress
        if (newProgress >= 75) setCurrentStep(4);
        else if (newProgress >= 50) setCurrentStep(3);
        else if (newProgress >= 25) setCurrentStep(2);
        
        return newProgress;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const trackingSteps: TrackingStep[] = [
    {
      title: "Order Confirmed",
      description: "Your order has been received",
      status: "completed",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: <Check className="w-5 h-5" />
    },
    {
      title: "Preparing",
      description: "Restaurant is preparing your food",
      status: currentStep >= 2 ? "completed" : currentStep === 1 ? "in-progress" : "pending",
      time: currentStep >= 2 ? new Date(Date.now() + 10 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--",
      icon: <Clock className="w-5 h-5" />
    },
    {
      title: "On the Way",
      description: "Your order is on the way",
      status: currentStep >= 3 ? "completed" : currentStep === 2 ? "in-progress" : "pending",
      time: currentStep >= 3 ? new Date(Date.now() + 20 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--",
      icon: <MapPin className="w-5 h-5" />
    },
    {
      title: "Delivered",
      description: "Enjoy your meal!",
      status: currentStep >= 4 ? "completed" : currentStep === 3 ? "in-progress" : "pending",
      time: currentStep >= 4 ? estimatedDelivery : "--:--",
      icon: <Package className="w-5 h-5" />
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
        <p className="text-gray-500 mb-6">Order #{orderId}</p>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Delivery Status</CardTitle>
            <CardDescription>
              Estimated delivery time: <span className="font-medium">{estimatedDelivery}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2 mb-8" />
            
            <div className="space-y-6">
              {trackingSteps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full mr-4 ${
                    step.status === "completed" ? "bg-green-100 text-green-600" :
                    step.status === "in-progress" ? "bg-blue-100 text-blue-600" :
                    "bg-gray-100 text-gray-400"
                  }`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium">{step.title}</h3>
                      <span className="text-sm text-gray-500">{step.time}</span>
                    </div>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Delivery Address</h3>
                {deliveryAddress ? (
                  <>
                    <p>{deliveryAddress.street}</p>
                    <p>{deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zipCode}</p>
                  </>
                ) : (
                  <p>Address information not available</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Delivery Instructions</h3>
                <p>Leave at door. Please knock.</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Delivery Contact</h3>
                <p>Contact info from payment details</p>
                {sessionStorage.getItem('contactPhone') && (
                  <p>{sessionStorage.getItem('contactPhone')}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
