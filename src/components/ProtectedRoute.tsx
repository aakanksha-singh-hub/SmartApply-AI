import React from 'react'
import { Navigate } from 'react-router-dom'
import { getToken, getUser } from '@/utility/helper'

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const token = getToken()
    if (!token) return <Navigate to="/signin" replace />
    return children
}

export const AdminRoute = ({ children }: { children: JSX.Element }) => {
    const user = getUser()
    // allow only users explicitly marked as Admin in the DB
    if (!user || user.accessLevel !== 'Admin') {
        return <Navigate to="/signin" replace />
    }
    return children
}

export default ProtectedRoute
