import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, MapPin, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
interface CreatePostProps {
  onPostCreated: () => void;
}
const CreatePost = ({
  onPostCreated
}: CreatePostProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'url'>('upload');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!user) return null;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const {
        error: uploadError
      } = await supabase.storage.from('post-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const {
        data: urlData
      } = supabase.storage.from('post-images').getPublicUrl(fileName);
      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError('Error uploading image: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setLoading(true);
    try {
      let finalImageUrl = '';
      if (uploadMethod === 'upload' && imageFile) {
        const uploadedUrl = await handleImageUpload(imageFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      } else if (uploadMethod === 'url' && imageUrl) {
        finalImageUrl = imageUrl;
      }
      const {
        error: insertError
      } = await supabase.from('posts').insert({
        user_id: user.id,
        title,
        content,
        location: location || null,
        image_url: finalImageUrl || null
      });
      if (insertError) throw insertError;

      // Reset form
      setTitle('');
      setContent('');
      setLocation('');
      setImageFile(null);
      setImageUrl('');
      setIsOpen(false);
      toast({
        title: "Post created!",
        description: "Your travel post has been published successfully."
      });
      onPostCreated();
    } catch (err: any) {
      setError(err.message || 'Error creating post');
    } finally {
      setLoading(false);
    }
  };
  if (!user) return null;
  return <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }}>
          <Button className="bg-travel-turquoise hover:bg-travel-turquoise/90 text-white shadow-lg" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Create New Post
          </Button>
        </motion.div>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair">Create New Travel Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Amazing beaches in Thailand" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Description *</Label>
            <Textarea id="content" value={content} onChange={e => setContent(e.target.value)} placeholder="Tell us about your adventure..." className="min-h-[120px]" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Phuket, Thailand" className="pl-10" />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label>Image</Label>
            
            {/* Upload Method Toggle */}
            <div className="flex space-x-2">
              <Button type="button" variant={uploadMethod === 'upload' ? 'default' : 'outline'} size="sm" onClick={() => setUploadMethod('upload')} className={uploadMethod === 'upload' ? 'bg-travel-turquoise' : ''}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <Button type="button" variant={uploadMethod === 'url' ? 'default' : 'outline'} size="sm" onClick={() => setUploadMethod('url')} className={uploadMethod === 'url' ? 'bg-travel-turquoise' : ''}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Image URL
              </Button>
            </div>

            {uploadMethod === 'upload' ? <div className="space-y-2">
                
                {imageFile && <div className="mt-2">
                    <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                  </div>}
              </div> : <div className="space-y-2">
                <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                {imageUrl && <div className="mt-2">
                    <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg" onError={() => setError('Invalid image URL')} />
                  </div>}
              </div>}
          </div>

          {error && <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading || !title.trim() || !content.trim()} className="bg-travel-turquoise hover:bg-travel-turquoise/90">
              {loading || uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : null}
              {uploading ? 'Uploading...' : loading ? 'Creating...' : 'Publish Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
};
export default CreatePost;