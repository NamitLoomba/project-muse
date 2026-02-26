import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string, description: string, status: string) => void;
  defaultStatus: string;
}

export function AddTaskDialog({ open, onClose, onAdd, defaultStatus }: AddTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), description.trim(), defaultStatus);
      setTitle("");
      setDescription("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Add Task to {defaultStatus === "todo" ? "To-Do" : "In Progress"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs text-muted-foreground">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="bg-secondary border-border"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc" className="text-xs text-muted-foreground">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add some details..."
              className="bg-secondary border-border min-h-[80px] resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!title.trim()}>Add Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
