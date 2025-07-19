import { motion } from 'framer-motion';
import { Heart, MapPin, Mail, Instagram, Twitter, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Facebook, href: "#", label: "Facebook" }
  ];

  const quickLinks = [
    { name: "Destinations", href: "#destinations" },
    { name: "Travel Stories", href: "#stories" },
    { name: "About Us", href: "#about" },
    { name: "Contact", href: "#contact" }
  ];

  return (
    <footer className="bg-secondary/20 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-travel-turquoise rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="font-playfair text-xl font-semibold text-foreground">
                Wanderlust
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Inspiring wanderlust through authentic travel stories, stunning photography, 
              and meaningful cultural connections from around the globe.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-travel-turquoise/10 rounded-full flex items-center justify-center text-travel-turquoise hover:bg-travel-turquoise hover:text-white travel-transition"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="font-playfair text-lg font-semibold text-foreground mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-travel-turquoise travel-transition"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="font-playfair text-lg font-semibold text-foreground mb-4">
              Stay Connected
            </h3>
            <p className="text-muted-foreground mb-4">
              Subscribe to our newsletter for the latest travel stories and destination guides.
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-travel-turquoise travel-transition"
              />
              <Button 
                size="sm"
                className="bg-travel-turquoise hover:bg-travel-ocean text-white px-4"
              >
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground text-sm mb-4 sm:mb-0">
            © 2024 Wanderlust Travel Blog. Made with{' '}
            <Heart className="w-4 h-4 inline text-travel-coral" />{' '}
            for fellow travelers.
          </p>
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-travel-turquoise travel-transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-travel-turquoise travel-transition">
              Terms of Service
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;