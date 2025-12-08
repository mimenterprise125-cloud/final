/**
 * Helper function to set a user as admin
 * This uses the Supabase admin API capabilities
 * 
 * Usage:
 * import { setUserAsAdmin } from '@/lib/admin-utils'
 * await setUserAsAdmin('ff57a6aa-6661-417b-a59f-5949fec6fc70')
 */

import { supabase } from './supabase'

/**
 * Set a user as admin by their UID
 * Requires admin access to Supabase project
 */
export async function setUserAsAdmin(userId: string) {
  try {
    // Option 1: Using Supabase REST API with admin key
    // This is the recommended approach
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users/${userId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          user_metadata: {
            role: 'admin',
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to set admin role: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('User set as admin:', data)
    return data
  } catch (error) {
    console.error('Error setting admin role:', error)
    throw error
  }
}

/**
 * Remove admin role from a user
 */
export async function removeAdminRole(userId: string) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users/${userId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          user_metadata: {
            role: 'user',
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to remove admin role: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Admin role removed:', data)
    return data
  } catch (error) {
    console.error('Error removing admin role:', error)
    throw error
  }
}

/**
 * Check if a user is admin
 */
export function isUserAdmin(userMetadata: any): boolean {
  return userMetadata?.role === 'admin'
}

/**
 * Get admin status for current user
 */
export async function getCurrentUserAdminStatus() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error

    return isUserAdmin(user?.user_metadata)
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}
