import { motion } from 'framer-motion';
import { Heart, Camera, MapPin, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  const stats = [
    { icon: MapPin, number: "50+", label: "Countries Visited" },
    { icon: Camera, number: "2K+", label: "Photos Captured" },
    { icon: Heart, number: "100+", label: "Stories Shared" },
    { icon: Users, number: "50K+", label: "Fellow Travelers" }
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              About Our Journey
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              We are passionate travelers who believe that every destination has a story to tell. 
              Through our lens, we capture not just the beauty of places, but the soul of cultures, 
              the warmth of people, and the magic of moments that make travel transformative.
            </p>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Our mission is to inspire wanderlust in others while promoting sustainable and 
              meaningful travel experiences. Every photograph, every story, and every destination 
              guide is crafted with love and respect for the places we visit.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="text-center p-4 travel-shadow hover:travel-shadow-warm travel-transition">
                    <CardContent className="p-0">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-travel-turquoise/10 rounded-full flex items-center justify-center mb-3">
                          <stat.icon className="w-6 h-6 text-travel-turquoise" />
                        </div>
                        <span className="font-playfair text-2xl font-bold text-foreground">
                          {stat.number}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {stat.label}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual Element */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative">
              {/* Main Card */}
              <Card className="travel-shadow-warm overflow-hidden">
                <CardContent className="p-8 travel-gradient-warm">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-travel-turquoise rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-playfair text-2xl font-semibold text-foreground mb-4">
                      Travel with Purpose
                    </h3>
                    <p className="text-muted-foreground">
                      Every journey begins with curiosity and ends with a deeper understanding 
                      of our beautiful, diverse world.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-6 -right-6 w-12 h-12 bg-travel-coral rounded-full opacity-80"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-8 h-8 bg-travel-sunset rounded-full opacity-70"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              />
              <motion.div
                className="absolute top-1/2 -left-8 w-6 h-6 bg-travel-turquoise rounded-full opacity-60"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;