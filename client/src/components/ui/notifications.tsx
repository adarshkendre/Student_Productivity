
import { Bell } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";
import { useToast } from "@/hooks/use-toast";

export function Notifications() {
  const { toast } = useToast();

  const scheduleReminder = (goalId: number, title: string, date: Date) => {
    if (Notification.permission === "granted") {
      const timeDiff = date.getTime() - new Date().getTime();
      setTimeout(() => {
        new Notification(`Goal Reminder: ${title}`, {
          body: "Your goal deadline is approaching!",
        });
        toast({
          title: "Reminder Set",
          description: `You will be reminded about: ${title}`,
        });
      }, timeDiff);
    } else {
      Notification.requestPermission();
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5" />
        <h3 className="font-semibold">Notifications</h3>
      </div>
      <Button 
        variant="outline" 
        className="mt-2"
        onClick={() => Notification.requestPermission()}
      >
        Enable Notifications
      </Button>
    </Card>
  );
}
