import type { Tag } from './tag.types'
import type { User } from './user.types'

export type Event = {
  id: number
  name: string
  description: string
  createdAt: string
  eventDate: string
  location: string
  author: User
  tags: Tag[]
  categoryId: number
  maxParticipants?: number | null
}
