import type { Category } from './category.types'
import type { Tag } from './tag.types'
import type { User } from './user.types'

export type Event = {
  id: number
  name: string
  description: string
  createdAt: string
  eventDate: string
  location: string
  views: number
  author: User
  tags: Tag[]
  category: Category
  maxParticipants?: number | null
}
