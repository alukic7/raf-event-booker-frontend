import axios from 'axios'
import { isAxiosAppError } from '../types/error.types'

export function handleError(err: unknown): string {
  if (isAxiosAppError(err)) {
    return err.response!.data.message
  }
  if (axios.isAxiosError(err)) {
    return err.message || 'Network error'
  }
  return 'Unknown error'
}
