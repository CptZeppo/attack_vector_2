package org.n1.av2.script.effect.positive.ice

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.ice.common.IceLayer
import org.n1.av2.run.local.MessageService
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.effect.helper.IceEffectHelper
import org.n1.av2.script.type.ScriptEffect
import org.springframework.stereotype.Service

/**
 * Linked type:
 * @see org.n1.av2.script.effect.ScriptEffectType.AUTO_HACK_ANY_ICE
 */
@Service
class AutoHackAnyIceEffectService(
    private val iceEffectHelper: IceEffectHelper,
    private val messageService: MessageService
) : ScriptEffectInterface {

    override val name = messageService.getMessage("script.effect.ice.any.name")
    override val defaultValue = null
    override val gmDescription = messageService.getMessage("script.effect.ice.any.description")

    override fun playerDescription(effect: ScriptEffect): String {
        return messageService.getMessage("script.effect.ice.any.description")
    }

    override fun validate(effect: ScriptEffect) = null

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        val layerDescription = messageService.getMessage("script.effect.ice.any.execution")
        return iceEffectHelper.runForIceType(IceLayer::class, layerDescription, argumentTokens, hackerState) { layer: IceLayer ->
            iceEffectHelper.autoHack(layer, hackerState)
        }
    }

}
