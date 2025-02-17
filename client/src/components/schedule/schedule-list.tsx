import { useQuery } from "@tanstack/react-query";
import { Schedule } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, Calendar, Clock, List } from "lucide-react";
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
      const parsed = typeof scheduleStr === 'string' ? JSON.parse(scheduleStr) : scheduleStr;
      if (parsed?.message) {
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
        <h2 className="text-2xl font-bold">Your Learning Schedules</h2>
      </div>

      {schedules?.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          No schedules generated yet. Create a goal and generate a schedule to get started!
        </Card>
      ) : (
        schedules?.map((schedule) => {
          const parsedSchedule = parseSchedule(schedule.schedule);

          return (
            <Card key={schedule.id} className="p-6">
              <div className="space-y-6">
                <div className="text-sm text-muted-foreground">
                  Generated on: {format(new Date(schedule.date), "PPp")}
                </div>

                {parsedSchedule.isMessage ? (
                  <p className="text-muted-foreground">{parsedSchedule.content}</p>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(parsedSchedule.content).map(([day, data]: [string, any]) => (
                      <div key={day} className="space-y-4">
                        <h3 className="text-xl font-semibold border-b pb-2">{day}</h3>

                        {data.topics && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 font-medium">
                              <List className="h-4 w-4" />
                              Topics to Cover:
                            </div>
                            <ul className="list-disc list-inside pl-4 text-muted-foreground">
                              {data.topics.map((topic: string, index: number) => (
                                <li key={index}>{topic}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {data.schedule && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 font-medium">
                              <Clock className="h-4 w-4" />
                              Daily Schedule:
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {Object.entries(data.schedule).map(([time, activity]) => (
                                <div key={time} className="flex items-start gap-2">
                                  <span className="font-semibold min-w-[80px]">{time}:</span>
                                  <span className="text-muted-foreground">{activity as string}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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