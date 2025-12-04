import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface PostModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (post: { title: string; content: string; type: string }) => void;
  isLoading?: boolean;
}

export function PostModal({ open, onClose, onSubmit, isLoading = false }: PostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("tip");

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return; // simple validation
    onSubmit({ title, content, type });
    setTitle("");
    setContent("");
    setType("tip");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Title */}
          <Input
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="input-post-title"
          />

          {/* Post Type */}
          <Select value={type} onValueChange={setType}>
            <SelectTrigger data-testid="select-post-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tip">💡 Wellness Tip</SelectItem>
              <SelectItem value="win">🏆 Success Story</SelectItem>
              <SelectItem value="question">❓ Question</SelectItem>
            </SelectContent>
          </Select>

          {/* Content */}
          <Textarea
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-32"
            data-testid="textarea-post-content"
          />

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !title.trim() || !content.trim()}
              data-testid="button-submit-post"
            >
              {isLoading ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}