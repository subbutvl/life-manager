export interface TrackableItem {
  id: string
  module: string
  title: string
  dueDate: string
  recurrence?: string
  status: 'pending' | 'done'
  notes?: string
}
