package org.n1.av2.script.effect.positive.ice

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.ice.common.IceLayer
import org.n1.av2.layer.ice.sweeper.SweeperIceStatusRepo
import org.n1.av2.layer.ice.sweeper.SweeperService
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.iam.user.CurrentUserService
import org.n1.av2.run.local.MessageService
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.effect.helper.IceEffectHelper
import org.n1.av2.script.type.ScriptEffect
import org.n1.av2.site.entity.enums.LayerType
import org.springframework.stereotype.Service


/**
 * Linked type:
 * @see org.n1.av2.script.effect.ScriptEffectType.SWEEPER_UNBLOCK
 */
@Service
class SweeperUnblockEffectService(
    private val iceEffectHelper: IceEffectHelper,
    private val sweeperIceStatusRepo: SweeperIceStatusRepo,
    private val currentUserService: CurrentUserService,
    private val sweeperService: SweeperService,
    private val connectionService: ConnectionService,
    private val messageService: MessageService
) : ScriptEffectInterface {


    override val name = messageService.getMessage("script.effect.ice.sweeper.name")
    override val defaultValue = ""
    override val gmDescription = messageService.getMessage("script.effect.ice.sweeper.description.gm")

    override fun playerDescription(effect: ScriptEffect) = messageService.getMessage("script.effect.ice.sweeper.description.player")

    override fun validate(effect: ScriptEffect) = null

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        return iceEffectHelper.runForSpecificIceType(LayerType.SWEEPER_ICE, argumentTokens, hackerState) { layer: IceLayer ->
            ScriptExecution {
                val iceStatus = sweeperIceStatusRepo.findByLayerId(layer.id) ?: error(messageService.getMessage("script.effect.ice.sweeper.error", layer.id))
                sweeperService.unblockHacker(iceStatus, currentUserService.userId)
                connectionService.replyTerminalReceive(messageService.getMessage("script.effect.ice.sweeper.execution"))
            }
        }
    }
}
