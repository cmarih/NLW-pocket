import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import dayjs from 'dayjs'

// Marcar que a meta foi concluída

interface createGoalCompletionRequest {
  goalId: string
}

export async function createGoalCompletion({
  goalId,
}: createGoalCompletionRequest) {
  const firstDayOfWeek = dayjs().startOf('week').toDate() //Retorna o primeiro dia da semana
  const lastDayOfWeek = dayjs().endOf('week').toDate() //Retorna o ultimo dia da semana

  const goalCompletionCounts = db.$with('goal_completion_counts').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as('completionCount'),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek),
          eq(goalCompletions.goalId, goalId)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  const result = await db
    .with(goalCompletionCounts)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount: sql /*sql*/`
        COALESCE(${goalCompletionCounts.completionCount}, 0)`.mapWith(
        Number /*Convert strings em números -- "1" = 1 */
      ),
    })
    .from(goals)
    .leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goals.id))
    .where(eq(goals.id, goalId))
    .limit(1)

  const { completionCount, desiredWeeklyFrequency } = result[0]

  if (completionCount >= desiredWeeklyFrequency) {
    throw new Error(
      'Meta já foi concluída o número desejado de vezes essa semana!'
    )
  }
  const insertResult = await db
    .insert(goalCompletions)
    .values({ goalId })
    .returning()

  const goalCompletion = insertResult[0]

  return { goalCompletion }
}
