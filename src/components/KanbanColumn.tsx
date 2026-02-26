import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { TaskCard, type Task } from "./TaskCard";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onAddTask: (status: string) => void;
  onUpdateTask: (id: string, title: string, description: string) => void;
  onDeleteTask: (id: string) => void;
}

export function KanbanColumn({ id, title, tasks, onAddTask, onUpdateTask, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={`flex flex-col rounded-xl border border-border bg-kanban-column transition-colors duration-200 ${
        isOver ? "border-primary/50 bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              id === "todo" ? "bg-amber-400" : "bg-emerald-400"
            }`}
          />
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
            {title}
          </h2>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-secondary px-1.5 text-[10px] font-semibold text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(id)}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div ref={setNodeRef} className="flex flex-1 flex-col gap-2 p-3 pt-1 min-h-[200px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onUpdate={onUpdateTask} onDelete={onDeleteTask} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/50 py-8">
            <p className="text-xs text-muted-foreground/60">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}
