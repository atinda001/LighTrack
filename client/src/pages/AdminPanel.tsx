import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { LightTower } from '@/types';
import TaskAllocation from '@/components/admin/TaskAllocation';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [selectedTower, setSelectedTower] = useState<LightTower | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch all towers
  const { data: towers = [], isLoading } = useQuery<LightTower[]>({
    queryKey: ['/api/towers'],
  });

  // Filter towers based on verification status
  const filteredTowers = towers.filter(tower => {
    if (filterStatus === 'all') return true;
    return tower.verificationStatus === filterStatus;
  });

  // Mutation for updating tower verification status
  const updateVerificationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest('PATCH', `/api/towers/${id}`, {
        verificationStatus: status,
        updatedBy: 'Admin'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/towers'] });
      setIsDialogOpen(false);
      toast({
        title: 'Status Updated',
        description: 'The tower verification status has been updated successfully.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update verification status.',
        variant: 'destructive'
      });
    }
  });

  // Handle verification status change
  const handleVerificationChange = (status: 'verified' | 'rejected') => {
    if (!selectedTower) return;
    
    updateVerificationMutation.mutate({
      id: selectedTower.id,
      status
    });
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let color = '';
    
    switch (status) {
      case 'active':
        color = 'bg-green-100 text-green-800';
        break;
      case 'warning':
        color = 'bg-yellow-100 text-yellow-800';
        break;
      case 'critical':
        color = 'bg-red-100 text-red-800';
        break;
      default:
        color = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <Badge className={color} variant="outline">
        <span className={`status-indicator status-${status} mr-1`}></span>
        {status === 'active' ? 'Active' : status === 'warning' ? 'Needs Attention' : 'Critical'}
      </Badge>
    );
  };

  // Verification badge component
  const VerificationBadge = ({ status }: { status: string }) => {
    let color = '';
    
    switch (status) {
      case 'verified':
        color = 'bg-green-100 text-green-800';
        break;
      case 'pending':
        color = 'bg-yellow-100 text-yellow-800';
        break;
      case 'rejected':
        color = 'bg-red-100 text-red-800';
        break;
      default:
        color = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <Badge className={color} variant="outline">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-poppins font-semibold text-textColor mb-2">Admin Panel</h2>
        <p className="text-gray-600 font-roboto">Manage and verify light towers</p>
      </div>
      
      <Tabs defaultValue="verification" className="mb-6">
        <TabsList>
          <TabsTrigger value="verification">Tower Verification</TabsTrigger>
          <TabsTrigger value="tasks">Task Allocation</TabsTrigger>
          <TabsTrigger value="reports">Maintenance Reports</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        
        {/* Tower Verification Tab */}
        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <CardTitle>Tower Verification</CardTitle>
                  <CardDescription>Verify or reject tower registrations</CardDescription>
                </div>
                <Select 
                  onValueChange={setFilterStatus}
                  defaultValue="pending"
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Towers</SelectItem>
                    <SelectItem value="pending">Pending Verification</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : filteredTowers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tower ID</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTowers.map((tower) => (
                        <TableRow key={tower.id}>
                          <TableCell className="font-medium">{tower.towerId}</TableCell>
                          <TableCell>
                            <div>
                              <div>{tower.location}</div>
                              <div className="text-xs text-gray-500">
                                {tower.constituency}, {tower.ward}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={tower.status} />
                          </TableCell>
                          <TableCell>
                            <VerificationBadge status={tower.verificationStatus} />
                          </TableCell>
                          <TableCell>
                            {new Date(tower.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedTower(tower);
                                setIsDialogOpen(true);
                              }}
                            >
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No towers found with the selected filter</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Task Allocation Tab */}
        <TabsContent value="tasks">
          <TaskAllocation />
        </TabsContent>
        
        {/* Maintenance Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Reports</CardTitle>
              <CardDescription>View and manage maintenance reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-gray-500">Maintenance reports management will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* User Management Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage system users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-gray-500">User management will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Tower Review Dialog */}
      {selectedTower && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Review Tower: {selectedTower.towerId}</DialogTitle>
              <DialogDescription>
                Review details and verify or reject this tower registration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p>{selectedTower.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <StatusBadge status={selectedTower.status} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Constituency</p>
                  <p>{selectedTower.constituency}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Ward</p>
                  <p>{selectedTower.ward}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p>{selectedTower.notes || 'No notes provided'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Verification Status</p>
                  <VerificationBadge status={selectedTower.verificationStatus} />
                </div>
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button
                variant="outline"
                className="bg-red-100 text-red-800 hover:bg-red-200 border-red-300"
                onClick={() => handleVerificationChange('rejected')}
                disabled={updateVerificationMutation.isPending}
              >
                Reject
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700" 
                onClick={() => handleVerificationChange('verified')}
                disabled={updateVerificationMutation.isPending}
              >
                {updateVerificationMutation.isPending ? 'Processing...' : 'Verify'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminPanel;
