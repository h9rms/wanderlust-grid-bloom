import { useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import BlogGrid from '@/components/BlogGrid';
import TravelMap from '@/components/TravelMap';
import About from '@/components/About';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';

const Index = () => {
  useEffect(() => {
    // Add smooth scrolling behavior
    document.documentElement.classList.add('smooth-scroll');
    
    return () => {
      document.documentElement.classList.remove('smooth-scroll');
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <BlogGrid />
      <TravelMap />
      <About />
      <Footer />
      <ChatBot />
    </div>
  );
};

export default Index;
