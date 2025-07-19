import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Heart, Bookmark, MapPin, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostCard from '@/components/PostCard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  location?: string;
  created_at: string;
  user_id: string;
  profiles: {
    username?: string;
    full_name?: string;
  };
}

const Profile = () => {
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setUserProfile(profileData);

      // Load user's posts
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            username,
            full_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setMyPosts(postsData || []);

      // Load liked posts
      const { data: likedData } = await supabase
        .from('post_likes')
        .select(`
          posts!inner (
            *,
            profiles (
              username,
              full_name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setLikedPosts(likedData?.map(item => item.posts).filter(Boolean) as Post[] || []);

      // Load saved posts
      const { data: savedData } = await supabase
        .from('saved_posts')
        .select(`
          posts!inner (
            *,
            profiles (
              username,
              full_name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setSavedPosts(savedData?.map(item => item.posts).filter(Boolean) as Post[] || []);

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  const handlePostUpdated = () => {
    loadUserData();
  };

  const handlePostDeleted = () => {
    loadUserData();
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-travel-sand via-background to-travel-coral/10 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-travel-turquoise border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const joinDate = new Date(user.created_at).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-travel-sand via-background to-travel-coral/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-border/50 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-travel-turquoise rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-playfair text-3xl font-bold text-foreground mb-2">
                {userProfile?.full_name || userProfile?.username || 'Mein Profil'}
              </h1>
              <p className="text-muted-foreground mb-2">{user.email}</p>
              <div className="flex items-center justify-center md:justify-start text-sm text-muted-foreground mb-4">
                <Calendar className="w-4 h-4 mr-1" />
                Mitglied seit {joinDate}
              </div>

              {/* Stats */}
              <div className="flex justify-center md:justify-start space-x-6">
                <div className="text-center">
                  <div className="font-semibold text-foreground">{myPosts.length}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground">{likedPosts.length}</div>
                  <div className="text-sm text-muted-foreground">Gelikte Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground">{savedPosts.length}</div>
                  <div className="text-sm text-muted-foreground">Gespeicherte Posts</div>
                </div>
              </div>
            </div>

            {/* Settings Button */}
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Einstellungen
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="posts" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Meine Posts
              </TabsTrigger>
              <TabsTrigger value="liked" className="flex items-center">
                <Heart className="w-4 h-4 mr-2" />
                Gelikte Posts
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center">
                <Bookmark className="w-4 h-4 mr-2" />
                Gespeicherte Posts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts">
              {myPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onPostUpdated={handlePostUpdated}
                      onPostDeleted={handlePostDeleted}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Du hast noch keine Posts erstellt.
                  </p>
                  <Button 
                    onClick={() => navigate('/')} 
                    className="mt-4 bg-travel-turquoise hover:bg-travel-turquoise/90"
                  >
                    Ersten Post erstellen
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="liked">
              {likedPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {likedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onPostUpdated={handlePostUpdated}
                      onPostDeleted={handlePostDeleted}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Du hast noch keine Posts geliked.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved">
              {savedPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onPostUpdated={handlePostUpdated}
                      onPostDeleted={handlePostDeleted}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Du hast noch keine Posts gespeichert.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;