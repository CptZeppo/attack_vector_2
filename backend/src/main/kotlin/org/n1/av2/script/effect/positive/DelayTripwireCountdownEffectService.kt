package org.n1.av2.script.effect.positive

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.other.tripwire.TripwireLayer
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.platform.util.toDuration
import org.n1.av2.platform.util.toHumanTime
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.effect.helper.ScriptEffectHelper
import org.n1.av2.script.type.ScriptEffect
import org.n1.av2.site.entity.NodeEntityService
import org.n1.av2.timer.TimerEntityService
import org.n1.av2.timer.TimerService
import org.springframework.stereotype.Service

/**
 * Linked type:
 * @see org.n1.av2.script.effect.ScriptEffectType.DELAY_TRIPWIRE_COUNTDOWN
 */
@Service
class DelayTripwireCountdownEffectService(
    private val nodeEntityService: NodeEntityService,
    private val timerService: TimerService,
    private val timerEntityService: TimerEntityService,
    private val scriptEffectHelper: ScriptEffectHelper,
    private val i18n: I18n
) : ScriptEffectInterface {

    override val name = i18n.t("delay-tripwire-countdown.name")
    override val defaultValue = "00:01:00"

    override val gmDescription = i18n.t("delay-tripwire-countdown.description-gm")

    override fun playerDescription(effect: ScriptEffect) = i18n.t("delay-tripwire-countdown.description-player", toHumanTime(effect.value!!))

    override fun validate(effect: ScriptEffect) = ScriptEffectInterface.validateDuration(i18n, effect)

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        scriptEffectHelper.checkInNode(hackerState)?.let { return ScriptExecution(it) }

        val node = nodeEntityService.getById(hackerState.currentNodeId!!)
        val tripwireLayers = node.layers.filterIsInstance<TripwireLayer>()
        if (tripwireLayers.isEmpty()) {
            return ScriptExecution(i18n.t("delay-tripwire-countdown.no-tripwire"))
        }

        val timers = tripwireLayers.mapNotNull { layer -> timerEntityService.findByLayer(layer.id) }
        if (timers.isEmpty()) {
            return ScriptExecution(i18n.t("delay-tripwire-countdown.no-active-tripwire"))
        }

        return ScriptExecution {
            tripwireLayers.forEach { layer ->
                val timer = timerEntityService.findByLayer(layer.id) ?: error(i18n.t("delay-tripwire-countdown.no-countdown", layer.id))
                timerService.delayTripwireTimer(timer, effect.value!!.toDuration())
            }
        }
    }
}
