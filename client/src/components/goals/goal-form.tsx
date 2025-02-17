import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGoalSchema, InsertGoal, scheduleRequestSchema, ScheduleRequest } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";

export default function GoalForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const form = useForm<InsertGoal>({
    resolver: zodResolver(insertGoalSchema),
    defaultValues: {
      title: "",
      description: "",
      targetDate: "",
      completed: false,
    },
  });

  const generateScheduleMutation = useMutation({
    mutationFn: async (data: ScheduleRequest) => {
      const res = await apiRequest("POST", "/api/schedules/generate", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({
        title: "Schedule generated",
        description: "Learning schedule has been created based on your goal.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate schedule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goal: InsertGoal) => {
      const res = await apiRequest("POST", "/api/goals", goal);
      return res.json();
    },
    onSuccess: async (goal) => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      form.reset();
      toast({
        title: "Goal created",
        description: "Your goal has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateSchedule = async () => {
    if (!user) return;

    const formData = form.getValues();
    if (!formData.title || !formData.description || !formData.targetDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields before generating a schedule.",
        variant: "destructive",
      });
      return;
    }

    const scheduleRequest: ScheduleRequest = {
      wakeUpTime: user.wakeUpTime || "06:00",
      sleepTime: user.sleepTime || "22:00",
      preferences: [],
      goalTitle: formData.title,
      goalDescription: formData.description,
      targetDate: formData.targetDate,
    };

    await generateScheduleMutation.mutateAsync(scheduleRequest);
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Goal</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => createGoalMutation.mutate(data))}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="What do you want to achieve?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your goal in detail..."
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={createGoalMutation.isPending}
            >
              Create Goal
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleGenerateSchedule}
              disabled={generateScheduleMutation.isPending}
            >
              Generate Learning Schedule
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}