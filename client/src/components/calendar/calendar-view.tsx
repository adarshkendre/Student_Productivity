import { useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Schedule } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { format, addDays, parseISO } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function CalendarView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: schedules } = useQuery<Schedule[]>({
    queryKey: ["/api/schedules"],
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, date }: { id: number, date: string }) => {
      return apiRequest('PUT', `/api/schedules/${id}`, { date });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({
        title: "Schedule updated",
        description: "The schedule has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      });
    },
  });

  const handleEventDrop = (eventDropInfo: any) => {
    const { event } = eventDropInfo;
    if (event.id.startsWith('schedule-')) {
      const scheduleId = parseInt(event.id.split('-')[1]);
      updateScheduleMutation.mutate({
        id: scheduleId,
        date: format(eventDropInfo.event.start, 'yyyy-MM-dd'),
      });
    }
  };

  const getEvents = useCallback(() => {
    const events = [];

    if (schedules) {
      schedules.forEach(schedule => {
        try {
          const parsedSchedule = JSON.parse(schedule.schedule);
          const startDate = new Date(schedule.date);

          Object.entries(parsedSchedule).forEach(([day, data]: [string, any], index) => {
            const currentDate = addDays(startDate, index);

            // Add topics as an all-day event
            if (data.topics) {
              events.push({
                id: `schedule-${schedule.id}-topics-${index}`,
                title: `Topics: ${data.topics.join(", ")}`,
                start: format(currentDate, 'yyyy-MM-dd'),
                allDay: true,
                backgroundColor: '#3b82f6',
                classNames: ['schedule-topics'],
              });
            }

            // Add schedule items as timed events
            if (data.schedule) {
              Object.entries(data.schedule).forEach(([time, activity]) => {
                events.push({
                  id: `schedule-${schedule.id}-activity-${index}-${time}`,
                  title: activity as string,
                  start: `${format(currentDate, 'yyyy-MM-dd')}T${time}`,
                  backgroundColor: '#10b981',
                  classNames: ['schedule-activity'],
                });
              });
            }
          });
        } catch (error) {
          console.error('Error parsing schedule:', error);
        }
      });
    }

    return events;
  }, [schedules]);

  return (
    <Card className="p-6">
      <div className="h-[600px]">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridWeek"
          duration={{ weeks: 1 }}
          firstDay={0}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridWeek,dayGridMonth'
          }}
          events={getEvents()}
          eventContent={renderEventContent}
          height="100%"
          editable={true}
          eventDrop={handleEventDrop}
          slotMinTime={schedules?.[0]?.wakeUpTime || '06:00:00'}
          slotMaxTime={schedules?.[0]?.sleepTime || '22:00:00'}
        />
      </div>
    </Card>
  );
}

function renderEventContent(eventInfo: any) {
  return (
    <div className="p-2">
      <div className="font-semibold">{eventInfo.event.title}</div>
      {eventInfo.event.extendedProps.description && (
        <div className="text-xs mt-1 opacity-75">
          {eventInfo.event.extendedProps.description}
        </div>
      )}
    </div>
  );
}