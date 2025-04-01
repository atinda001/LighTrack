import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filters } from '@/types';

// Create schema for tower registration form
const formSchema = z.object({
  towerId: z.string().optional(),
  location: z.string().min(5, { message: 'Location must be at least 5 characters' }),
  constituency: z.string().min(1, { message: 'Please select a constituency' }),
  ward: z.string().min(1, { message: 'Please select a ward' }),
  status: z.enum(['active', 'warning', 'critical']),
  lastMaintenance: z.string().optional(),
  notes: z.string().optional(),
  confirm: z.boolean().refine(val => val === true, {
    message: 'You must confirm this is a valid light tower',
  }),
  registeredBy: z.string().min(2, { message: 'Please provide your name' }),
});

type FormValues = z.infer<typeof formSchema>;

const RegisterTower = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch filters for dropdown options
  const { data: filters = { constituencies: [], wards: [] } } = useQuery<Filters>({
    queryKey: ['/api/filters'],
  });

  // Set up form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      towerId: '',
      location: '',
      constituency: '',
      ward: '',
      status: 'active',
      lastMaintenance: new Date().toISOString().split('T')[0],
      notes: '',
      confirm: false,
      registeredBy: '',
    },
  });

  // Create mutation for submitting form
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Transform the data to match the API requirements
      const payload = {
        towerId: data.towerId || undefined,
        location: data.location,
        constituency: data.constituency,
        ward: data.ward,
        status: data.status,
        lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : undefined,
        notes: data.notes,
        verificationStatus: 'pending',
        registeredBy: data.registeredBy
      };
      
      return apiRequest('POST', '/api/towers', payload);
    },
    onSuccess: async (response) => {
      const newTower = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/towers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity'] });
      
      toast({
        title: 'Tower Registered Successfully',
        description: `Tower ID: ${newTower.towerId} has been registered and is pending verification`,
      });
      
      // Navigate to the QR code generation page
      setLocation(`/generate/${newTower.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to register light tower. Please try again.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-poppins font-semibold text-textColor mb-2">Register New Light Tower</h2>
        <p className="text-gray-600 font-roboto">Add a new light tower to the system</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="towerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tower ID (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. LT-123 (leave blank for auto-generate)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        A unique identifier for this tower. Leave blank to auto-generate.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Light Tower Location</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Parklands Road, near Westlands Mall" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a detailed location to help others find the tower
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="constituency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Constituency</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Constituency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filters.constituencies.map(constituency => (
                            <SelectItem key={constituency} value={constituency}>
                              {constituency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ward</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Ward" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filters.wards.map(ward => (
                            <SelectItem key={ward} value={ward}>
                              {ward}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Condition</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active - Working Properly</SelectItem>
                          <SelectItem value="warning">Needs Attention - Minor Issues</SelectItem>
                          <SelectItem value="critical">Critical - Not Working</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastMaintenance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Maintenance Date (if known)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Leave blank if unknown
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional information about this light tower"
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="registeredBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your name" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          This helps us track who registered the tower
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="confirm"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I confirm this is a valid light tower that needs to be registered
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation('/')}
                  className="mr-3"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Registering...' : 'Register Tower'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default RegisterTower;
