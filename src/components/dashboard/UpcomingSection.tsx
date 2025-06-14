
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Video, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import TodoItem from './TodoItem';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
  completed: boolean;
  createdAt: Date;
}

interface NewTodoForm {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
}

const UpcomingSection = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTodo, setNewTodo] = useState<NewTodoForm>({
    title: '',
    description: '',
    priority: 'medium',
    deadline: ''
  });

  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch todos from Supabase
  const fetchTodos = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching todos:', error);
        toast({
          title: "Error",
          description: "Failed to load your tasks",
          variant: "destructive"
        });
        return;
      }

      const mappedTodos: Todo[] = data.map(todo => ({
        id: todo.id,
        title: todo.title,
        description: todo.description || undefined,
        priority: todo.priority as 'low' | 'medium' | 'high',
        deadline: todo.deadline ? new Date(todo.deadline) : undefined,
        completed: todo.completed,
        createdAt: new Date(todo.created_at)
      }));

      setTodos(mappedTodos);
    } catch (error) {
      console.error('Error in fetchTodos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [user]);

  const handleAddTodo = async () => {
    if (!newTodo.title.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          user_id: user.id,
          title: newTodo.title,
          description: newTodo.description || null,
          priority: newTodo.priority,
          deadline: newTodo.deadline ? new Date(newTodo.deadline).toISOString() : null,
          completed: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding todo:', error);
        toast({
          title: "Error",
          description: "Failed to add task",
          variant: "destructive"
        });
        return;
      }

      const newTodoItem: Todo = {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        priority: data.priority as 'low' | 'medium' | 'high',
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        completed: data.completed,
        createdAt: new Date(data.created_at)
      };

      setTodos(prev => [newTodoItem, ...prev]);
      setNewTodo({ title: '', description: '', priority: 'medium', deadline: '' });
      setIsAddDialogOpen(false);

      toast({
        title: "Success",
        description: "Task added successfully"
      });
    } catch (error) {
      console.error('Error in handleAddTodo:', error);
    }
  };

  const handleToggleTodo = async (id: string) => {
    if (!user) return;

    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error toggling todo:', error);
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive"
        });
        return;
      }

      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    } catch (error) {
      console.error('Error in handleToggleTodo:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting todo:', error);
        toast({
          title: "Error",
          description: "Failed to delete task",
          variant: "destructive"
        });
        return;
      }

      setTodos(prev => prev.filter(todo => todo.id !== id));
      
      toast({
        title: "Success",
        description: "Task deleted successfully"
      });
    } catch (error) {
      console.error('Error in handleDeleteTodo:', error);
    }
  };

  const upcomingTodos = todos
    .filter(todo => !todo.completed)
    .sort((a, b) => {
      // Sort by deadline first (closest first), then by priority
      if (a.deadline && b.deadline) {
        return a.deadline.getTime() - b.deadline.getTime();
      }
      if (a.deadline && !b.deadline) return -1;
      if (!a.deadline && b.deadline) return 1;
      
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

  const completedTodos = todos.filter(todo => todo.completed);

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please sign in to view your tasks and calendar.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start" size="sm">
            <Video className="w-4 h-4 mr-2" />
            Start Video Call
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Schedule Study Session
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTodo.description}
                    onChange={(e) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task description (optional)"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTodo.priority} onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setNewTodo(prev => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={newTodo.deadline}
                    onChange={(e) => setNewTodo(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddTodo} className="flex-1">
                    Add Task
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading tasks...</p>
          ) : upcomingTodos.length === 0 ? (
            <p className="text-muted-foreground text-sm">No upcoming tasks</p>
          ) : (
            upcomingTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Completed Tasks */}
      {completedTodos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedTodos.slice(0, 3).map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
              />
            ))}
            {completedTodos.length > 3 && (
              <p className="text-sm text-muted-foreground">
                +{completedTodos.length - 3} more completed tasks
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UpcomingSection;
