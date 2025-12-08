import { useState } from 'react'
import { setUserAsAdmin, removeAdminRole } from '@/lib/admin-utils'

/**
 * Component to manage admin roles
 * Use this in your admin dashboard to set/remove admin roles for users
 */
export function AdminRoleManager() {
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const handleSetAdmin = async () => {
    if (!userId.trim()) {
      setMessage('Please enter a valid user ID')
      setMessageType('error')
      return
    }

    setLoading(true)
    try {
      await setUserAsAdmin(userId)
      setMessage(`✅ User ${userId} is now an admin!`)
      setMessageType('success')
      setUserId('')
    } catch (error) {
      setMessage(`❌ Failed to set admin role: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAdmin = async () => {
    if (!userId.trim()) {
      setMessage('Please enter a valid user ID')
      setMessageType('error')
      return
    }

    setLoading(true)
    try {
      await removeAdminRole(userId)
      setMessage(`✅ Admin role removed from user ${userId}`)
      setMessageType('success')
      setUserId('')
    } catch (error) {
      setMessage(`❌ Failed to remove admin role: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Manage Admin Roles</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">User ID (UID)</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g., ff57a6aa-6661-417b-a59f-5949fec6fc70"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            You can find the user ID in Supabase Authentication → Users
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSetAdmin}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Processing...' : 'Set as Admin'}
          </button>
          <button
            onClick={handleRemoveAdmin}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Processing...' : 'Remove Admin'}
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg ${
              messageType === 'success'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}
          >
            {message}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">Quick Setup</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Go to Supabase Dashboard → Authentication → Users</li>
          <li>Click on a user to open their details</li>
          <li>Copy their ID from the top</li>
          <li>Paste it above and click "Set as Admin"</li>
        </ol>
      </div>
    </div>
  )
}
