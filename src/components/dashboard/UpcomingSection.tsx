
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Video, Calendar as CalendarIcon } from 'lucide-react';
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
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: '1',
      title: 'Complete Calculus Assignment',
      description: 'Finish problems 1-15 from chapter 8',
      priority: 'high',
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      completed: false,
      createdAt: new Date()
    },
    {
      id: '2',
      title: 'Review Biology Notes',
      description: 'Go through cell division chapter',
      priority: 'medium',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      completed: false,
      createdAt: new Date()
    },
    {
      id: '3',
      title: 'Prepare for Physics Lab',
      description: 'Read lab manual and gather materials',
      priority: 'low',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      completed: true,
      createdAt: new Date()
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTodo, setNewTodo] = useState<NewTodoForm>({
    title: '',
    description: '',
    priority: 'medium',
    deadline: ''
  });

  const handleAddTodo = () => {
    if (!newTodo.title.trim()) return;

    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo.title,
      description: newTodo.description || undefined,
      priority: newTodo.priority,
      deadline: newTodo.deadline ? new Date(newTodo.deadline) : undefined,
      completed: false,
      createdAt: new Date()
    };

    setTodos(prev => [todo, ...prev]);
    setNewTodo({ title: '', description: '', priority: 'medium', deadline: '' });
    setIsAddDialogOpen(false);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
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
          {upcomingTodos.length === 0 ? (
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
