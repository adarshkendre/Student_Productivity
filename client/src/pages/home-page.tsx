import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import GoalForm from "@/components/goals/goal-form";
import GoalList from "@/components/goals/goal-list";
import LearningForm from "@/components/learning/learning-form";
import LearningList from "@/components/learning/learning-list";
import ScheduleGenerator from "@/components/schedule/schedule-generator";
import ScheduleList from "@/components/schedule/schedule-list";
import CalendarView from "@/components/calendar/calendar-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student Progress Tracker</h1>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <p className="font-medium">{user?.username}</p>
                  <p className="text-sm text-muted-foreground">
                    Wake up: {user?.wakeUpTime}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sleep: {user?.sleepTime}
                  </p>
                </div>
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="calendar">
          <TabsList className="mb-8">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="learnings">Daily Learnings</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>

          <TabsContent value="goals" className="space-y-8">
            <GoalForm />
            <GoalList />
          </TabsContent>

          <TabsContent value="learnings" className="space-y-8">
            <LearningForm />
            <LearningList />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-8">
            <ScheduleGenerator />
            <ScheduleList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}