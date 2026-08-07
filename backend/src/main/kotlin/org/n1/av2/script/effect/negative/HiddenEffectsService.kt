package org.n1.av2.script.effect.negative

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.run.local.MessageService
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
    private val messageService: MessageService
) : ScriptEffectInterface {

    override val name = messageService.getMessage("script.effect.hidden.name")
    override val defaultValue = ""
    override val gmDescription = messageService.getMessage("script.effect.hidden.description.gm")

    override fun playerDescription(effect: ScriptEffect) = messageService.getMessage("script.effect.hidden.description.player")

    override fun validate(effect: ScriptEffect) = null

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning) = ScriptExecution {}
}
