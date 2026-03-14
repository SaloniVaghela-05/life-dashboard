import { render, screen, waitFor } from '@testing-library/react'
import { createClient } from '@/lib/supabase/client'
import DashboardPage from '@/app/dashboard/page'

jest.mock('@/lib/supabase/client')

describe('Dashboard', () => {
  it('displays user tasks', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user' } }
        })
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [{ id: '1', title: 'Test Task' }]
      })
    }
    
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    
    render(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument()
    })
  })
})
