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
      specific: "",
      measurable: "",
      achievable: "",
      relevant: "",
      completed: false,
    },
  });

  const generateScheduleMutation = useMutation({
    mutationFn: async (data: ScheduleRequest) => {
      const res = await apiRequest("POST", "/api/schedules/generate", data);
      return res.json();
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      form.reset();
      toast({
        title: "Goal created",
        description: "Your goal has been successfully created.",
      });

      // Generate a new schedule after goal creation
      if (user) {
        const scheduleRequest: ScheduleRequest = {
          wakeUpTime: user.wakeUpTime || "06:00",
          sleepTime: user.sleepTime || "22:00",
          preferences: [],
        };
        await generateScheduleMutation.mutateAsync(scheduleRequest);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
                  <Input {...field} />
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
                  <Textarea {...field} />
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
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="specific"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specific</FormLabel>
                  <FormControl>
                    <Input placeholder="What exactly do you want to achieve?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="measurable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Measurable</FormLabel>
                  <FormControl>
                    <Input placeholder="How will you measure success?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="achievable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Achievable</FormLabel>
                  <FormControl>
                    <Input placeholder="Is this realistically achievable?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relevant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relevant</FormLabel>
                  <FormControl>
                    <Input placeholder="Why is this goal important?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createGoalMutation.isPending || generateScheduleMutation.isPending}
          >
            Create Goal
          </Button>
        </form>
      </Form>
    </Card>
  );
}