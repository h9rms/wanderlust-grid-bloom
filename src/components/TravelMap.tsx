import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Camera, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TravelMap = () => {
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  const destinations = [
    {
      id: 1,
      name: "Angkor Wat, Cambodia",
      coordinates: [103.8670, 13.4125],
      description: "Ancient temple complex",
      stories: 12,
      photos: 340
    },
    {
      id: 2,
      name: "Marrakech, Morocco",
      coordinates: [-7.9811, 31.6295],
      description: "Vibrant markets and culture",
      stories: 8,
      photos: 256
    },
    {
      id: 3,
      name: "Jungfraujoch, Switzerland",
      coordinates: [7.9744, 46.5474],
      description: "Alpine paradise",
      stories: 15,
      photos: 412
    },
    {
      id: 4,
      name: "Santorini, Greece",
      coordinates: [25.4615, 36.3932],
      description: "Island getaway",
      stories: 20,
      photos: 567
    }
  ];

  const initializeMap = async () => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      // Dynamic import of mapbox-gl
      const mapboxgl = await import('mapbox-gl');
      await import('mapbox-gl/dist/mapbox-gl.css');

      mapboxgl.default.accessToken = mapboxToken;
      
      map.current = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        projection: 'globe' as any,
        zoom: 1.5,
        center: [30, 15],
        pitch: 45,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.default.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add atmosphere
      map.current.on('style.load', () => {
        map.current?.setFog({
          color: 'rgb(255, 255, 255)',
          'high-color': 'rgb(200, 200, 225)',
          'horizon-blend': 0.2,
        });
      });

      // Add destination markers
      destinations.forEach((destination) => {
        const el = document.createElement('div');
        el.className = 'travel-marker';
        el.style.cssText = `
          width: 30px;
          height: 30px;
          background: #4ECDC4;
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        `;

        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.2)';
          el.style.background = '#FF6B6B';
        });

        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.background = '#4ECDC4';
        });

        new mapboxgl.default.Marker(el)
          .setLngLat(destination.coordinates as [number, number])
          .addTo(map.current);
      });

    } catch (error) {
      console.error('Error loading Mapbox:', error);
    }
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
      initializeMap();
    }
  };

  return (
    <section id="destinations" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Explore Our Destinations
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover the places that have captured our hearts and cameras around the world
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden travel-shadow">
              <CardContent className="p-0">
                {showTokenInput ? (
                  <div className="h-96 flex items-center justify-center bg-secondary/50">
                    <div className="text-center p-6 max-w-md">
                      <MapPin className="w-12 h-12 text-travel-turquoise mx-auto mb-4" />
                      <h3 className="font-playfair text-xl font-semibold mb-4">Interactive Travel Map</h3>
                      <p className="text-muted-foreground mb-6">
                        Enter your Mapbox public token to explore our destination pins on an interactive globe.
                      </p>
                      <div className="space-y-4">
                        <Input
                          type="text"
                          placeholder="Enter Mapbox public token"
                          value={mapboxToken}
                          onChange={(e) => setMapboxToken(e.target.value)}
                          className="w-full"
                        />
                        <Button 
                          onClick={handleTokenSubmit}
                          className="w-full bg-travel-turquoise hover:bg-travel-ocean"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Load Map
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-4">
                        Get your free token at{' '}
                        <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-travel-turquoise hover:underline">
                          mapbox.com
                        </a>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div ref={mapContainer} className="h-96 w-full" />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Destinations List */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {destinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:travel-shadow-warm travel-transition cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-3 h-3 bg-travel-turquoise rounded-full mt-2 group-hover:bg-travel-coral travel-transition"></div>
                      <div className="flex-1">
                        <h4 className="font-playfair font-semibold text-foreground group-hover:text-travel-turquoise travel-transition">
                          {destination.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {destination.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {destination.stories} stories
                          </div>
                          <div className="flex items-center">
                            <Camera className="w-3 h-3 mr-1" />
                            {destination.photos} photos
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TravelMap;