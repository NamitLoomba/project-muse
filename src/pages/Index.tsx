import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { MessageCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { KanbanColumn } from "@/components/KanbanColumn";
import { TaskCard, type Task } from "@/components/TaskCard";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { ChatPanel } from "@/components/ChatPanel";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogStatus, setAddDialogStatus] = useState("todo");
  const [chatOpen, setChatOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("position", { ascending: true });
    if (error) {
      toast({ title: "Error loading tasks", description: error.message, variant: "destructive" });
    } else {
      setTasks(data || []);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress");

  const handleAddTask = async (title: string, description: string, status: string) => {
    const columnTasks = tasks.filter((t) => t.status === status);
    const position = columnTasks.length;
    const { error } = await supabase
      .from("tasks")
      .insert({ title, description, status, position });
    if (error) {
      toast({ title: "Error adding task", description: error.message, variant: "destructive" });
    } else {
      loadTasks();
    }
  };

  const handleUpdateTask = async (id: string, title: string, description: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ title, description })
      .eq("id", id);
    if (error) {
      toast({ title: "Error updating task", description: error.message, variant: "destructive" });
    } else {
      loadTasks();
    }
  };

  const handleDeleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting task", description: error.message, variant: "destructive" });
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskData = tasks.find((t) => t.id === activeId);
    if (!activeTaskData) return;

    // Determine target column
    let targetStatus: string;
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask) {
      targetStatus = overTask.status;
    } else if (overId === "todo" || overId === "in-progress") {
      targetStatus = overId;
    } else {
      return;
    }

    if (activeTaskData.status !== targetStatus) {
      setTasks((prev) =>
        prev.map((t) => (t.id === activeId ? { ...t, status: targetStatus } : t))
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active } = event;
    const activeId = active.id as string;
    const task = tasks.find((t) => t.id === activeId);
    if (!task) return;

    // Update status in DB
    const { error } = await supabase
      .from("tasks")
      .update({ status: task.status })
      .eq("id", activeId);
    if (error) {
      toast({ title: "Error moving task", description: error.message, variant: "destructive" });
      loadTasks();
    }
  };

  const openAddDialog = (status: string) => {
    setAddDialogStatus(status);
    setAddDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight">TaskFlow</h1>
              <p className="text-[11px] text-muted-foreground">AI-powered Kanban board</p>
            </div>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 px-6 py-6">
        <div className="mx-auto max-w-6xl">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <KanbanColumn
                id="todo"
                title="To-Do"
                tasks={todoTasks}
                onAddTask={openAddDialog}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
              <KanbanColumn
                id="in-progress"
                title="In Progress"
                tasks={inProgressTasks}
                onAddTask={openAddDialog}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            </div>

            <DragOverlay>
              {activeTask ? (
                <div className="drag-overlay rounded-lg border border-primary/40 bg-card p-4">
                  <h4 className="text-sm font-semibold text-foreground">{activeTask.title}</h4>
                  {activeTask.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{activeTask.description}</p>
                  )}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </main>

      {/* Chat FAB */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl animate-pulse-glow"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Panel */}
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddTask}
        defaultStatus={addDialogStatus}
      />
    </div>
  );
};

export default Index;
