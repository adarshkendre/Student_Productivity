import { useQuery } from "@tanstack/react-query";
import { Learning } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function LearningList() {
  const { data: learnings, isLoading } = useQuery<Learning[]>({
    queryKey: ["/api/learnings"],
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
      <h2 className="text-2xl font-bold">Learning History</h2>
      {learnings?.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          No learnings recorded yet. What did you learn today?
        </Card>
      ) : (
        learnings?.map((learning) => (
          <Card key={learning.id} className="p-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {format(new Date(learning.date), "PPp")}
              </div>
              <p className="text-lg whitespace-pre-wrap">{learning.content}</p>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
