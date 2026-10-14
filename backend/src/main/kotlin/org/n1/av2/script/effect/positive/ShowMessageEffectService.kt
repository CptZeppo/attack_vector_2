package org.n1.av2.script.effect.positive

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.type.ScriptEffect
import org.springframework.stereotype.Service

/**
 * Linked type:
 * @see org.n1.av2.script.effect.ScriptEffectType.SHOW_MESSAGE
 */
@Service
class ShowMessageEffectService(
    private val connectionService: ConnectionService,
    private val i18n: I18n
) : ScriptEffectInterface {

    override val name = i18n.t("show-message.name")
    override val defaultValue = ""
    override val gmDescription = i18n.t("show-message.description-gm")

    override fun playerDescription(effect: ScriptEffect) = i18n.t("show-message.description-player")

    override fun validate(effect: ScriptEffect) = ScriptEffectInterface.validateNonEmptyText(i18n, effect)

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        return ScriptExecution {
            connectionService.replyTerminalReceive(effect.value!!)
        }
    }

}
