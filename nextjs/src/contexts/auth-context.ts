import { createContext } from 'react'

export interface User {
    id: string
    email: string
    fullName: string
}

export interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string, fullName: string) => Promise<void>
    logout: () => Promise<void>
    refetch: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)