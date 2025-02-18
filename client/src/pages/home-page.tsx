import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import LearningScheduleForm from "@/components/learning/learning-schedule-form";
import CalendarView from "@/components/calendar/calendar-view";
import ConceptValidation from "@/components/learning/concept-validation";
import Notifications from "@/components/notifications/notifications";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("schedule");

  const handleScheduleGenerated = () => {
    setActiveTab("calendar");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Learning Progress Tracker</h1>
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="schedule">Learning Schedule</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="validate">Concept Validation</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <LearningScheduleForm onScheduleGenerated={handleScheduleGenerated} />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>

          <TabsContent value="validate">
            <ConceptValidation />
          </TabsContent>

          <TabsContent value="notifications">
            <Notifications />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}