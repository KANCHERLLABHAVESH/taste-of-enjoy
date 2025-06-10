
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import { useRestaurants } from "@/services/api";
import { Dices, Sparkles } from "lucide-react";

// Random cuisine selection options
const MOODS = [
  { value: "happy", label: "Happy" },
  { value: "comfort", label: "Comfort Food" },
  { value: "healthy", label: "Healthy" },
  { value: "adventurous", label: "Adventurous" },
  { value: "spicy", label: "Spicy" },
];

// Cuisine mapping to moods
const MOOD_TO_CUISINE: Record<string, string[]> = {
  happy: ["Italian", "American"],
  comfort: ["American", "Italian", "Indian"],
  healthy: ["Japanese", "Indian"],
  adventurous: ["Japanese", "Indian", "Mexican"],
  spicy: ["Mexican", "Indian"],
};

const RandomMealButton = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState([250]); // Default budget of 250 INR
  const [mood, setMood] = useState("happy");
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: restaurants } = useRestaurants();

  const handleGetSuggestion = () => {
    setIsGenerating(true);
    
    // Simulate loading time
    setTimeout(() => {
      if (!restaurants || restaurants.length === 0) {
        toast({
          title: "No restaurants available",
          description: "Please try again later.",
          variant: "destructive",
        });
        setIsGenerating(false);
        setOpen(false);
        return;
      }

      // Filter restaurants by cuisines that match the mood
      const cuisineChoices = MOOD_TO_CUISINE[mood] || Object.values(MOOD_TO_CUISINE).flat();
      const filteredRestaurants = restaurants.filter(restaurant => 
        cuisineChoices.includes(restaurant.cuisine)
      );

      if (filteredRestaurants.length === 0) {
        toast({
          title: "No matching restaurants",
          description: "Try a different mood or budget.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      // Select a random restaurant
      const randomRestaurant = filteredRestaurants[Math.floor(Math.random() * filteredRestaurants.length)];
      
      // Navigate to the restaurant page
      setOpen(false);
      setIsGenerating(false);
      
      toast({
        title: "We found something for you!",
        description: `Check out ${randomRestaurant.name} - ${randomRestaurant.cuisine} cuisine`,
      });
      
      setTimeout(() => {
        navigate(`/restaurant/${randomRestaurant.id}`);
      }, 1000);
    }, 1500);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-lg bg-food-primary hover:bg-food-secondary text-white"
        size="lg"
      >
        <Dices className="mr-2 h-5 w-5" />
        <span>Surprise Me! 🎲</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
              Random Meal Generator
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Your Budget (₹)</Label>
              <div className="flex justify-between mb-2">
                <span>₹100</span>
                <span>₹{budget[0]}</span>
                <span>₹500</span>
              </div>
              <Slider
                value={budget}
                min={100}
                max={500}
                step={50}
                onValueChange={setBudget}
              />
            </div>

            <div className="space-y-2">
              <Label>Select any one</Label>
              <RadioGroup value={mood} onValueChange={setMood} className="grid grid-cols-2 gap-2">
                {MOODS.map((moodOption) => (
                  <div key={moodOption.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={moodOption.value} id={moodOption.value} />
                    <Label htmlFor={moodOption.value}>{moodOption.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button 
              onClick={handleGetSuggestion} 
              disabled={isGenerating}
              className="bg-food-primary hover:bg-food-secondary"
            >
              {isGenerating ? "Finding perfect meal..." : "Surprise Me!"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RandomMealButton;
