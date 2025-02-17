import { useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import { Goal, Schedule } from '@shared/schema';
import { Card } from '@/components/ui/card';

export default function CalendarView() {
  const { data: goals } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: schedules } = useQuery<Schedule[]>({
    queryKey: ["/api/schedules"],
  });

  const getEvents = useCallback(() => {
    const events = [];

    // Add goals as events
    if (goals) {
      events.push(...goals.map(goal => ({
        id: `goal-${goal.id}`,
        title: goal.title,
        start: goal.targetDate,
        end: goal.targetDate,
        allDay: true,
        backgroundColor: goal.completed ? '#22c55e' : '#3b82f6',
        extendedProps: {
          type: 'goal',
          description: goal.description,
        },
      })));
    }

    // Add schedule items as events
    if (schedules) {
      schedules.forEach(schedule => {
        const scheduleItems = JSON.parse(schedule.schedule);
        Object.entries(scheduleItems).forEach(([time, activity]) => {
          const [hour, minute] = time.split(':');
          const date = new Date(schedule.date);
          date.setHours(parseInt(hour), parseInt(minute), 0);
          
          events.push({
            id: `schedule-${schedule.id}-${time}`,
            title: activity as string,
            start: date.toISOString(),
            end: new Date(date.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
            backgroundColor: '#8b5cf6',
            extendedProps: {
              type: 'schedule',
            },
          });
        });
      });
    }

    return events;
  }, [goals, schedules]);

  return (
    <Card className="p-6">
      <div className="h-[600px]">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
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
    <div className="text-xs">
      <div className="font-semibold">{eventInfo.event.title}</div>
      {eventInfo.event.extendedProps.type === 'goal' && (
        <div className="text-xs opacity-75">{eventInfo.event.extendedProps.description}</div>
      )}
    </div>
  );
}
