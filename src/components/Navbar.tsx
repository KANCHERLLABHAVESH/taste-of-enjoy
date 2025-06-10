
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, User, ShoppingCart, Menu, X, Star, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    closeMenu();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <span className="text-food-primary text-2xl font-bold">Taste of Enjoy</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-food-dark hover:text-food-primary transition-colors">
              Home
            </Link>
            <Link to="/contact" className="text-food-dark hover:text-food-primary transition-colors">
              Contact
            </Link>
            
            {user ? (
              <>
                <Link to="/favorites" className="text-food-dark hover:text-food-primary transition-colors flex items-center">
                  <Heart className="h-5 w-5 mr-1" />
                  Favorites
                </Link>
                <Link to="/cart" className="relative">
                  <ShoppingCart className="h-6 w-6 text-food-dark hover:text-food-primary transition-colors" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-food-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
                <div className="relative group">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>{user.email?.split('@')[0]}</span>
                  </Button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-food-light hover:text-food-primary"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Button asChild variant="ghost">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link 
              to="/" 
              className="block py-2 text-food-dark hover:text-food-primary"
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link 
              to="/contact" 
              className="block py-2 text-food-dark hover:text-food-primary"
              onClick={closeMenu}
            >
              Contact
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/favorites" 
                  className="flex items-center py-2 text-food-dark hover:text-food-primary"
                  onClick={closeMenu}
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Favourites
                </Link>
                <Link 
                  to="/cart" 
                  className="flex items-center py-2 text-food-dark hover:text-food-primary"
                  onClick={closeMenu}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Cart {cartItems.length > 0 && `(${cartItems.length})`}
                </Link>
                <hr className="my-2 border-gray-200" />
                <div className="py-2 text-gray-600">
                  Signed in as <span className="font-medium">{user.email?.split('@')[0]}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-food-primary hover:underline"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Button 
                  asChild 
                  variant="ghost" 
                  className="w-full justify-center"
                  onClick={closeMenu}
                >
                  <Link to="/login">Log in</Link>
                </Button>
                <Button 
                  asChild 
                  className="w-full justify-center"
                  onClick={closeMenu}
                >
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
