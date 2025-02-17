import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Goal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function GoalList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const res = await apiRequest("PATCH", `/api/goals/${id}`, { completed });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Goals</h2>
      {goals?.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          No goals yet. Create one above to get started!
        </Card>
      ) : (
        goals?.map((goal) => (
          <Card key={goal.id} className="p-6">
            <div className="flex items-start gap-4">
              <Checkbox
                checked={goal.completed}
                onCheckedChange={(checked) =>
                  updateGoalMutation.mutate({
                    id: goal.id,
                    completed: checked as boolean,
                  })
                }
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{goal.title}</h3>
                <p className="text-muted-foreground mt-1">{goal.description}</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Specific</h4>
                    <p className="text-sm">{goal.specific}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Measurable</h4>
                    <p className="text-sm">{goal.measurable}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Achievable</h4>
                    <p className="text-sm">{goal.achievable}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Relevant</h4>
                    <p className="text-sm">{goal.relevant}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Target Date: {format(new Date(goal.targetDate), "PP")}
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
