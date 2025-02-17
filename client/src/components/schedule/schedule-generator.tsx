import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScheduleRequest, scheduleRequestSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function ScheduleGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ScheduleRequest>({
    resolver: zodResolver(scheduleRequestSchema),
    defaultValues: {
      wakeUpTime: "06:00",
      sleepTime: "22:00",
      preferences: [],
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
        description: "Your daily schedule has been created.",
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
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Generate Daily Schedule</h2>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) =>
            generateScheduleMutation.mutate(data)
          )}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="wakeUpTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wake Up Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sleepTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sleep Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={generateScheduleMutation.isPending}
          >
            Generate Schedule
          </Button>
        </form>
      </Form>
    </Card>
  );
}
