package org.n1.av2.script.effect.positive.ice

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.Layer
import org.n1.av2.layer.ice.common.IceLayer
import org.n1.av2.layer.ice.common.IceService
import org.n1.av2.layer.ice.netwalk.NetwalkIceLayer
import org.n1.av2.layer.ice.sweeper.SweeperIceLayer
import org.n1.av2.layer.ice.tangle.TangleIceLayer
import org.n1.av2.layer.ice.wordsearch.WordSearchIceLayer
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.run.local.MessageService
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.effect.helper.ScriptEffectHelper
import org.n1.av2.script.type.ScriptEffect
import org.n1.av2.site.entity.ThemeService
import org.n1.av2.site.entity.enums.LayerType.*
import org.springframework.stereotype.Service

/**
 * Linked type:
 * @see org.n1.av2.script.effect.ScriptEffectType.ROTATE_ICE
 */
@Service
class RotateIceEffectService(
    private val scriptEffectHelper: ScriptEffectHelper,
    private val iceService: IceService,
    private val connectionService: ConnectionService,
    private val themeService: ThemeService,
    private val messageService: MessageService
) : ScriptEffectInterface {

    override val name = messageService.getMessage("script.effect.ice.rotate.name")
    override val defaultValue = null
    override val gmDescription = messageService.getMessage("script.effect.ice.rotate.description")

    override fun playerDescription(effect: ScriptEffect) = gmDescription

    override fun validate(effect: ScriptEffect) = null

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        val runOnLayerResult = scriptEffectHelper.runOnLayer(argumentTokens, hackerState)
        runOnLayerResult.errorExecution?.let { return it }
        val iceLayer = checkNotNull(runOnLayerResult.layer) as IceLayer
        val node = checkNotNull(runOnLayerResult.node)
        checkIceLayer(iceLayer)?.let { return ScriptExecution(it) }
        return ScriptExecution {
            val rotatedIceLayer = createRotatedIceLayer(iceLayer)

            iceService.changeIce(node, iceLayer, rotatedIceLayer)

            val newName = iceService.formalNameFor(rotatedIceLayer.type)
            connectionService.replyTerminalReceive(messageService.getMessage("script.effect.ice.rotate.execute", newName))
        }
    }

    private fun createRotatedIceLayer(layer: IceLayer): IceLayer {
        val newType = when (layer) {
            is WordSearchIceLayer -> TANGLE_ICE
            is TangleIceLayer -> NETWALK_ICE
            is NetwalkIceLayer -> SWEEPER_ICE
            is SweeperIceLayer -> WORD_SEARCH_ICE

            else -> error(messageService.getMessage("script.effect.ice.rotate.error.unsuported", layer))
        }
        val newName = themeService.themeName(newType)

        val newLayer = iceService.createIceLayer(layer, newType, layer.strength, newName)
        return newLayer
    }

    private fun checkIceLayer(layer: Layer): String? {
        if (layer !is IceLayer) return messageService.getMessage("script.effect.ice.rotate.error.layer")

        if (layer !is WordSearchIceLayer &&
            layer !is TangleIceLayer &&
            layer !is NetwalkIceLayer &&
            layer !is SweeperIceLayer
        ) {
            return messageService.getMessage("script.effect.ice.rotate.error.type")
        }

        if (layer.hacked) return messageService.getMessage("script.effect.ice.rotate.error.hacked")

        return null
    }

}
