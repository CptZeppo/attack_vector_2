package org.n1.av2.script.effect.positive.ice

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.ice.common.IceService
import org.n1.av2.run.local.MessageService
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.effect.helper.IceEffectHelper
import org.n1.av2.script.type.ScriptEffect
import org.n1.av2.site.entity.enums.LayerType
import org.springframework.stereotype.Service

/**
 * Linked type:
 * @see org.n1.av2.script.effect.ScriptEffectType.AUTO_HACK_ICE_TYPE
 */
@Service
class AutoHackIceTypeEffectService(
    private val iceEffectHelper: IceEffectHelper,
    private val iceService: IceService,
    private val messageService: MessageService
) : ScriptEffectInterface {

    override val name = messageService.getMessage("script.effect.ice.type.name")
    override val defaultValue = "WORD_SEARCH_ICE"
    override val gmDescription = messageService.getMessage("script.effect.ice.type.description.gm")

    override fun playerDescription(effect: ScriptEffect): String {
        val layerType = LayerType.valueOf(effect.value!!)
        return messageService.getMessage("script.effect.ice.type.description.player", iceService.helpfulNameFor(layerType))
    }

    override fun validate(effect: ScriptEffect): String? {
        if (effect.value == null) return messageService.getMessage("script.effect.ice.type.error.required")
        try {
            LayerType.valueOf(effect.value)
            return null
        }
        catch (_: IllegalArgumentException) {
            return messageService.getMessage("script.effect.ice.type.error.invalid")
        }
    }

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        val iceType = LayerType.valueOf(effect.value!!)
        return iceEffectHelper.autoHackSpecificIceType(iceType, argumentTokens, hackerState)
    }
}
