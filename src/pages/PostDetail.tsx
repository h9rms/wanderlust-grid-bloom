import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Bookmark, Share2, Edit, Trash2, MapPin, Calendar, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
    avatar_url?: string;
  } | null;
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'url'>('upload');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles (
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        setPost(data);
        setEditTitle(data.title);
        setEditContent(data.content);
        setEditLocation(data.location || '');
        setEditImageUrl(data.image_url || '');

        // Load interactions
        const { count } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', id);
        setLikesCount(count || 0);

        if (user) {
          const { data: likeData } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', id)
            .eq('user_id', user.id)
            .maybeSingle();
          setLiked(!!likeData);

          const { data: saveData } = await supabase
            .from('saved_posts')
            .select('id')
            .eq('post_id', id)
            .eq('user_id', user.id)
            .maybeSingle();
          setSaved(!!saveData);
        }
      } catch (error: any) {
        toast({
          title: "Fehler",
          description: "Post konnte nicht geladen werden.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, user, navigate, toast]);

  const handleLike = async () => {
    if (!user || !post) {
      toast({
        title: "Login required",
        description: "You must be logged in to like posts.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (liked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        setLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: post.id, user_id: user.id });
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user || !post) {
      toast({
        title: "Login required",
        description: "You must be logged in to save posts.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (saved) {
        await supabase
          .from('saved_posts')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        setSaved(false);
        toast({
          title: "Post removed",
          description: "Post has been removed from your saved posts.",
        });
      } else {
        await supabase
          .from('saved_posts')
          .insert({ post_id: post.id, user_id: user.id });
        setSaved(true);
        toast({
          title: "Post saved",
          description: "Post has been added to your saved posts.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Schau dir diesen Post an: ${post?.title}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: text,
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(`${text} - ${url}`);
      toast({
        title: "Link copied",
        description: "The link has been copied to clipboard.",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    
    setEditLoading(true);

    try {
      let finalImageUrl = editImageUrl;

      // Upload new image if file is selected
      if (editImageFile) {
        const fileExt = editImageFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, editImageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('posts')
        .update({
          title: editTitle,
          content: editContent,
          location: editLocation || null,
          image_url: finalImageUrl || null,
        })
        .eq('id', post.id);

      if (error) throw error;

      setPost({
        ...post,
        title: editTitle,
        content: editContent,
        location: editLocation || null,
        image_url: finalImageUrl || null,
      });
      
      setIsEditOpen(false);
      setEditImageFile(null);
      setEditImagePreview(null);
      toast({
        title: "Post updated",
        description: "Your post has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post || !confirm('Do you really want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => handleImageFileChange(e as any);
    input.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-travel-sand via-white to-travel-cream">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-travel-turquoise"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-travel-sand via-white to-travel-cream">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Post nicht gefunden</h1>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zur Startseite
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === post.user_id;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-travel-sand via-white to-travel-cream">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button 
            onClick={() => navigate('/')} 
            variant="ghost" 
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl overflow-hidden shadow-lg max-w-4xl mx-auto"
          >
            {/* Image */}
            {post.image_url && (
              <div className="relative h-96 overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              {/* Header with author and menu */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-travel-turquoise rounded-full flex items-center justify-center overflow-hidden">
                    {post.profiles?.avatar_url ? (
                      <img 
                        src={post.profiles.avatar_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-medium">
                        {(post.profiles?.full_name || post.profiles?.username || 'User')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-lg">
                      {post.profiles?.full_name || post.profiles?.username || 'Anonymous User'}
                    </p>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(post.created_at)}
                    </div>
                  </div>
                </div>

                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Title */}
              <h1 className="font-playfair text-3xl font-bold text-foreground mb-4">
                {post.title}
              </h1>

              {/* Location */}
              {post.location && (
                <div className="flex items-center text-muted-foreground mb-6">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span className="text-lg">{post.location}</span>
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleLike}
                    className={`${liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${liked ? 'fill-current' : ''}`} />
                    {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleSave}
                    className={`${saved ? 'text-travel-turquoise' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleShare}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.article>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editTitle">Title</Label>
              <Input
                id="editTitle"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editContent">Description</Label>
              <Textarea
                id="editContent"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editLocation">Location</Label>
              <Input
                id="editLocation"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="e.g. Phuket, Thailand"
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label>Image</Label>
              
              {/* Method Toggle */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm" 
                  onClick={() => {
                    setUploadMethod('upload');
                    triggerFileSelect();
                  }}
                  className={uploadMethod === 'upload' ? 'bg-travel-turquoise' : ''}
                >
                  Upload Image
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadMethod('url')}
                  className={uploadMethod === 'url' ? 'bg-travel-turquoise' : ''}
                >
                  Image URL
                </Button>
              </div>

              {/* URL Input */}
              {uploadMethod === 'url' && (
                <Input
                  placeholder="Enter image URL"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                />
              )}

              {/* Image Preview */}
              {(editImagePreview || (uploadMethod === 'url' && editImageUrl) || post?.image_url) && (
                <div className="relative">
                  <img
                    src={editImagePreview || (uploadMethod === 'url' ? editImageUrl : post?.image_url)}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setEditImageFile(null);
                      setEditImagePreview(null);
                      setEditImageUrl('');
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={editLoading}
                className="bg-travel-turquoise hover:bg-travel-turquoise/90"
              >
                {editLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostDetail;