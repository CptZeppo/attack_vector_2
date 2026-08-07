package org.n1.av2.run.terminal.inside.skillbased

import org.n1.av2.hacker.hackerstate.HackerActivity
import org.n1.av2.hacker.hackerstate.HackerStateEntityService
import org.n1.av2.hacker.hackerstate.HackerStateRepo
import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.hacker.skill.SkillService
import org.n1.av2.hacker.skill.SkillType
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.iam.user.CurrentUserService
import org.n1.av2.platform.iam.user.UserEntityService
import org.n1.av2.run.local.MessageService
import org.n1.av2.run.terminal.MISSING_SKILL_RESPONSE
import org.n1.av2.run.terminal.inside.CommandMoveService
import org.n1.av2.run.terminal.inside.InsideTerminalHelper
import org.springframework.stereotype.Service


const val USER_NOT_FOUND_IN_RUN = "command.jumpToHacker.error.userNotInRun"
@Service
class CommandJumpToHackerService(
    private val connectionService: ConnectionService,
    private val insideTerminalHelper: InsideTerminalHelper,
    private val skillService: SkillService,
    private val commandMoveService: CommandMoveService,
    private val userService: UserEntityService,
    private val hackerStateEntityService: HackerStateEntityService,
    private val hackerStateRepo: HackerStateRepo,
    private val currentUserService: CurrentUserService,
    private val messageService: MessageService,
) {

    fun processCommand(arguments: List<String>, hackerState: HackerStateRunning) {
        if (!skillService.currentUserHasSkill(SkillType.JUMP_TO_HACKER)) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines(MISSING_SKILL_RESPONSE))
            return
        }

        if (!insideTerminalHelper.verifyInside(hackerState)) return
        requireNotNull(hackerState.currentNodeId)

        if (arguments.isEmpty()) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.jumpToHacker.missing"))
            return
        }
        val userName = arguments.first()

        val targetUser = userService.findByNameIgnoreCase(userName)
        if (targetUser == null) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines(USER_NOT_FOUND_IN_RUN))
            return
        }

        val hackerStateForTarget = hackerStateEntityService.retrieveForUserId(targetUser.id)
        if (hackerStateForTarget.runId != hackerState.runId) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines(USER_NOT_FOUND_IN_RUN))
            return
        }

        if (hackerStateForTarget.activity != HackerActivity.INSIDE) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.jumpToHacker.error.userNotInside"))
            return
        }

        val targetNodeId = hackerStateForTarget.currentNodeId
        requireNotNull(targetNodeId)

        if (hackerState.currentNodeId == targetNodeId) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.jumpToHacker.error.sameNode"))
            return
        }

        connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.jumpToHacker.jump", targetUser.name))

        val newPosition = hackerState.toState().copy( currentNodeId = targetNodeId)
        hackerStateRepo.save(newPosition)

        commandMoveService.moveArrive(targetNodeId, currentUserService.userId, hackerState.runId)
    }

}
