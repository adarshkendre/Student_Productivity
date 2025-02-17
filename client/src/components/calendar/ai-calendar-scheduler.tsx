import React, { useState, useEffect } from 'react';
import { Calendar, Check, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog';
import ConceptValidation from '@/components/learning/concept-validation'; // Import Dialog components


interface DailyGoal {
  id: string;
  topic: string;
  description: string;
  completed: boolean;
  validated: boolean;
}

interface DaySchedule {
  date: Date;
  goals: DailyGoal[];
  streak: number;
}

interface Streak {
  current: number;
  best: number;
}

interface ConceptValidationProps {
  topic: string;
  onValidated: (success: boolean) => void;
}

// Placeholder - replace with your actual validation component
const ConceptValidationDialog: React.FC<ConceptValidationProps> = ({
  topic,
  onValidated,
  onClose
}) => {
  return (
    <DialogContent className="sm:max-w-[90%] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Concept Validation: {topic}</DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        <ConceptValidation 
          topic={topic}
          onValidated={(success) => {
            onValidated(success);
            onClose();
          }}
        />
      </div>
    </DialogContent>
  );
};


const AICalendarScheduler: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false); // State for the validation dialog
  const [validationTopic, setValidationTopic] = useState(''); // State for the topic to validate
  const [streak, setStreak] = useState<Streak>({ current: 0, best: 0 });
  const [numWeeks, setNumWeeks] = useState(4);

  const generateAISchedule = async (startDate: Date): Promise<DaySchedule[]> => {
    // This is a simulation of AI-generated topics
    // Replace this with your actual AI service integration
    const topics = [
      {
        subject: "JavaScript Fundamentals",
        subtopics: [
          "Variables and Data Types",
          "Functions and Scope",
          "Arrays and Objects",
          "DOM Manipulation",
          "Async Programming",
          "Error Handling",
          "ES6 Features"
        ]
      },
      {
        subject: "React Essentials",
        subtopics: [
          "Components and Props",
          "State Management",
          "Hooks Overview",
          "Effect Hooks",
          "Context API",
          "React Router",
          "Performance Optimization"
        ]
      }
    ];

    const days: DaySchedule[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < numWeeks * 7; i++) { // Extended to multiple weeks
      const subject = topics[Math.floor(i / 7) % topics.length];
      const dayTopics = subject.subtopics[i % subject.subtopics.length];

      days.push({
        date: new Date(currentDate),
        goals: [
          {
            id: `goal-${i}-1`,
            topic: subject.subject,
            description: `Learn ${dayTopics}`,
            completed: false,
            validated: false // Initialize validation status
          },
          {
            id: `goal-${i}-2`,
            topic: "Practice",
            description: `Complete exercises on ${dayTopics}`,
            completed: false,
            validated: false // Initialize validation status
          }
        ],
        streak: 0 // Initialize streak for each day
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      const aiSchedule = await generateAISchedule(currentDate);
      setSchedule(aiSchedule);
      setLoading(false);
    };

    fetchSchedule();
  }, [currentDate, numWeeks]);

  const toggleGoalCompletion = (dayIndex: number, goalId: string) => {
    setSchedule(prevSchedule => {
      const newSchedule = [...prevSchedule];
      const goalIndex = newSchedule[dayIndex].goals.findIndex(g => g.id === goalId);
      if (goalIndex !== -1) {
        // Only allow completion if not already validated
        if (!newSchedule[dayIndex].goals[goalIndex].validated) {
          newSchedule[dayIndex].goals[goalIndex].completed = !newSchedule[dayIndex].goals[goalIndex].completed;
          if (newSchedule[dayIndex].goals[goalIndex].completed) {
            setValidationTopic(newSchedule[dayIndex].goals[goalIndex].topic);
            setOpen(true);
          }
        }
      }
      return newSchedule;
    });
  };

  const handleValidationComplete = (success: boolean) => {
    setSchedule(prevSchedule => {
      const newSchedule = [...prevSchedule];
      const dayIndex = newSchedule.findIndex(day => day.goals.find(g => g.topic === validationTopic));
      const goalIndex = newSchedule[dayIndex].goals.findIndex(g => g.topic === validationTopic);
      if (goalIndex !== -1) {
        newSchedule[dayIndex].goals[goalIndex].validated = success;
        if (!success) {
          newSchedule[dayIndex].goals[goalIndex].completed = false;
        }
      }
      return newSchedule;
    })
    setOpen(false);
  };

  return (
    <div>
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              AI Learning Schedule
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                Current Streak: {streak.current} days
              </div>
              <div className="text-sm">
                Best Streak: {streak.best} days
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <p>Generating learning schedule...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-4">
              {schedule.map((day, dayIndex) => (
                <div key={dayIndex} className="border rounded p-2">
                  <div className="font-medium mb-2 flex justify-between items-center">
                    <span>{day.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="text-sm text-gray-500">
                      {day.goals.filter(g => g.completed).length}/{day.goals.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {day.goals.map((goal) => (
                      <div
                        key={goal.id}
                        className={`p-2 rounded border ${
                          goal.completed ? 'bg-green-50' : 'bg-gray-50'
                        } relative cursor-pointer`}
                        onClick={() => toggleGoalCompletion(dayIndex, goal.id)}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`mt-1 flex-shrink-0 w-4 h-4 border rounded-sm ${
                            goal.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                          }`}>
                            {goal.completed && <Check className="w-3 h-3 text-white" />}
                            {goal.validated && <Check className="w-3 h-3 text-white absolute top-1 right-1" />}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{goal.topic}</div>
                            <div className="text-sm text-gray-600">{goal.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <ConceptValidationDialog topic={validationTopic} onValidationComplete={handleValidationComplete} onClose={() => setOpen(false)} />
      </Dialog>
    </div>
  );
};

export default AICalendarScheduler;