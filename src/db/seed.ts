import { client, db } from '.'
import { goalCompletions, goals } from './schema'
import dayjs from 'dayjs'

async function seed() {
  await db.delete(goalCompletions)
  await db.delete(goals)

  const result = await db
    .insert(goals)
    .values([
      { title: 'Beber 2L de água', desiredWeeklyFrequency: 7 },
      { title: 'Exercitar-se por 30 minutos', desiredWeeklyFrequency: 5 },
      { title: 'Ler 20 páginas de um livro', desiredWeeklyFrequency: 3 },
      { title: 'Meditar por 15 minutos', desiredWeeklyFrequency: 4 },
      { title: 'Estudar programação por 1 hora', desiredWeeklyFrequency: 2 },
    ])
    .returning()
  const startOfWeek = dayjs().startOf('week')

  await db.insert(goalCompletions).values([
    { goalId: result[0].id, createdAt: startOfWeek.toDate() },
    { goalId: result[1].id, createdAt: startOfWeek.add(1, 'day').toDate() },
  ])
}

seed().finally(() => client.end())
