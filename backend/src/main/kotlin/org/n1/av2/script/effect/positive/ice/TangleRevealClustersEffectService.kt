package org.n1.av2.script.effect.positive.ice

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.ice.common.IceLayer
import org.n1.av2.layer.ice.tangle.TangleIceStatusRepo
import org.n1.av2.layer.ice.tangle.TangleService
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.run.local.MessageService
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.effect.helper.IceEffectHelper
import org.n1.av2.script.type.ScriptEffect
import org.n1.av2.site.entity.enums.LayerType
import org.springframework.stereotype.Service


/**
 * Linked type:
 * @see org.n1.av2.script.effect.ScriptEffectType.TANGLE_REVEAL_CLUSTERS
 */
@Service
class TangleRevealClustersEffectService(
    private val iceEffectHelper: IceEffectHelper,
    private val connectionService: ConnectionService,
    private val tangleIceStatusRepo: TangleIceStatusRepo,
    private val tangleService: TangleService,
    private val messageService: MessageService,
) : ScriptEffectInterface {


    override val name = messageService.getMessage("script.effect.ice.tangle.name")
    override val defaultValue = ""
    override val gmDescription = messageService.getMessage("script.effect.ice.tangle.description.gm")

    override fun playerDescription(effect: ScriptEffect) = messageService.getMessage("script.effect.ice.tangle.description.player")

    override fun validate(effect: ScriptEffect) = null

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        return iceEffectHelper.runForSpecificIceType(LayerType.TANGLE_ICE, argumentTokens, hackerState) { layer: IceLayer ->
            ScriptExecution {
                val iceStatus = tangleIceStatusRepo.findByLayerId(layer.id) ?: error(messageService.getMessage("script.effect.ice.tangle.error", layer.id))
                tangleService.revealClusters(iceStatus)
                connectionService.replyTerminalReceive(messageService.getMessage("script.effect.ice.tangle.execution"))
            }
        }
    }
}
