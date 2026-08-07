package org.n1.av2.script.effect.negative

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.platform.util.toDuration
import org.n1.av2.platform.util.toHumanTime
import org.n1.av2.run.local.MessageService
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.effect.helper.ScriptEffectHelper
import org.n1.av2.script.type.ScriptEffect
import org.n1.av2.timer.TimerService
import org.springframework.stereotype.Service

/**
 * Linked type:
 * @see org.n1.av2.script.effect.ScriptEffectType.SPEED_UP_RESET_TIMER
 */
@Service
class SpeedUpResetTimerEffectService(
    private val scriptEffectHelper: ScriptEffectHelper,
    private val timerService: TimerService,
    private val messageService: MessageService
    ) : ScriptEffectInterface {

    override val name = messageService.getMessage("script.effect.speedUp.name")
    override val defaultValue = "00:05:00"
    override val gmDescription = messageService.getMessage("script.effect.speedUp.description.gm")

    override fun playerDescription(effect: ScriptEffect) = messageService.getMessage("script.effect.speedUp.description.player", toHumanTime(effect.value!!))

    override fun validate(effect: ScriptEffect) = ScriptEffectInterface.validateDuration(effect)

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        scriptEffectHelper.checkAtNonShutdownSite(hackerState)?.let { return ScriptExecution(it) }

        return ScriptExecution {
            timerService.speedUpScriptResetTimer(effect.value!!.toDuration(), hackerState.siteId)
        }
    }
}
