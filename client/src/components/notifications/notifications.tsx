import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bell } from 'lucide-react';

const Notifications = () => {
  // You can replace this with actual notification data from your backend
  const notifications = [
    {
      id: 1,
      title: 'New Message',
      description: 'You have received a new message from John Doe',
      time: '5 minutes ago',
      read: false
    },
    {
      id: 2,
      title: 'System Update',
      description: 'The system has been updated successfully',
      time: '1 hour ago',
      read: true
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Notifications</h2>
      </div>
      
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No notifications to display
          </CardContent>
        </Card>
      ) : (
        notifications.map(notification => (
          <Card 
            key={notification.id} 
            className={notification.read ? 'bg-muted' : 'bg-background'}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {notification.time}
                </span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default Notifications;
