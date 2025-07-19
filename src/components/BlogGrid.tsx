import { motion } from 'framer-motion';
import { Calendar, MapPin, User, ArrowRight, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import blogTemple from '@/assets/blog-temple.jpg';
import blogMarket from '@/assets/blog-market.jpg';
import blogMountain from '@/assets/blog-mountain.jpg';

const BlogGrid = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Hidden Temples of Southeast Asia",
      excerpt: "Discover ancient temples tucked away in lush jungles, where spirituality meets architectural wonder.",
      image: blogTemple,
      author: "Maya Chen",
      date: "March 15, 2024",
      location: "Cambodia",
      category: "Culture",
      readTime: "5 min read",
      likes: 234
    },
    {
      id: 2,
      title: "Vibrant Markets of Morocco",
      excerpt: "Lose yourself in the colorful chaos of Moroccan souks, where every corner tells a story.",
      image: blogMarket,
      author: "Omar Hassan",
      date: "March 10, 2024",
      location: "Marrakech",
      category: "Culture",
      readTime: "7 min read",
      likes: 189
    },
    {
      id: 3,
      title: "Serene Mountain Lakes",
      excerpt: "Find peace in pristine alpine lakes that mirror the sky and surrounding peaks perfectly.",
      image: blogMountain,
      author: "Alex Rivera",
      date: "March 5, 2024",
      location: "Switzerland",
      category: "Nature",
      readTime: "4 min read",
      likes: 312
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section id="stories" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Latest Travel Stories
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Immerse yourself in captivating tales from around the globe, where every journey unfolds a new adventure
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {blogPosts.map((post) => (
            <motion.div
              key={post.id}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Card className="overflow-hidden travel-shadow hover:travel-shadow-warm travel-transition border-border/50 bg-card">
                <div className="relative overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-64 object-cover group-hover:scale-105 travel-transition"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-travel-turquoise text-white text-sm rounded-full font-medium">
                      {post.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-full p-2"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center text-sm text-muted-foreground mb-3 space-x-4">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {post.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {post.date}
                    </div>
                  </div>
                  
                  <h3 className="font-playfair text-xl font-semibold text-foreground mb-3 group-hover:text-travel-turquoise travel-transition">
                    {post.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-travel-sand rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-travel-turquoise" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{post.author}</p>
                        <p className="text-xs text-muted-foreground">{post.readTime}</p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-travel-turquoise hover:text-travel-ocean p-0 group"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 travel-transition" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Button 
            size="lg" 
            variant="outline"
            className="border-travel-turquoise text-travel-turquoise hover:bg-travel-turquoise hover:text-white px-8 py-3 rounded-full travel-transition"
          >
            View All Stories
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogGrid;