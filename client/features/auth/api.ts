import { apiClient } from '@/lib/api/client'
import type {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
  SendOtpCredentials,
  SendOtpResponse,
  User,
  VerifyOtpCredentials,
  VerifyOtpResponse,
} from './types'
import { getAuthError } from './auth-error'


export const register = async (
  data: RegisterCredentials
): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>(
      '/user/register',
      data
    )

    return response.data
  } catch (error) {
    throw getAuthError(error)
  }
}

export const sendOtp = async (
  data: SendOtpCredentials
): Promise<SendOtpResponse> => {
  try {
    const response = await apiClient.post<SendOtpResponse>(
      'auth/send-otp',
      data
    )

    return response.data
  } catch (error) {
    throw getAuthError(error)
  }
}

export const verifyOtp = async (
  data: VerifyOtpCredentials
): Promise<VerifyOtpResponse> => {
  try {
    const response = await apiClient.post<VerifyOtpResponse>(
      'auth/verify-otp',
      data
    )

    return response.data
  } catch (error) {
    throw getAuthError(error)
  }
}





export const login = async (
  data: LoginCredentials
): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>(
      '/user/login',
      data
    )

    return response.data
  } catch (error) {
    throw getAuthError(error)
  }
}

export const getUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>('/user')

    return response.data
  } catch (error) {
    throw getAuthError(error)
  }
}

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/user/logout')
  } catch (error) {
    throw getAuthError(error)
  }
}