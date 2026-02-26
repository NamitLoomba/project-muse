

## Kanban Board with AI Chatbot

### Page Layout
- Dark-themed Kanban board inspired by the reference images — deep dark background, subtle card borders, rounded corners, and clean typography
- Two columns: **To-Do** and **In Progress**
- Column headers with task count badges
- "Add Task" button on each column

### Task Cards
- Title and description displayed on each card
- Drag-and-drop support to move cards between columns
- Hover effects and smooth animations for a polished feel
- Delete/edit options on each card

### AI Chatbot Panel
- Slide-out chat panel on the right side (toggleable via a floating button)
- Supports **task suggestions** (AI can suggest new tasks to add) and **general Q&A**
- Streaming responses for a responsive feel
- Powered by Lovable AI via an edge function

### Database & Persistence
- Lovable Cloud backend with Supabase for storing tasks
- Tasks table with columns: id, title, description, status (todo/in-progress), position, created_at
- Chat messages table for conversation history
- Data persists across sessions — come back anytime and pick up where you left off

### Interactions
- Drag cards between To-Do and In Progress columns
- Click to edit task title/description inline
- Add new tasks via a modal form
- Open/close AI chat panel with a floating action button

