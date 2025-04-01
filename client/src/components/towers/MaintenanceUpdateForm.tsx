import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { LightTower } from '../../types';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Form validation schema
const formSchema = z.object({
  status: z.enum(['active', 'warning', 'critical'], {
    required_error: 'Please select the current status of the light tower',
  }),
  notes: z.string().optional(),
  reportedBy: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  imageData: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MaintenanceUpdateFormProps {
  tower: LightTower;
  onSuccess?: () => void;
}

const MaintenanceUpdateForm: React.FC<MaintenanceUpdateFormProps> = ({ tower, onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: tower.status,
      notes: '',
      reportedBy: '',
      imageData: undefined,
    },
  });

  // Handle image capture
  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      form.setValue('imageData', base64String);
    };
    reader.readAsDataURL(file);
  };

  // Create mutation for submitting form
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = {
        towerId: tower.id,
        status: data.status,
        notes: data.notes || null,
        reportedBy: data.reportedBy,
        imageUrl: data.imageData || null,
      };
      
      return apiRequest('POST', '/api/reports', payload);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/towers'] });
      queryClient.invalidateQueries({ queryKey: [`/api/towers/${tower.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/towers/${tower.id}/reports`] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity'] });
      
      toast({
        title: 'Maintenance Report Submitted',
        description: `Thank you for updating the status of tower ${tower.towerId}`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit maintenance report. Please try again.',
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

  // Styling for status options
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 font-medium';
      case 'warning':
        return 'text-amber-600 font-medium';
      case 'critical':
        return 'text-red-600 font-medium';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Update Tower Status</CardTitle>
        <CardDescription>
          Provide current condition of light tower {tower.towerId} at {tower.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <SelectValue placeholder="Select Current Condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active" className={getStatusStyle('active')}>
                        Active - Working Properly
                      </SelectItem>
                      <SelectItem value="warning" className={getStatusStyle('warning')}>
                        Needs Attention - Minor Issues
                      </SelectItem>
                      <SelectItem value="critical" className={getStatusStyle('critical')}>
                        Critical - Not Working
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe any issues or observations"
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Please provide details about the tower's condition, any damage, or safety concerns
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image capture section */}
            <div className="space-y-2">
              <FormLabel>Upload Image (Optional)</FormLabel>
              <div className="flex flex-col gap-4">
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleCapture}
                  ref={fileInputRef}
                  className="hidden"
                />
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="mr-2">📷</span> Take Photo or Upload Image
                </Button>
                
                {imagePreview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
                    <div className="border rounded-md overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-40 mx-auto object-contain" 
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="mt-2 text-red-500 text-sm"
                      onClick={() => {
                        setImagePreview(null);
                        form.setValue('imageData', undefined);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      Remove Image
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="reportedBy"
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
                    This helps us track who submitted this report
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MaintenanceUpdateForm;