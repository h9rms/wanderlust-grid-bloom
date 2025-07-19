import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Bookmark, Share2, Edit, Trash2, MapPin, Calendar, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PostCardProps {
  post: {
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
  };
  onPostUpdated: () => void;
  onPostDeleted: () => void;
}

const PostCard = ({ post, onPostUpdated, onPostDeleted }: PostCardProps) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [editLocation, setEditLocation] = useState(post.location || '');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const isOwner = user?.id === post.user_id;

  // Load likes and check if user liked/saved this post
  useEffect(() => {
    const loadInteractions = async () => {
      // Get likes count
      const { count } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
      setLikesCount(count || 0);

      if (user) {
        // Check if user liked this post
        const { data: likeData } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .single();
        setLiked(!!likeData);

        // Check if user saved this post
        const { data: saveData } = await supabase
          .from('saved_posts')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .single();
        setSaved(!!saveData);
      }
    };

    loadInteractions();
  }, [post.id, user]);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Du musst angemeldet sein, um Posts zu liken.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (liked) {
        // Remove like
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        setLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Add like
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
    if (!user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Du musst angemeldet sein, um Posts zu speichern.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (saved) {
        // Remove save
        await supabase
          .from('saved_posts')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        setSaved(false);
        toast({
          title: "Post entfernt",
          description: "Post wurde aus deinen gespeicherten Posts entfernt.",
        });
      } else {
        // Add save
        await supabase
          .from('saved_posts')
          .insert({ post_id: post.id, user_id: user.id });
        setSaved(true);
        toast({
          title: "Post gespeichert",
          description: "Post wurde zu deinen gespeicherten Posts hinzugefügt.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Schau dir diesen Post an: ${post.title}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: text,
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${text} - ${url}`);
      toast({
        title: "Link kopiert",
        description: "Der Link wurde in die Zwischenablage kopiert.",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: editTitle,
          content: editContent,
          location: editLocation || null,
        })
        .eq('id', post.id);

      if (error) throw error;

      setIsEditOpen(false);
      onPostUpdated();
      toast({
        title: "Post aktualisiert",
        description: "Dein Post wurde erfolgreich aktualisiert.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Möchtest du diesen Post wirklich löschen?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      onPostDeleted();
      toast({
        title: "Post gelöscht",
        description: "Dein Post wurde erfolgreich gelöscht.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl travel-transition"
      >
        {post.image_url && (
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 travel-transition"
            />
          </div>
        )}

        <div className="p-6">
          {/* Header with author and menu */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-travel-turquoise rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {(post.profiles?.full_name || post.profiles?.username || 'User')[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {post.profiles?.full_name || post.profiles?.username || 'Anonymer Nutzer'}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(post.created_at)}
                </div>
              </div>
            </div>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Content */}
          <h3 className="font-playfair text-xl font-semibold text-foreground mb-3">
            {post.title}
          </h3>
          
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {post.content}
          </p>

          {post.location && (
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <MapPin className="w-4 h-4 mr-1" />
              {post.location}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`${liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Heart className={`w-4 h-4 mr-1 ${liked ? 'fill-current' : ''}`} />
                {likesCount}
              </Button>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className={`${saved ? 'text-travel-turquoise' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-muted-foreground hover:text-foreground"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.article>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post bearbeiten</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editTitle">Titel</Label>
              <Input
                id="editTitle"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editContent">Beschreibung</Label>
              <Textarea
                id="editContent"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editLocation">Ort</Label>
              <Input
                id="editLocation"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="z.B. Phuket, Thailand"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditOpen(false)}
              >
                Abbrechen
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-travel-turquoise hover:bg-travel-turquoise/90"
              >
                {loading ? 'Wird gespeichert...' : 'Speichern'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostCard;