import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { LightTower } from '@/types';
import { apiRequest, queryClient } from '@/lib/queryClient';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// Define task status types
type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

// Define a maintenance task interface
interface MaintenanceTask {
  id: number;
  towerId: number;
  title: string;
  description: string;
  assignedTo: string | null;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  dueDate: Date | null;
  completedAt: Date | null;
}

const TaskAllocation = () => {
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigneeName, setAssigneeName] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
  // Fetch towers that need maintenance
  const { data: towers, isLoading: isLoadingTowers } = useQuery({
    queryKey: ['/api/towers'],
    queryFn: async () => {
      const response = await fetch('/api/towers');
      if (!response.ok) {
        throw new Error('Failed to fetch towers');
      }
      const allTowers = await response.json();
      // Return only towers with warning or critical status
      return allTowers.filter((tower: LightTower) => 
        tower.status === 'warning' || tower.status === 'critical'
      );
    }
  });
  
  // In a real implementation, we would fetch tasks from the server
  // For now, we'll generate dummy tasks based on the towers
  const tasks: MaintenanceTask[] = towers ? towers.map((tower: LightTower, index: number) => ({
    id: index + 1,
    towerId: tower.id,
    title: `Maintenance for ${tower.towerId}`,
    description: tower.status === 'critical' 
      ? `Critical repair needed at ${tower.location}` 
      : `Inspection required at ${tower.location}`,
    assignedTo: null,
    status: 'pending',
    priority: tower.status === 'critical' ? 'critical' : 'medium',
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    completedAt: null
  })) : [];
  
  // Filter tasks based on user selection
  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) {
      return false;
    }
    if (filterPriority !== 'all' && task.priority !== filterPriority) {
      return false;
    }
    return true;
  });
  
  // Task assignment mutation
  const assignTaskMutation = useMutation({
    mutationFn: async (data: { taskId: number, assignedTo: string }) => {
      // In a real app, this would call the server API
      // Here we'll just simulate it with a timeout
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            taskId: data.taskId,
            assignedTo: data.assignedTo
          });
        }, 500);
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Task Assigned",
        description: `Task has been assigned to ${variables.assignedTo}`,
      });
      
      // Update the task status directly in the tasks array
      if (selectedTask) {
        // Find and update the task in our local state
        const updatedTasks = tasks.map(task => {
          if (task.id === selectedTask.id) {
            return {
              ...task,
              assignedTo: assigneeName,
              status: 'assigned' as TaskStatus
            };
          }
          return task;
        });

        // Force a component re-render
        window.dispatchEvent(new Event('task-updated'));
      }
      
      setAssignDialogOpen(false);
      setAssigneeName('');
    },
    onError: (error) => {
      toast({
        title: "Failed to assign task",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Task completion mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (data: { taskId: number, notes: string }) => {
      // In a real app, this would call the server API
      // Here we'll just simulate it with a timeout
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            taskId: data.taskId,
            completedAt: new Date()
          });
        }, 500);
      });
    },
    onSuccess: () => {
      toast({
        title: "Task Completed",
        description: "Maintenance task has been marked as completed",
      });
      
      // Update the task status directly in the tasks array
      if (selectedTask) {
        // Find and update the task in our local state
        const updatedTasks = tasks.map(task => {
          if (task.id === selectedTask.id) {
            return {
              ...task,
              status: 'completed' as TaskStatus,
              completedAt: new Date()
            };
          }
          return task;
        });

        // Force a component re-render
        window.dispatchEvent(new Event('task-updated'));
      }
      
      setSelectedTask(null);
      setCompletionNotes('');
    },
    onError: (error) => {
      toast({
        title: "Failed to complete task",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Handle assigning task
  const handleAssignTask = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setAssignDialogOpen(true);
  };
  
  // Handle task completion
  const handleCompleteTask = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setCompletionNotes('');
  };
  
  // Submit task assignment
  const submitAssignment = () => {
    if (!selectedTask || !assigneeName.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter the name of the assignee",
        variant: "destructive",
      });
      return;
    }
    
    assignTaskMutation.mutate({
      taskId: selectedTask.id,
      assignedTo: assigneeName
    });
  };
  
  // Submit task completion
  const submitCompletion = () => {
    if (!selectedTask) {
      return;
    }
    
    completeTaskMutation.mutate({
      taskId: selectedTask.id,
      notes: completionNotes
    });
  };
  
  // Status badge styling
  const getStatusBadge = (status: TaskStatus) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gray-100">Pending</Badge>;
      case 'assigned':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Assigned</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Priority badge styling
  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'low':
        return <Badge className="bg-blue-500">Low</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'critical':
        return <Badge className="bg-red-500">Critical</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  // Listen for task update events to force a re-render
  useEffect(() => {
    const handleTaskUpdate = () => {
      // Force component to re-render
      setFilterStatus(prev => prev === 'all' ? 'all' : prev);
    };
    
    window.addEventListener('task-updated', handleTaskUpdate);
    
    return () => {
      window.removeEventListener('task-updated', handleTaskUpdate);
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Task Allocation</CardTitle>
          <CardDescription>
            Assign, track, and manage maintenance tasks for light towers requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="priority-filter">Filter by Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger id="priority-filter">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoadingTowers ? (
            <div className="flex justify-center items-center py-10">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-500 animate-pulse">Loading...</div>
                <p className="text-gray-500 mt-2">Fetching maintenance tasks</p>
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-10 border border-dashed rounded-lg">
              <div className="text-2xl font-semibold text-gray-400">No Tasks Found</div>
              <p className="text-gray-500 mt-2">There are no maintenance tasks matching your filters</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tower ID</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        {towers.find((tower: LightTower) => tower.id === task.towerId)?.towerId || "Unknown"}
                      </TableCell>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>{task.assignedTo || "Unassigned"}</TableCell>
                      <TableCell>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No deadline"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignTask(task)}
                          >
                            Assign
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-50 text-green-700 hover:bg-green-100"
                            onClick={() => handleCompleteTask(task)}
                          >
                            Mark Complete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Task Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Maintenance Task</DialogTitle>
            <DialogDescription>
              Assign this task to a maintenance technician or team member
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tower-id">Tower ID</Label>
              <Input 
                id="tower-id" 
                value={selectedTask ? towers.find((tower: LightTower) => tower.id === selectedTask.towerId)?.towerId : ""} 
                readOnly 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">Task Description</Label>
              <Textarea 
                id="task-description" 
                value={selectedTask?.description || ""} 
                readOnly 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee">Assign To</Label>
              <Input 
                id="assignee" 
                placeholder="Enter name of assignee" 
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitAssignment} disabled={assignTaskMutation.isPending}>
              {assignTaskMutation.isPending ? "Assigning..." : "Assign Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Task Completion Dialog */}
      <Dialog open={!!selectedTask && !assignDialogOpen} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Maintenance Task</DialogTitle>
            <DialogDescription>
              Mark this task as completed after maintenance work is done
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="completion-tower-id">Tower ID</Label>
              <Input 
                id="completion-tower-id" 
                value={selectedTask ? towers.find((tower: LightTower) => tower.id === selectedTask.towerId)?.towerId : ""} 
                readOnly 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="completion-notes">Completion Notes</Label>
              <Textarea 
                id="completion-notes" 
                placeholder="Enter details about the maintenance work performed" 
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTask(null)}>Cancel</Button>
            <Button onClick={submitCompletion} disabled={completeTaskMutation.isPending}>
              {completeTaskMutation.isPending ? "Completing..." : "Mark as Completed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskAllocation;