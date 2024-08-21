import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Database } from '@/database'
import { jsonRoute } from '@/utils/middleware'
import * as schema from './schema'
import buildRepository from './repository'
import BadRequest from '@/utils/errors/BadRequest'
import NotFound from '@/utils/errors/NotFound'

export default (db: Database) => {
  const router = Router()
  const templates = buildRepository(db)

  router
    .route('/')
    .get(jsonRoute(async () => templates.findAll(), StatusCodes.OK))
    .post(
      jsonRoute(async (req) => {
        const body = schema.parseInsertable(req.body)
        const isMessageExisting = await templates.findByMessage(body.message)
        if (isMessageExisting) {
          throw new BadRequest('Template with this message already exists')
        }

        return templates.create(body)
      }, StatusCodes.CREATED)
    )

  router
    .route('/:id')
    .get(
      jsonRoute(async (req) => {
        const id = schema.parseId(req.params.id)
        const template = await templates.findById(id)
        if (!template) {
          throw new NotFound('Template with this id does not exist')
        }
        return template
      }, StatusCodes.OK)
    )
    .patch(
      jsonRoute(async (req) => {
        const id = schema.parseId(req.params.id)
        const updatedBody = schema.parseUpdateable(req.body)

        const isMessageExisting = await templates.findByMessage(
          updatedBody.message
        )

        if (isMessageExisting) {
          throw new BadRequest('Template with this message already exists')
        }
        const template = await templates.update(id, updatedBody)

        if (!template) {
          throw new NotFound('Template with this id does not exist')
        }

        return template
      }, StatusCodes.OK)
    )
    .delete(
      jsonRoute(async (req) => {
        const id = schema.parseId(req.params.id)
        const template = await templates.remove(id)

        if (!template) {
          throw new NotFound('Template with this id does not exist')
        }
      }, StatusCodes.NO_CONTENT)
    )

  return router
}
