
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log(values);
      toast({
        title: "Message sent",
        description: "We've received your message and will get back to you soon!",
      });
      form.reset();
      setIsSubmitting(false);
    }, 1500);
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-6">Send us a message</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="How can we help?" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-food-primary hover:bg-food-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Form>
        </div>
        
        <div className="bg-food-light rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-6">Get in touch</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-food-primary mt-1 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Address</h3>
                <p className="mt-1 text-gray-600">
                  123 Mint Street <br />
                  Chennai, India
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="w-5 h-5 text-food-primary mt-1 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Phone</h3>
                <p className="mt-1 text-gray-600">+91 9629266312</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-food-primary mt-1 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Email</h3>
                <p className="mt-1 text-gray-600">support@foodexpress.com</p>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="font-medium text-gray-900 mb-3">Hours</h3>
              <div className="grid grid-cols-2 gap-2 text-gray-600">
                <div>Monday - Friday:</div>
                <div>9:00 AM - 10:00 PM</div>
                <div>Saturday - Sunday:</div>
                <div>10:00 AM - 11:00 PM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
