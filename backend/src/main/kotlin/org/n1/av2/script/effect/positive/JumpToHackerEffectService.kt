package org.n1.av2.script.effect.positive

import org.n1.av2.hacker.hackerstate.HackerActivity
import org.n1.av2.hacker.hackerstate.HackerState
import org.n1.av2.hacker.hackerstate.HackerStateRepo
import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.platform.iam.user.UserEntityService
import org.n1.av2.run.local.MessageService
import org.n1.av2.run.terminal.generic.SocialTerminalService
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.effect.helper.JumpBlockedType
import org.n1.av2.script.effect.helper.JumpEffectHelper
import org.n1.av2.script.effect.helper.ScriptEffectHelper
import org.n1.av2.script.type.ScriptEffect
import org.springframework.stereotype.Service
/**
 * Linked type:
 * @see org.n1.av2.script.effect.ScriptEffectType.JUMP_TO_HACKER
 */
@Service
class JumpToHackerEffectService(
    private val scriptEffectHelper: ScriptEffectHelper,
    private val hackerStateRepo: HackerStateRepo,
    private val userEntityService: UserEntityService,
    private val jumpEffectHelper: JumpEffectHelper,
    private val messageService: MessageService
    ) : ScriptEffectInterface {

    override val name = messageService.getMessage("script.effect.jump.name")
    override val defaultValue = JumpBlockedType.BLOCKED_BY_ICE.name
    override val gmDescription = messageService.getMessage("script.effect.jump.description.gm")

    override fun playerDescription(effect: ScriptEffect): String{
        val suffix = if (effect.value == JumpBlockedType.BLOCKED_BY_ICE.name) messageService.getMessage("script.effect.jump.description.player.blocked") else messageService.getMessage("script.effect.jump.description.player")
        return gmDescription + suffix
    }

    override fun validate(effect: ScriptEffect) = JumpEffectHelper.validateJumpBlockedType(effect)

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        scriptEffectHelper.checkInNode(hackerState)?.let { return ScriptExecution(it) }
        val userName = argumentTokens.firstOrNull() ?: return ScriptExecution(messageService.getMessage("script.effect.jump.execute"))

        val user = userEntityService.findByNameIgnoreCase(userName)
        if (user == null) {
            return ScriptExecution(SocialTerminalService.hackerNotFound(userName, messageService))
        }

        val targetHackerRunState: HackerState = hackerStateRepo.findById(user.id).orElse(null) ?: return ScriptExecution(messageService.getMessage("script.effect.jump.error.notInRun", userName))
        if (targetHackerRunState.runId != hackerState.runId) return ScriptExecution(messageService.getMessage("script.effect.jump.error.notInRun", userName))
        if (targetHackerRunState.activity != HackerActivity.INSIDE) return ScriptExecution(messageService.getMessage("script.effect.jump.error.notInSite", userName))

        val currentNodeId = hackerState.currentNodeId ?: error(messageService.getMessage("script.effect.jump.error.currentNode"))
        val targetNodeId = targetHackerRunState.currentNodeId ?: error(messageService.getMessage("script.effect.jump.error.targetNode"))

        return jumpEffectHelper.jump(effect, hackerState.siteId, currentNodeId, targetNodeId, hackerState, userName)

    }
}
