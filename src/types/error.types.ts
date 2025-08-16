import axios, { AxiosError } from 'axios'

export type AppError = {
  type: string
  status: number
  message: string
}

// Check if the error is of custom type
export function isAppError(err: unknown): err is AppError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    'message' in err &&
    typeof (err as any).status === 'number' &&
    typeof (err as any).message === 'string'
  )
}

export function isAxiosAppError(err: unknown): err is AxiosError<AppError> {
  return axios.isAxiosError(err) && isAppError(err.response?.data)
}
