import { createClient } from '@/lib/supabase/server'

export async function generateWeeklyReport(userId: string) {
  const supabase = createClient()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  //.select('*')
      .eq('user_id', userId)
      .gte('income_date', weekAgo.toISOString()),
    
    supabase
      .from('goals')
      .select('*, goal_milestones(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
  ])

  const report = {
    week_ending: new Date().toISOString(),
    tasks_completed: tasks.data?.filter(t => t.status === 'completed').length || 0,
    tasks_total: tasks.data?.length || 0,
    habits_completed: habits.data?.length || 0,
    total_spent: expenses.data?.reduce((sum, e) => sum + Number(e.amount), 0) || 0,
    total_earned: income.data?.reduce((sum, i) => sum + Number(i.amount), 0) || 0,
    goals_progress: goals.data?.map(g => ({
      title: g.title,
      progress: g.progress,
      milestones_completed: g.goal_milestones?.filter((m: any) => m.is_completed).length || 0
    })) || []
  }

  return report
}
