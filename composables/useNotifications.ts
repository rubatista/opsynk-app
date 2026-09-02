export const useNotifications = () => {
  const notifications = useState('notifications-summary', () => ({
    newLeads: 0,
    maintenancesOverdue: 0,
    maintenancesUpcoming: 0,
    rentalsEnding: 0,
    bellCount: 0,
  }))

  const refreshNotifications = async () => {
    try {
      notifications.value = await useAuthFetch<any>('/api/notifications/summary')
    } catch {
      // ignore — badges just keep their last known value
    }
  }

  return { notifications, refreshNotifications }
}
