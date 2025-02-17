import { useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useQuery } from '@tanstack/react-query';
import { Goal } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

export default function CalendarView() {
  const { data: goals } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });
  
  const { data: schedules } = useQuery<Schedule[]>({
    queryKey: ["/api/schedules"],
  });

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
      })));
    }
    
    return events;
  }, [goals, schedules]);

  return (
    <Card className="p-6">
      <div className="h-[600px]">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
          }}
          events={getEvents()}
          eventContent={renderEventContent}
          height="100%"
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