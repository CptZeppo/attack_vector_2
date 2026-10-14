package org.n1.av2.script.effect.positive.ice

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.Layer
import org.n1.av2.layer.ice.common.IceLayer
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.run.terminal.inside.CommandHackService
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.effect.helper.ScriptEffectHelper
import org.n1.av2.script.type.ScriptEffect
import org.n1.av2.site.entity.Node
import org.springframework.stereotype.Service

/**
 * Linked type:
 * @see org.n1.av2.script.effect.ScriptEffectType.HACK_BELOW_NON_HACKED_ICE
 */
@Service
class HackBelowNonHackedIceEffectService(
    private val scriptEffectHelper: ScriptEffectHelper,
    private val commandHackService: CommandHackService,
    private val connectionService: ConnectionService,
    private val i18n: I18n,
) : ScriptEffectInterface {

    override val name = i18n.t("hack-below-ice.name")
    override val defaultValue = null
    override val gmDescription = i18n.t("hack-below-ice.description")

    override fun playerDescription(effect: ScriptEffect) = gmDescription


    override fun validate(effect: ScriptEffect) = null

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        val runOnLayerResult = scriptEffectHelper.runOnLayer(argumentTokens, hackerState)
        runOnLayerResult.errorExecution?.let { return it }
        val layer = checkNotNull(runOnLayerResult.layer)
        val node = checkNotNull(runOnLayerResult.node)

        checkIfLayerActuallyBlocked(layer, node)?.let { return ScriptExecution(it) }

        return ScriptExecution {
            connectionService.replyTerminalReceive(i18n.t("script-effect.executing-hack-through-ice"), "")
            commandHackService.handleHack(layer, hackerState)
        }
    }

    private fun checkIfLayerActuallyBlocked(layer: Layer, node: Node): String? {
        val layersAboveLayerToHack = node.layers
            .sortedBy { it.level }
            .reversed()
            .dropLast(layer.level + 1)

        if (layersAboveLayerToHack.filterIsInstance<IceLayer>().any { !it.hacked }) {
            return null
        }
        return i18n.t("script-effect.no-ice-above")

    }

}
