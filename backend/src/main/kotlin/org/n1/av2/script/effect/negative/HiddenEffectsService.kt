package org.n1.av2.script.effect.negative

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.type.ScriptEffect
import org.springframework.stereotype.Service

/**
 * Linked type:
 * @see org.n1.av2.script.effect.ScriptEffectType.HIDDEN_EFFECTS
 */
@Service
class HiddenEffectsService(
    private val i18n: I18n
) : ScriptEffectInterface {

    override val name = i18n.t("hidden-effect.name")
    override val defaultValue = ""
    override val gmDescription = i18n.t("hidden-effect.description-gm")

    override fun playerDescription(effect: ScriptEffect) = i18n.t("hidden-effect.description-player")

    override fun validate(effect: ScriptEffect) = null

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning) = ScriptExecution {}
}
