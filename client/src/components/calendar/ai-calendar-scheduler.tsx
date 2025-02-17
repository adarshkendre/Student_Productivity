
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

interface TimeSlot {
  date: Date;
  events: Event[];
}

const AICalendarScheduler: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<Event> | null>(null);

  const generateWeekTimeSlots = (startDate: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 7; i++) {
      slots.push({
        date: new Date(currentDate),
        events: []
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return slots;
  };

  const generateAISchedule = async (timeSlots: TimeSlot[]): Promise<TimeSlot[]> => {
    return timeSlots.map(slot => {
      const events: Event[] = [];
      
      if (slot.date.getDay() !== 0 && slot.date.getDay() !== 6) {
        events.push({
          id: `event-${Math.random()}`,
          title: 'AI Generated Event',
          start: new Date(new Date(slot.date).setHours(9, 0, 0)),
          end: new Date(new Date(slot.date).setHours(10, 0, 0))
        });
      }

      return {
        ...slot,
        events
      };
    });
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      const timeSlots = generateWeekTimeSlots(currentDate);
      const aiSchedule = await generateAISchedule(timeSlots);
      setSchedule(aiSchedule);
      setLoading(false);
    };

    fetchSchedule();
  }, [currentDate]);

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
  };

  const handleUpdateEvent = (slotIndex: number, eventId: string, updates: Partial<Event>) => {
    setSchedule(prevSchedule => {
      const newSchedule = [...prevSchedule];
      const eventIndex = newSchedule[slotIndex].events.findIndex(e => e.id === eventId);
      
      if (eventIndex !== -1) {
        newSchedule[slotIndex].events[eventIndex] = {
          ...newSchedule[slotIndex].events[eventIndex],
          ...updates
        };
      }
      
      return newSchedule;
    });
    setEditingEvent(null);
  };

  const handleDeleteEvent = (slotIndex: number, eventId: string) => {
    setSchedule(prevSchedule => {
      const newSchedule = [...prevSchedule];
      newSchedule[slotIndex].events = newSchedule[slotIndex].events.filter(e => e.id !== eventId);
      return newSchedule;
    });
  };

  const handleAddEvent = (slotIndex: number) => {
    setNewEvent({
      title: '',
      start: new Date(schedule[slotIndex].date.setHours(9, 0)),
      end: new Date(schedule[slotIndex].date.setHours(10, 0))
    });
  };

  const handleCreateEvent = (slotIndex: number) => {
    if (newEvent?.title && newEvent.start && newEvent.end) {
      setSchedule(prevSchedule => {
        const newSchedule = [...prevSchedule];
        newSchedule[slotIndex].events.push({
          id: `event-${Math.random()}`,
          ...newEvent as Event
        });
        return newSchedule;
      });
      setNewEvent(null);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          AI Schedule Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <p>Generating schedule...</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-4">
            {schedule.map((slot, slotIndex) => (
              <div key={slotIndex} className="border rounded p-2">
                <div className="font-medium mb-2 flex justify-between items-center">
                  <span>{slot.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddEvent(slotIndex)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {slot.events.map((event) => (
                    <div
                      key={event.id}
                      className="p-2 rounded border bg-gray-50 relative"
                      onClick={() => handleEditEvent(event)}
                    >
                      {editingEvent?.id === event.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editingEvent.title}
                            onChange={e => setEditingEvent({
                              ...editingEvent,
                              title: e.target.value
                            })}
                            className="text-sm"
                          />
                          <Input
                            type="time"
                            value={editingEvent.start.toTimeString().slice(0, 5)}
                            onChange={e => {
                              const [hours, minutes] = e.target.value.split(':');
                              const newDate = new Date(editingEvent.start);
                              newDate.setHours(parseInt(hours), parseInt(minutes));
                              setEditingEvent({
                                ...editingEvent,
                                start: newDate
                              });
                            }}
                            className="text-sm"
                          />
                          <Input
                            type="time"
                            value={editingEvent.end.toTimeString().slice(0, 5)}
                            onChange={e => {
                              const [hours, minutes] = e.target.value.split(':');
                              const newDate = new Date(editingEvent.end);
                              newDate.setHours(parseInt(hours), parseInt(minutes));
                              setEditingEvent({
                                ...editingEvent,
                                end: newDate
                              });
                            }}
                            className="text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleUpdateEvent(slotIndex, event.id, editingEvent)}
                          >
                            Save
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(slotIndex, event.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm">
                            {event.start.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {' - '}
                            {event.end.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {newEvent && slotIndex === schedule.findIndex(s => 
                    s.date.toDateString() === slot.date.toDateString()
                  ) && (
                    <div className="p-2 rounded border bg-gray-50 space-y-2">
                      <Input
                        placeholder="Event title"
                        value={newEvent.title || ''}
                        onChange={e => setNewEvent({
                          ...newEvent,
                          title: e.target.value
                        })}
                        className="text-sm"
                      />
                      <Input
                        type="time"
                        value={newEvent.start?.toTimeString().slice(0, 5)}
                        onChange={e => {
                          const [hours, minutes] = e.target.value.split(':');
                          const newDate = new Date(slot.date);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          setNewEvent({
                            ...newEvent,
                            start: newDate
                          });
                        }}
                        className="text-sm"
                      />
                      <Input
                        type="time"
                        value={newEvent.end?.toTimeString().slice(0, 5)}
                        onChange={e => {
                          const [hours, minutes] = e.target.value.split(':');
                          const newDate = new Date(slot.date);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          setNewEvent({
                            ...newEvent,
                            end: newDate
                          });
                        }}
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleCreateEvent(slotIndex)}
                      >
                        Create
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AICalendarScheduler;
