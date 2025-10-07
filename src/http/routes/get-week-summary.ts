import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { getWeekSummary } from '../../functions/get-week-summary'

export const getWeekSummaryRoute: FastifyPluginAsyncZod = async app => {
  // Rota para obter o resumo da semana, tarefas concluídas dentro de cada dia da semana.
  app.get('/summary', async () => {
    const { summary } = await getWeekSummary()

    return { summary }
  })
}
