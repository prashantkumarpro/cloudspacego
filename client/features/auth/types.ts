export interface LoginResponse {
  message: string
}

export interface LoginCredentials {
  email: string,
  password: string
}

export interface RegisterCredentials {
  name: string,
  email: string,
  password: string,
  otp: string
}

export interface RegisterResponse {
  message: string
}

export interface User {
  name: string,
  email: string
}


export type SendOtpCredentials = {
  email: string
}

export type SendOtpResponse = {
  message: string
}

export type VerifyOtpCredentials = {
  email: string
  otp: string
}

export type VerifyOtpResponse = {
  message: string
}