import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLearningSchema, InsertLearning } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

export default function LearningForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertLearning>({
    resolver: zodResolver(insertLearningSchema),
    defaultValues: {
      content: "",
    },
  });

  const createLearningMutation = useMutation({
    mutationFn: async (learning: InsertLearning) => {
      const res = await apiRequest("POST", "/api/learnings", learning);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learnings"] });
      form.reset();
      toast({
        title: "Learning logged",
        description: "Your learning has been successfully recorded.",
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
      <h2 className="text-2xl font-bold mb-6">What did you learn today?</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) =>
            createLearningMutation.mutate(data)
          )}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Today's Learning</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share what you learned today..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={createLearningMutation.isPending}
          >
            Log Learning
          </Button>
        </form>
      </Form>
    </Card>
  );
}
