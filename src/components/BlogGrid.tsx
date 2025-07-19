import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  location?: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username?: string;
    full_name?: string;
  } | null;
}

const BlogGrid = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadPosts = async () => {
    try {
      // Get posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Get profiles for the users
      const userIds = [...new Set(postsData?.map(post => post.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, full_name')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combine posts with profiles
      const postsWithProfiles = postsData?.map(post => ({
        ...post,
        profiles: profilesData?.find(profile => profile.user_id === post.user_id) || {
          username: undefined,
          full_name: undefined
        }
      })) || [];

      setPosts(postsWithProfiles);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handlePostCreated = () => {
    loadPosts();
  };

  const handlePostUpdated = () => {
    loadPosts();
  };

  const handlePostDeleted = () => {
    loadPosts();
  };

  return (
    <section id="stories" className="py-20 bg-gradient-to-b from-background to-travel-sand/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-6">
            Travel Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover inspiring adventures and share your own experiences
          </p>
          
          {user && (
            <div className="flex justify-center">
              <CreatePost onPostCreated={handlePostCreated} />
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <PostCard
                  post={post}
                  onPostUpdated={handlePostUpdated}
                  onPostDeleted={handlePostDeleted}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-lg mb-4">
              No posts available yet.
            </p>
            {user && (
              <p className="text-muted-foreground">
                Be the first and create a post!
              </p>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BlogGrid;