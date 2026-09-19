package org.n1.av2.script.effect.positive

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.other.script.ScriptInteractionLayer
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.run.local.MessageService
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.effect.helper.ScriptEffectHelper
import org.n1.av2.script.effect.scriptCannotInteractWithThisLayer
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
    private val messageService: MessageService
    ) : ScriptEffectInterface {

    override val name = messageService.getMessage("script.effect.interact.name")
    override val defaultValue = ""
    override val gmDescription = messageService.getMessage("script.effect.interact.description.gm")

    override fun playerDescription(effect: ScriptEffect) = messageService.getMessage("script.effect.interact.description.player")

    override fun validate(effect: ScriptEffect) = ScriptEffectInterface.validateNonEmptyText(messageService, effect)

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        val runOnLayerResult = scriptEffectHelper.runOnLayer(argumentTokens, hackerState)
        runOnLayerResult.errorExecution?.let { return it }
        val layer = checkNotNull(runOnLayerResult.layer)

        if (layer !is ScriptInteractionLayer || !layer.interactionKey.equals(effect.value, ignoreCase = true)) {
            return ScriptExecution(messageService.getMessage(scriptCannotInteractWithThisLayer))
        }

        return ScriptExecution {
            connectionService.replyTerminalReceive( messageService.getMessageAsLines("script.effect.interact.execute", layer.message))
        }
    }

}
