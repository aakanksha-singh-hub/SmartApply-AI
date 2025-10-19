import React from 'react'
import { getUser } from '@/utility/helper'

const AdminDashboard = () => {
    const user = getUser()
    return (
        <div className="p-6">
            <h1 className="text-2xl">Admin Dashboard</h1>
            <p>Welcome, {user?.username ?? 'admin'} — this is a placeholder page for administrators.</p>
        </div>
    )
}

export default AdminDashboard
