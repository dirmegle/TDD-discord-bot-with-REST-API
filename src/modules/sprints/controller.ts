import { StatusCodes } from 'http-status-codes'
import { Router } from 'express'
import { Database } from '@/database'
import buildRepository from './repository'
import { jsonRoute } from '@/utils/middleware'
import * as schema from './schema'
import BadRequest from '@/utils/errors/BadRequest'
import NotFound from '@/utils/errors/NotFound'

export default (db: Database) => {
  const router = Router()
  const sprints = buildRepository(db)

  router
    .route('/')
    .get(jsonRoute(async () => sprints.findAll(), StatusCodes.OK))
    .post(
      jsonRoute(async (req) => {
        const body = schema.parseInsertable(req.body)
        const isCodeExisting = await sprints.findByCode(body.sprintCode)

        if (isCodeExisting) {
          throw new BadRequest('Sprint with this code already exists')
        }

        return sprints.create(body)
      }, StatusCodes.CREATED)
    )

  router
    .route('/:id')
    .get(
      jsonRoute(async (req) => {
        const id = schema.parseId(req.params.id)
        const sprint = await sprints.findById(id)
        if (!sprint) {
          throw new NotFound('Sprint with this id does not exist')
        }
        return sprint
      }, StatusCodes.OK)
    )
    .patch(
      jsonRoute(async (req) => {
        const id = schema.parseId(req.params.id)
        const updatedBody = schema.parseUpdateable(req.body)

        const isCodeExisting = updatedBody.sprintCode
          ? await sprints.findByCode(updatedBody.sprintCode)
          : undefined

        if (isCodeExisting) {
          throw new BadRequest('Sprint with this code already exists')
        }

        const sprint = await sprints.update(id, updatedBody)

        if (!sprint) {
          throw new NotFound('Sprint with this id does not exist')
        }

        return sprint
      }, StatusCodes.OK)
    )
    .delete(
      jsonRoute(async (req) => {
        const id = schema.parseId(req.params.id)
        const sprint = await sprints.remove(id)

        if (!sprint) {
          throw new NotFound('Sprint with this id does not exist')
        }
      }, StatusCodes.NO_CONTENT)
    )

  return router
}
