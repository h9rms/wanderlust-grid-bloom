import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Heart, Bookmark, MapPin, Calendar, Settings, Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostCard from '@/components/PostCard';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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

const Profile = () => {
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: ''
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
        .maybeSingle();
      setUserProfile(profileData);
      
      // Update form data when profile loads
      if (profileData) {
        setFormData({
          full_name: profileData.full_name || '',
          username: profileData.username || '',
          bio: profileData.bio || ''
        });
        setAvatarPreview(profileData.avatar_url || '');
      }

      // Load user's posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Get profiles for user's posts
      const userIds = [...new Set(postsData?.map(post => post.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, full_name')
        .in('user_id', userIds);

      const myPostsWithProfiles = postsData?.map(post => ({
        ...post,
        profiles: profilesData?.find(profile => profile.user_id === post.user_id) || {
          username: undefined,
          full_name: undefined
        }
      })) || [];
      setMyPosts(myPostsWithProfiles);

      // Load liked posts
      const { data: likedData } = await supabase
        .from('post_likes')
        .select('posts(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const likedPostsData = likedData?.map(item => item.posts).filter(Boolean) || [];
      const likedUserIds = [...new Set(likedPostsData.map(post => post.user_id))];
      const { data: likedProfilesData } = await supabase
        .from('profiles')
        .select('user_id, username, full_name')
        .in('user_id', likedUserIds);

      const likedPostsWithProfiles = likedPostsData.map(post => ({
        ...post,
        profiles: likedProfilesData?.find(profile => profile.user_id === post.user_id) || {
          username: undefined,
          full_name: undefined
        }
      }));
      setLikedPosts(likedPostsWithProfiles);

      // Load saved posts
      const { data: savedData } = await supabase
        .from('saved_posts')
        .select('posts(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const savedPostsData = savedData?.map(item => item.posts).filter(Boolean) || [];
      const savedUserIds = [...new Set(savedPostsData.map(post => post.user_id))];
      const { data: savedProfilesData } = await supabase
        .from('profiles')
        .select('user_id, username, full_name')
        .in('user_id', savedUserIds);

      const savedPostsWithProfiles = savedPostsData.map(post => ({
        ...post,
        profiles: savedProfilesData?.find(profile => profile.user_id === post.user_id) || {
          username: undefined,
          full_name: undefined
        }
      }));
      setSavedPosts(savedPostsWithProfiles);

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleAvatarUpload = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setEditLoading(true);
    try {
      let avatarUrl = userProfile?.avatar_url || '';
      
      // Upload new avatar if selected
      if (avatarFile) {
        const uploadedUrl = await handleAvatarUpload();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      // Update or insert profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          avatar_url: avatarUrl
        });

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully."
      });

      setIsSettingsOpen(false);
      setAvatarFile(null);
      loadUserData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive"
      });
    } finally {
      setEditLoading(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-travel-sand via-background to-travel-coral/10 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-travel-turquoise border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-travel-sand via-background to-travel-coral/10 pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-border/50 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative w-24 h-24 bg-travel-turquoise rounded-full flex items-center justify-center overflow-hidden">
              {userProfile?.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-playfair text-3xl font-bold text-foreground mb-2">
                {userProfile?.full_name || userProfile?.username || user.email?.split('@')[0] || 'My Profile'}
              </h1>
              <p className="text-muted-foreground mb-2">{user.email}</p>
              {userProfile?.bio && (
                <p className="text-muted-foreground mb-2 italic">{userProfile.bio}</p>
              )}
              <div className="flex items-center justify-center md:justify-start text-sm text-muted-foreground mb-4">
                <Calendar className="w-4 h-4 mr-1" />
                Member since {joinDate}
              </div>

              {/* Stats */}
              <div className="flex justify-center md:justify-start space-x-6">
                <div className="text-center">
                  <div className="font-semibold text-foreground">{myPosts.length}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground">{likedPosts.length}</div>
                  <div className="text-sm text-muted-foreground">Liked Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground">{savedPosts.length}</div>
                  <div className="text-sm text-muted-foreground">Saved Posts</div>
                </div>
              </div>
            </div>

            {/* Settings Button */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-travel-turquoise rounded-full flex items-center justify-center overflow-hidden">
                        {avatarPreview ? (
                          <img 
                            src={avatarPreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      placeholder="Your full name"
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      placeholder="Your username"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsSettingsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={editLoading}
                      className="bg-travel-turquoise hover:bg-travel-turquoise/90"
                    >
                      {editLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      ) : null}
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
                My Posts
              </TabsTrigger>
              <TabsTrigger value="liked" className="flex items-center">
                <Heart className="w-4 h-4 mr-2" />
                Liked Posts
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center">
                <Bookmark className="w-4 h-4 mr-2" />
                Saved Posts
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
                    You haven't created any posts yet.
                  </p>
                  <Button 
                    onClick={() => navigate('/')} 
                    className="mt-4 bg-travel-turquoise hover:bg-travel-turquoise/90"
                  >
                    Create first post
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
                    You haven't liked any posts yet.
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
                    You haven't saved any posts yet.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      </div>
    </>
  );
};

export default Profile;