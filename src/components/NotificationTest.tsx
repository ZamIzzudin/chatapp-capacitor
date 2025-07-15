import { useState } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Bell, TestTube } from 'lucide-react';

export default function NotificationTest() {
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  const testNotification = async () => {
    setIsTestingNotification(true);
    try {
      // Request permissions first
      const permission = await LocalNotifications.requestPermissions();
      console.log('Notification permission:', permission);

      if (permission.display === 'granted') {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'Test Notification',
              body: 'This is a test notification from ChatApp',
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 1000) },
              sound: 'default',
              attachments: undefined,
              actionTypeId: '',
              extra: {
                test: true,
              },
            },
          ],
        });
        console.log('Test notification scheduled');
      } else {
        console.log('Notification permission denied');
        alert('Notification permission denied. Please enable notifications in settings.');
      }
    } catch (error) {
      console.error('Failed to test notification:', error);
      alert('Failed to test notification: ' + error);
    } finally {
      setIsTestingNotification(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={testNotification}
        disabled={isTestingNotification}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white p-3 rounded-full shadow-lg transition-colors flex items-center gap-2"
        title="Test Notification"
      >
        {isTestingNotification ? (
          <TestTube className="w-5 h-5 animate-spin" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}