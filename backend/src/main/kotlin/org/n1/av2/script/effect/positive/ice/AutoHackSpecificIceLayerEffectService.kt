package org.n1.av2.script.effect.positive.ice

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.ice.common.IceLayer
import org.n1.av2.run.local.MessageService
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.effect.helper.IceEffectHelper
import org.n1.av2.script.effect.helper.ScriptEffectHelper
import org.n1.av2.script.effect.scriptCannotInteractWithThisLayer
import org.n1.av2.script.type.ScriptEffect
import org.n1.av2.site.entity.NodeEntityService
import org.n1.av2.site.entity.SitePropertiesEntityService
import org.springframework.stereotype.Service

/**
 * Linked type:
 * @see org.n1.av2.script.effect.ScriptEffectType.AUTO_HACK_SPECIFIC_ICE_LAYER
 */
@Service
class AutoHackSpecificIceLayerEffectService(
    private val iceEffectHelper: IceEffectHelper,
    private val nodeEffectService: NodeEntityService,
    private val sitePropertiesEntityService: SitePropertiesEntityService,
    private val scriptEffectHelper: ScriptEffectHelper,
    private val messageService: MessageService
) : ScriptEffectInterface {

    override val name = messageService.getMessage("script.effect.ice.layer.name")
    override val defaultValue = "node-1234-5678:layer-1234"
    override val gmDescription = messageService.getMessage("script.effect.ice.layer.description.gm")

    override fun playerDescription(effect: ScriptEffect): String {
        return createPlayerDescription(effect) ?: messageService.getMessage("script.effect.ice.layer.description.player.broken")
    }

    private fun createPlayerDescription(effect: ScriptEffect): String? {
        try {
            val node = nodeEffectService.findByLayerId(effect.value!!)
            val site = sitePropertiesEntityService.getBySiteId(node.siteId)
            val layer = node.getLayerById(effect.value)
            if (layer !is IceLayer) error(messageService.getMessage("script.effect.ice.layer.description.player.error"))
            val nodeNetworkId = node.networkId

            return messageService.getMessage("script.effect.ice.layer.description.player", layer.level, nodeNetworkId, site.name)
        }
        catch (_: Exception) {
            return null
        }
    }

    override fun validate(effect: ScriptEffect): String? {
        createPlayerDescription(effect)?.let { return null }
        return messageService.getMessage("script.effect.ice.layer.validate")
    }

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        val runOnLayerResult = scriptEffectHelper.runOnLayer(argumentTokens, hackerState)
        runOnLayerResult.errorExecution?.let { return it }

        val layer = checkNotNull(runOnLayerResult.layer)
        if (layer.id != effect.value || layer !is IceLayer) {
            return ScriptExecution(messageService.getMessage(scriptCannotInteractWithThisLayer))
        }

        return iceEffectHelper.autoHack(layer, hackerState)
    }
}
