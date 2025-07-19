import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, MapPin, Heart, Camera, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', href: '/#home', icon: Heart },
    { name: 'Destinations', href: '/#destinations', icon: MapPin },
    { name: 'Stories', href: '/#stories', icon: Camera },
    { name: 'About', href: '/#about', icon: Heart },
  ];

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-travel-turquoise rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-playfair text-xl font-semibold text-foreground">
              Wanderlust
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                whileHover={{ scale: 1.05 }}
                className="text-muted-foreground hover:text-foreground travel-transition font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.location.pathname !== '/') {
                    window.location.href = item.href;
                  } else {
                    document.querySelector(item.href.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {item.name}
              </motion.a>
            ))}
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={handleProfileClick}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-2 text-muted-foreground hover:text-foreground travel-transition"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {user.email?.split('@')[0]}
                    </span>
                  </motion.button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                     Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="border-travel-turquoise text-travel-turquoise hover:bg-travel-turquoise hover:text-white"
                >
                  <User className="w-4 h-4 mr-2" />
                   Sign In
                </Button>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  if (window.location.pathname !== '/') {
                    window.location.href = item.href;
                  } else {
                    document.querySelector(item.href.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex items-center space-x-3 py-3 text-muted-foreground hover:text-foreground travel-transition"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </motion.a>
            ))}
            
            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-border mt-4">
              {user ? (
                <div className="space-y-3">
                  <motion.button
                    onClick={() => {
                      handleProfileClick();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 py-2 text-muted-foreground hover:text-foreground travel-transition w-full"
                  >
                    <User className="w-4 h-4" />
                    <span>{user.email?.split('@')[0]}</span>
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 py-2 text-muted-foreground hover:text-foreground travel-transition w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={() => {
                    navigate('/auth');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 py-2 text-travel-turquoise hover:text-travel-turquoise/80 travel-transition w-full"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </motion.button>
              )}
            </div>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
};

export default Header;