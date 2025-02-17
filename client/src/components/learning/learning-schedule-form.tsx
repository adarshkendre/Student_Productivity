import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduleRequestSchema, ScheduleRequest } from "@shared/schema";
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

export default function LearningScheduleForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const form = useForm<ScheduleRequest>({
    resolver: zodResolver(scheduleRequestSchema),
    defaultValues: {
      wakeUpTime: user?.wakeUpTime || "06:00",
      sleepTime: user?.sleepTime || "22:00",
      preferences: [],
      goalTitle: "",
      goalDescription: "",
      targetDate: "",
    },
  });

  const generateScheduleMutation = useMutation({
    mutationFn: async (data: ScheduleRequest) => {
      const res = await apiRequest("POST", "/api/schedules/generate", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      form.reset({
        ...form.getValues(),
        goalTitle: "",
        goalDescription: "",
        targetDate: "",
      });
      toast({
        title: "Schedule generated",
        description: "Your learning schedule has been created.",
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

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Generate Learning Schedule</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) =>
            generateScheduleMutation.mutate(data)
          )}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="goalTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What do you want to learn?</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Python Basics, Web Development" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="goalDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Describe your learning goal</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What specific topics do you want to cover?"
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
                <FormLabel>Target completion date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={generateScheduleMutation.isPending}
          >
            Generate Learning Schedule
          </Button>
        </form>
      </Form>
    </Card>
  );
}
