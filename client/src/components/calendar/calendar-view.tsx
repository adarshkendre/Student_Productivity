
import { useCallback, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Goal, Schedule } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function CalendarView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingEvent, setEditingEvent] = useState(null);

  const { data: goals } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });
  
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
    
    if (goals) {
      events.push(...goals.map(goal => ({
        id: `goal-${goal.id}`,
        title: goal.title,
        start: format(new Date(goal.targetDate), 'yyyy-MM-dd'),
        allDay: true,
        backgroundColor: goal.completed ? '#22c55e' : '#3b82f6',
        extendedProps: {
          description: goal.description,
          specific: goal.specific,
          measurable: goal.measurable,
        },
        editable: false,
      })));
    }
    
    if (schedules) {
      events.push(...schedules.map(schedule => ({
        id: `schedule-${schedule.id}`,
        title: 'Learning Schedule',
        start: format(new Date(schedule.date), 'yyyy-MM-dd'),
        allDay: true,
        backgroundColor: '#10b981',
        extendedProps: {
          description: 'Daily learning schedule',
        },
        editable: true,
      })));
    }
    
    return events;
  }, [goals, schedules]);

  return (
    <Card className="p-6">
      <div className="h-[600px]">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
          }}
          events={getEvents()}
          eventContent={renderEventContent}
          height="100%"
          editable={true}
          eventDrop={handleEventDrop}
        />
      </div>
    </Card>
  );
}

function renderEventContent(eventInfo: any) {
  return (
    <div className="p-2">
      <div className="font-semibold">{eventInfo.event.title}</div>
      <div className="text-xs mt-1 opacity-75">
        {eventInfo.event.extendedProps.specific}
      </div>
    </div>
  );
}
