import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Database, Sprint } from '@/database'
import { jsonRoute } from '@/utils/middleware'
import buildRepository from './repository'
import * as schema from './schema'
import postMessageToDiscord from './service'
import { getTemplateId } from './utils'
import BadRequest from '@/utils/errors/BadRequest'

export default (db: Database) => {
  const router = Router()
  const messages = buildRepository(db)

  router
    .route('/')
    .post(
      jsonRoute(async (req) => {
        const body = schema.parseRequested(req.body)
        const foundSprint = await messages.findSprintIdByCode(body.sprintCode)
        if (!foundSprint) {
          throw new BadRequest('Sprint does not exist')
        }

        const isMessageDuplicating = await messages.findBySprintIdAndUsername(
          foundSprint!.id,
          body.username
        )

        if (isMessageDuplicating) {
          throw new BadRequest(
            'Message for this sprint and user already exists'
          )
        }

        const templateId = await getTemplateId(
          body,
          messages.getRandomTemplateId()
        )

        const template = await messages.findTemplateById(templateId!)
        if (!template) {
          throw new BadRequest('Template with this id does not exist')
        }

        const message = schema.parseInsertable({
          sprintId: foundSprint!.id,
          templateId,
          username: body.username,
        })

        postMessageToDiscord(
          message,
          template?.message!,
          foundSprint as unknown as Sprint
        )

        return messages.create(message)
      }, StatusCodes.CREATED)
    )
    .get(
      jsonRoute(async (req) => {
        const sprintCode = req.query.sprint
          ? schema.parseSprintCode(req.query.sprint)
          : undefined
        const username = req.query.username
          ? schema.parseUsername(req.query.username)
          : undefined

        let queryToCall

        if (sprintCode && username) {
          queryToCall = messages.findAllByUsernameAndCode(username, sprintCode)
        } else if (sprintCode && !username) {
          queryToCall = messages.findAllBySprintCode(sprintCode)
        } else if (username && !sprintCode) {
          queryToCall = messages.findAllByUsername(username)
        } else {
          queryToCall = messages.findAll()
        }

        return queryToCall
      }, StatusCodes.OK)
    )

  return router
}
