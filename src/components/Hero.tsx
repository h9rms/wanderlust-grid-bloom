import { motion } from 'framer-motion';
import { ArrowDown, MapPin, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-beach.jpg';

const Hero = () => {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Beautiful tropical destination"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1 
            className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover the World's
            <span className="block text-travel-coral">Hidden Gems</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl mb-8 opacity-90 font-light max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Join us on extraordinary journeys to breathtaking destinations where wanderlust meets unforgettable experiences
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button 
              size="lg" 
              className="bg-travel-turquoise hover:bg-travel-ocean text-white px-8 py-3 rounded-full travel-transition travel-shadow group"
              onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <MapPin className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              Explore Destinations
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-travel-ocean hover:bg-white hover:text-travel-ocean px-8 py-3 rounded-full travel-transition group"
              onClick={() => document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Camera className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              View Stories
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center text-white"
        >
          <span className="text-sm mb-2 opacity-80">Scroll to explore</span>
          <ArrowDown className="w-5 h-5" />
        </motion.div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-1/4 left-10 w-3 h-3 bg-travel-coral rounded-full opacity-70"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="absolute top-1/3 right-16 w-2 h-2 bg-travel-turquoise rounded-full opacity-60"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      />
      <motion.div
        className="absolute bottom-1/3 right-20 w-4 h-4 bg-travel-sunset rounded-full opacity-50"
        animate={{ y: [0, -25, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 2 }}
      />
    </section>
  );
};

export default Hero;