package org.n1.av2.script.effect.positive

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.other.script.ScriptInteractionLayer
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.script.effect.SCRIPT_CANNOT_INTERACT_KEY
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.effect.helper.ScriptEffectHelper
import org.n1.av2.script.type.ScriptEffect
import org.springframework.stereotype.Service

/**
 * Linked type:
 * @see org.n1.av2.script.effect.ScriptEffectType.INTERACT_WITH_SCRIPT_LAYER
 */
@Service
class InteractWithScriptLayerEffectService(
    private val connectionService: ConnectionService,
    private val scriptEffectHelper: ScriptEffectHelper,
    private val i18n: I18n,
) : ScriptEffectInterface {

    override val name = i18n.t("trigger-script-layer.name")
    override val defaultValue = ""
    override val gmDescription = i18n.t("trigger-script-layer.description-gm")

    override fun playerDescription(effect: ScriptEffect) = i18n.t("trigger-script-layer.description-player")

    override fun validate(effect: ScriptEffect) = ScriptEffectInterface.validateNonEmptyText(i18n, effect)

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        val runOnLayerResult = scriptEffectHelper.runOnLayer(argumentTokens, hackerState)
        runOnLayerResult.errorExecution?.let { return it }
        val layer = checkNotNull(runOnLayerResult.layer)

        if (layer !is ScriptInteractionLayer || !layer.interactionKey.equals(effect.value, ignoreCase = true)) {
            return ScriptExecution(i18n.t(SCRIPT_CANNOT_INTERACT_KEY))
        }

        return ScriptExecution {
            connectionService.replyTerminalReceive(i18n.t("script-effect.executing-on-layer"), "", layer.message)
        }
    }

}
