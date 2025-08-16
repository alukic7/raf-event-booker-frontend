type UserType = 'admin' | 'event_creator'

export type User = {
  id: number
  email: string
  firstName: string
  lastName: string
  type: UserType
}
