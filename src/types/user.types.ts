type UserType = 'admin' | 'event_creator'
type UserStatus = 'active' | 'inactive'

export type User = {
  id: number
  email: string
  firstName: string
  lastName: string
  type: UserType
  status: UserStatus
}
