import { useState, useEffect } from 'react';
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
  location: z.string().min(5, { message: 'Location must be at least 5 characters' }),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
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
  
  // Store filtered wards based on selected constituency
  const [filteredWards, setFilteredWards] = useState<string[]>([]);
  
  // Function to get wards for a constituency by filtering from the list 
  const getWardsForConstituency = (constituency: string): string[] => {
    // Try to filter based on naming patterns in Nairobi
    switch (constituency) {
      case 'Dagoretti North':
        return ['Kilimani', 'Kawangware', 'Gatina', 'Kileleshwa', 'Kabiro'];
      case 'Dagoretti South':
        return ['Mutuini', 'Ngando', 'Riruta', 'Uthiru/Ruthimitu', 'Waithaka'];
      case 'Embakasi Central':
        return ['Kayole North', 'Kayole Central', 'Kayole South', 'Komarock', 'Matopeni/Spring Valley'];
      case 'Embakasi East':
        return ['Upper Savanna', 'Lower Savanna', 'Embakasi', 'Utawala', 'Mihango'];
      case 'Embakasi North':
        return ['Kariobangi North', 'Dandora Area I', 'Dandora Area II', 'Dandora Area III', 'Dandora Area IV'];
      case 'Embakasi South':
        return ['Imara Daima', 'Kwa Njenga', 'Kwa Reuben', 'Pipeline', 'Kware'];
      case 'Embakasi West':
        return ['Umoja I', 'Umoja II', 'Mowlem', 'Kariobangi South'];
      case 'Kamukunji':
        return ['Pumwani', 'Eastleigh North', 'Eastleigh South', 'Airbase', 'California'];
      case 'Kasarani':
        return ['Clay City', 'Mwiki', 'Kasarani', 'Njiru', 'Ruai'];
      case 'Kibra':
        return ['Laini Saba', 'Lindi', 'Makina', 'Woodley/Kenyatta Golf Course', 'Sarangombe'];
      case 'Langata':
        return ['Karen', 'Nairobi West', 'Mugumo-Ini', 'South C', 'Nyayo Highrise'];
      case 'Makadara':
        return ['Maringo/Hamza', 'Viwandani', 'Harambee', 'Makongeni'];
      case 'Mathare':
        return ['Hospital', 'Mabatini', 'Huruma', 'Ngei', 'Mlango Kubwa', 'Kiamaiko'];
      case 'Roysambu':
        return ['Githurai', 'Kahawa West', 'Zimmerman', 'Roysambu', 'Kahawa'];
      case 'Ruaraka':
        return ['Baba Dogo', 'Utalii', 'Mathare North', 'Lucky Summer', 'Korogocho'];
      case 'Starehe':
        return ['Nairobi Central', 'Ngara', 'Pangani', 'Ziwani/Kariokor', 'Landimawe', 'Nairobi South'];
      case 'Westlands':
        return ['Kitisuru', 'Parklands/Highridge', 'Karura', 'Kangemi', 'Mountain View'];
      default:
        return [];
    }
  };

  // Set up form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: '',
      latitude: '',
      longitude: '',
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
        location: data.location,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        constituency: data.constituency,
        ward: data.ward,
        status: data.status,
        lastMaintenance: data.lastMaintenance && data.lastMaintenance.trim() !== '' ? new Date(data.lastMaintenance).toISOString() : null,
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

  // Watch for constituency changes and update wards list
  useEffect(() => {
    // When filters are loaded, initialize with all wards
    if (filters.wards.length > 0 && filteredWards.length === 0) {
      setFilteredWards(filters.wards);
    }
  }, [filters.wards, filteredWards]);
  
  // Watch constituency field
  const constituency = form.watch('constituency');
  
  // Update wards when constituency changes
  useEffect(() => {
    // If no constituency is selected, show all wards
    if (!constituency || constituency.trim() === '') {
      setFilteredWards(filters.wards);
      return;
    }
    
    // Reset ward selection when constituency changes
    form.setValue('ward', '');
    
    // Update the ward list based on the selected constituency
    const wards = getWardsForConstituency(constituency);
    setFilteredWards(wards);
  }, [constituency, filters.wards, form]);

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

                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Light Tower Location</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input 
                              placeholder="e.g. Parklands Road, near Westlands Mall" 
                              {...field} 
                            />
                            <div className="flex flex-col gap-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="w-full"
                                onClick={() => {
                                  if (navigator.geolocation) {
                                    toast({
                                      title: "Getting your location...",
                                      description: "Please allow location access if prompted."
                                    });
                                    
                                    navigator.geolocation.getCurrentPosition(
                                      (position) => {
                                        const { latitude, longitude } = position.coords;
                                        form.setValue('latitude', latitude.toString());
                                        form.setValue('longitude', longitude.toString());
                                        toast({
                                          title: "Location obtained!",
                                          description: `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`,
                                        });
                                      },
                                      (error) => {
                                        toast({
                                          title: "Location error",
                                          description: `Could not get location: ${error.message}`,
                                          variant: "destructive"
                                        });
                                      }
                                    );
                                  } else {
                                    toast({
                                      title: "Geolocation not supported",
                                      description: "Your browser doesn't support geolocation. Please enter location manually.",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                              >
                                <span className="mr-2">📍</span> Use my current location
                              </Button>

                              <Button 
                                type="button" 
                                variant="outline" 
                                className="w-full"
                                onClick={() => {
                                  // Determine the device platform
                                  const userAgent = navigator.userAgent || navigator.vendor;
                                  let mapUrl = '';
                                  
                                  if (/android/i.test(userAgent)) {
                                    // For Android devices
                                    mapUrl = 'geo:0,0?q=my+location';
                                  } else if (/iPad|iPhone|iPod/.test(userAgent)) {
                                    // For iOS devices
                                    mapUrl = 'maps://maps.apple.com/?q=my+location';
                                  } else {
                                    // For desktop/others, use Google Maps
                                    mapUrl = 'https://www.google.com/maps';
                                  }
                                  
                                  // Open the maps application
                                  window.open(mapUrl, '_blank');
                                  
                                  toast({
                                    title: "Opening Maps",
                                    description: "Please get your coordinates from the maps application and enter them manually.",
                                  });
                                }}
                              >
                                <span className="mr-2">🗺️</span> Open Maps App
                              </Button>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Provide a detailed location to help others find the tower. For best results, use the "Use my current location" button when you're at the tower site.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input placeholder="-1.2644" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional: The exact latitude coordinates
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input placeholder="36.8066" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional: The exact longitude coordinates
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          {filteredWards.map(ward => (
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
