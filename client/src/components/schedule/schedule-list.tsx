import { useQuery } from "@tanstack/react-query";
import { Schedule } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ScheduleList() {
  const { toast } = useToast();
  const { data: schedules, isLoading } = useQuery<Schedule[]>({
    queryKey: ["/api/schedules"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const parseSchedule = (scheduleStr: string) => {
    try {
      const parsed = JSON.parse(scheduleStr);
      if (parsed.message) {
        return { isMessage: true, content: parsed.message };
      }
      return { isMessage: false, content: parsed };
    } catch (error) {
      console.error('Schedule parsing error:', error, 'Schedule string:', scheduleStr);
      toast({
        title: "Error",
        description: "Failed to parse schedule data",
        variant: "destructive",
      });
      return { isMessage: true, content: "Invalid schedule format" };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Your Schedules</h2>
      </div>

      {schedules?.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          No schedules generated yet. Create one above to get started!
        </Card>
      ) : (
        schedules?.map((schedule) => {
          const parsedSchedule = parseSchedule(schedule.schedule);

          return (
            <Card key={schedule.id} className="p-6">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Generated on: {format(new Date(schedule.date), "PPp")}
                </div>

                {parsedSchedule.isMessage ? (
                  <p className="text-muted-foreground">{parsedSchedule.content}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(parsedSchedule.content).map(([time, activity]) => (
                      <div key={time} className="flex items-start gap-2">
                        <span className="font-semibold min-w-[80px]">{time}:</span>
                        <span>{activity as string}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}