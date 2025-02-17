import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import GoalForm from "@/components/goals/goal-form";
import GoalList from "@/components/goals/goal-list";
import LearningForm from "@/components/learning/learning-form";
import LearningList from "@/components/learning/learning-list";
import ScheduleGenerator from "@/components/schedule/schedule-generator";
import ScheduleList from "@/components/schedule/schedule-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student Progress Tracker</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.username}!</span>
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="goals">
          <TabsList className="mb-8">
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="learnings">Daily Learnings</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

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