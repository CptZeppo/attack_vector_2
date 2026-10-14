package org.n1.av2.run.terminal.inside.skillbased

import org.n1.av2.hacker.hackerstate.HackerActivity
import org.n1.av2.hacker.hackerstate.HackerStateEntityService
import org.n1.av2.hacker.hackerstate.HackerStateRepo
import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.hacker.skill.SkillService
import org.n1.av2.hacker.skill.SkillType
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.platform.iam.user.CurrentUserService
import org.n1.av2.platform.iam.user.UserEntityService
import org.n1.av2.run.terminal.inside.CommandMoveService
import org.n1.av2.run.terminal.inside.InsideTerminalHelper
import org.springframework.stereotype.Service


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
    private val i18n: I18n,
) {

    fun processCommand(arguments: List<String>, hackerState: HackerStateRunning) {
        if (!skillService.currentUserHasSkill(SkillType.JUMP_TO_HACKER)) {
            connectionService.replyTerminalReceive(i18n.t("terminal.missing-skill"))
            return
        }

        if (!insideTerminalHelper.verifyInside(hackerState)) return
        requireNotNull(hackerState.currentNodeId)

        if (arguments.isEmpty()) {
            connectionService.replyTerminalReceive(i18n.t("jump.missing-username"))
            return
        }
        val userName = arguments.first()

        val targetUser = userService.findByNameIgnoreCase(userName)
        if (targetUser == null) {
            connectionService.replyTerminalReceive(i18n.t("jump.user-not-found"))
            return
        }

        val hackerStateForTarget = hackerStateEntityService.retrieveForUserId(targetUser.id)
        if (hackerStateForTarget.runId != hackerState.runId) {
            connectionService.replyTerminalReceive(i18n.t("jump.user-not-found"))
            return
        }

        if (hackerStateForTarget.activity != HackerActivity.INSIDE) {
            connectionService.replyTerminalReceive(i18n.t("jump.user-not-inside"))
            return
        }

        val targetNodeId = hackerStateForTarget.currentNodeId
        requireNotNull(targetNodeId)

        if (hackerState.currentNodeId == targetNodeId) {
            connectionService.replyTerminalReceive(i18n.t("jump.already-same-node"))
            return
        }

        connectionService.replyTerminalReceive(i18n.t("jump.jumping-to", targetUser.name))

        val newPosition = hackerState.toState().copy(currentNodeId = targetNodeId)
        hackerStateRepo.save(newPosition)

        commandMoveService.moveArrive(targetNodeId, currentUserService.userId, hackerState.runId)
    }

}
