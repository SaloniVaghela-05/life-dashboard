import { createClient } from '@/lib/supabase/server'

export async function generateInsights(userId: string) {
  const supabase = await createClient()
  const insights = []

  // Analyze spending patterns
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .gte('expense_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  if (expenses && expenses.length > 0) {
    // Find highest spending category
    const categoryTotals = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
      return acc
    }, {} as Record<string, number>)

    const topCategory = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0] as [string, number]

    insights.push({
      type: 'spending',
      title: 'Top Spending Category',
      description: `You spent $${topCategory[1].toFixed(2)} on ${topCategory[0]} this month`,
      data: { category: topCategory[0], amount: topCategory[1] }
    })
  }

  // Analyze habit consistency
  const { data: habitLogs } = await supabase
    .from('habit_logs')
    .select('*, habits(*)')
    .eq('user_id', userId)
    .gte('completed_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  if (habitLogs) {
    const completionRate = (habitLogs.length / 7) * 100
    insights.push({
      type: 'habits',
      title: 'Weekly Habit Performance',
      description: `Your habit completion rate is ${completionRate.toFixed(0)}% this week`,
      data: { rate: completionRate }
    })
  }

  // Save insights to database
  if (insights.length > 0) {
    await supabase.from('insights').insert(
      insights.map(insight => ({
        ...insight,
        user_id: userId,
        is_read: false
      }))
    )
  }

  return insights
}
