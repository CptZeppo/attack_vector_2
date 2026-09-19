package org.n1.av2.script.effect.positive

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.other.tripwire.TripwireLayer
import org.n1.av2.platform.util.toDuration
import org.n1.av2.platform.util.toHumanTime
import org.n1.av2.run.local.MessageService
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
    private val messageService: MessageService
    ) : ScriptEffectInterface {

    override val name =  messageService.getMessage("script.effect.delay.name")
    override val defaultValue = "00:01:00"

    override val gmDescription = messageService.getMessage("script.effect.delay.description.gm")

    override fun playerDescription(effect: ScriptEffect) = messageService.getMessage("script.effect.delay.description.playe", toHumanTime(effect.value!!))

    override fun validate(effect: ScriptEffect) = ScriptEffectInterface.validateDuration(messageService, effect)

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        scriptEffectHelper.checkInNode(hackerState)?.let { return ScriptExecution(it) }

        val node = nodeEntityService.getById(hackerState.currentNodeId!!)
        val tripwireLayers = node.layers.filterIsInstance<TripwireLayer>()
        if (tripwireLayers.isEmpty()) {
            return ScriptExecution(messageService.getMessage("script.effect.delay.error.noTripwire"))
        }

        val timers = tripwireLayers.mapNotNull { layer -> timerEntityService.findByLayer(layer.id) }
        if (timers.isEmpty()) {
            return ScriptExecution(messageService.getMessage("script.effect.delay.error.noTripwireActive"))
        }

        return ScriptExecution {
            tripwireLayers.forEach { layer ->
                val timer = timerEntityService.findByLayer(layer.id) ?: error(messageService.getMessage("script.effect.delay.error.noCountdown", layer.id))
                timerService.delayTripwireTimer(timer, effect.value!!.toDuration())
            }
        }
    }
}
