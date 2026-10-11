package org.n1.av2.script.effect.negative

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.platform.util.toDuration
import org.n1.av2.platform.util.toHumanTime
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.effect.helper.ScriptEffectHelper
import org.n1.av2.script.type.ScriptEffect
import org.n1.av2.site.entity.SitePropertiesEntityService
import org.springframework.stereotype.Service
import java.time.Duration

/**
 * Linked type:
 * @see org.n1.av2.script.effect.ScriptEffectType.DECREASE_FUTURE_TIMERS
 */
@Service
class DecreaseFutureTimersEffectService(
    private val sitePropertiesEntityService: SitePropertiesEntityService,
    private val connectionService: ConnectionService,
    private val scriptEffectHelper: ScriptEffectHelper,
    private val i18n: I18n,
) : ScriptEffectInterface {

    override val name = i18n.t("decrease-timers.name")
    override val defaultValue = "00:01:00"
    override val gmDescription = i18n.t("decrease-timers.description-gm")

    override fun playerDescription(effect: ScriptEffect) = i18n.t("decrease-timers.description-player", toHumanTime(effect.value!!))

    override fun validate(effect: ScriptEffect) = ScriptEffectInterface.validateDuration(i18n, effect)

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        scriptEffectHelper.checkAtNonShutdownSite(hackerState)?.let { return ScriptExecution(it) }

        return ScriptExecution {
            val siteProperties = sitePropertiesEntityService.getBySiteId(hackerState.siteId)

            val scriptDurationChange = effect.value!!.toDuration()
            val currentAlertnessAdjustment: Duration = siteProperties.alertnessTimerAdjustment ?: Duration.ZERO
            val newAdjustment = currentAlertnessAdjustment - scriptDurationChange

            sitePropertiesEntityService.save(
                siteProperties.copy(
                    alertnessTimerAdjustment = newAdjustment
                )
            )
            connectionService.replyTerminalReceive(i18n.t("script-effect.alertness-increased", toHumanTime(effect.value)))
        }
    }
}
