package org.n1.av2.script.effect.positive.ice

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.ice.common.IceLayer
import org.n1.av2.layer.ice.sweeper.SweeperIceStatusRepo
import org.n1.av2.layer.ice.sweeper.SweeperService
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.platform.iam.user.CurrentUserService
import org.n1.av2.script.effect.SCRIPT_CANNOT_INSTANTIATE_ICE_KEY
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
    private val i18n: I18n,
) : ScriptEffectInterface {


    override val name = i18n.t("sweeper-unblock.name")
    override val defaultValue = ""
    override val gmDescription = i18n.t("sweeper-unblock.description-gm")

    override fun playerDescription(effect: ScriptEffect) = i18n.t("sweeper-unblock.description-player")

    override fun validate(effect: ScriptEffect) = null

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        return iceEffectHelper.runForSpecificIceType(LayerType.SWEEPER_ICE, argumentTokens, hackerState) { layer: IceLayer ->
            ScriptExecution {
                val iceStatus = sweeperIceStatusRepo.findByLayerId(layer.id) ?: error(i18n.t(SCRIPT_CANNOT_INSTANTIATE_ICE_KEY, layer.id))
                sweeperService.unblockHacker(iceStatus, currentUserService.userId)
                connectionService.replyTerminalReceive(i18n.t("script-effect.hacker-unblocked"))
            }
        }
    }
}
