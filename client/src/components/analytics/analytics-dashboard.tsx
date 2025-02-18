
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface AnalyticsProps {
  goals: {
    total: number;
    completed: number;
  };
  learningsByDay: {
    date: string;
    count: number;
  }[];
}

export function AnalyticsDashboard({ goals, learningsByDay }: AnalyticsProps) {
  const completionRate = (goals.completed / goals.total) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Goal Completion Rate</h3>
        <Progress value={completionRate} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          {goals.completed} of {goals.total} goals completed
        </p>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">Learning Activity</h3>
        <ChartContainer config={{}} className="h-[200px]">
          <BarChart data={learningsByDay}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="count" fill="var(--primary)" />
          </BarChart>
        </ChartContainer>
      </Card>
    </div>
  );
}
