package org.n1.av2.script.effect.positive

import org.n1.av2.hacker.hackerstate.HackerActivity
import org.n1.av2.hacker.hackerstate.HackerState
import org.n1.av2.hacker.hackerstate.HackerStateRepo
import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.platform.iam.user.UserEntityService
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
    private val i18n: I18n,
) : ScriptEffectInterface {

    override val name = i18n.t("jump-to-hacker.name")
    override val defaultValue = JumpBlockedType.BLOCKED_BY_ICE.name
    override val gmDescription = i18n.t("jump-to-hacker.description-gm")

    override fun playerDescription(effect: ScriptEffect): String {
        val suffix =
            if (effect.value == JumpBlockedType.BLOCKED_BY_ICE.name) i18n.t("description.description-player-blocked") else i18n.t("jump-to-hacker.description-player")
        return gmDescription + suffix
    }

    override fun validate(effect: ScriptEffect) = JumpEffectHelper.validateJumpBlockedType(effect)

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        scriptEffectHelper.checkInNode(hackerState)?.let { return ScriptExecution(it) }
        val userName = argumentTokens.firstOrNull() ?: return ScriptExecution(i18n.t("jump-effect.missing-username"))

        val user = userEntityService.findByNameIgnoreCase(userName)
        if (user == null) {
            return ScriptExecution(i18n.t("social.hacker-not-found", userName))
        }

        val targetHackerRunState: HackerState =
            hackerStateRepo.findById(user.id).orElse(null) ?: return ScriptExecution(i18n.t("jump-effect.not-in-run", userName))
        if (targetHackerRunState.runId != hackerState.runId) return ScriptExecution(i18n.t("jump-effect.not-in-run", userName))
        if (targetHackerRunState.activity != HackerActivity.INSIDE) return ScriptExecution(i18n.t("jump-effect.not-in-site", userName))

        val currentNodeId = hackerState.currentNodeId ?: error(i18n.t("jump-to-hacker.current-node-not-found"))
        val targetNodeId = targetHackerRunState.currentNodeId ?: error(i18n.t("jump-to-hacker.target-node-not-found"))

        return jumpEffectHelper.jump(effect, hackerState.siteId, currentNodeId, targetNodeId, hackerState, userName)

    }
}
