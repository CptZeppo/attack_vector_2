package org.n1.av2.script.effect.negative

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.platform.util.toDuration
import org.n1.av2.platform.util.toHumanTime
import org.n1.av2.run.local.MessageService
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.effect.helper.ScriptEffectHelper
import org.n1.av2.script.type.ScriptEffect
import org.n1.av2.timer.TimerEntityService
import org.n1.av2.timer.TimerLabel
import org.n1.av2.timer.TimerService
import org.springframework.stereotype.Service
import java.time.Duration

/**
 * Linked type:
 * @see org.n1.av2.script.effect.ScriptEffectType.START_RESET_TIMER
 */
@Service
class StartResetTimerEffectService(
    private val scriptEffectHelper: ScriptEffectHelper,
    private val timerEntityService: TimerEntityService,
    private val timerService: TimerService,
    private val messageService: MessageService,
) : ScriptEffectInterface {

    override val name = messageService.getMessage("script.effect.startReset.name")
    override val defaultValue = "00:15:00"
    override val gmDescription = messageService.getMessage("script.effect.startReset.description.gm")

    override fun playerDescription(effect: ScriptEffect) = messageService.getMessage("script.effect.startReset.description.player", toHumanTime(effect.value!!))

    override fun validate(effect: ScriptEffect) = ScriptEffectInterface.validateDuration(effect)

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        scriptEffectHelper.checkAtNonShutdownSite(hackerState)?.let { return ScriptExecution(it) }

        return ScriptExecution {
            execute(effect, hackerState)
        }
    }

    fun execute(effect: ScriptEffect, hackerState: HackerStateRunning) {
        val siteId = hackerState.siteId
        val siteTimers = timerEntityService.findByTargetSiteId(siteId)
        val hasScriptSiteShutdown = siteTimers.any { it.label == TimerLabel.SCRIPT_SITE_SHUTDOWN }
        if (hasScriptSiteShutdown) {
            // there is already a timer, do not start a second one.
            return
        }

        val shutdownDuration = Duration.ofMinutes(2)

        timerService.startShutdownTimer(siteId, siteId, null, effect.value!!.toDuration(), false, shutdownDuration, "Script", TimerLabel.SCRIPT_SITE_SHUTDOWN)
    }
}
