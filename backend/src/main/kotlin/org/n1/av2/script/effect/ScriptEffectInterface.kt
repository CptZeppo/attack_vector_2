package org.n1.av2.script.effect

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.platform.util.validateDuration
import org.n1.av2.run.local.MessageService
import org.n1.av2.script.effect.TerminalState.UNLOCK_AFTER_SCRIPT
import org.n1.av2.script.type.ScriptEffect

const val scriptCannotInteractWithThisLayer = "script.generic.noInteraction"

enum class TerminalState {
    UNLOCK_AFTER_SCRIPT,
    KEEP_LOCKED
}

class ScriptExecution (val errorMessage: String?, val executionMethod: () -> Unit, val terminalState: TerminalState = UNLOCK_AFTER_SCRIPT) {
    constructor(errorMessage: String): this(errorMessage, { })
    constructor(executionMethod: () -> Unit): this(null, executionMethod)
    constructor(terminalState: TerminalState, executionMethod: () -> Unit): this(null, executionMethod, terminalState)
}

interface ScriptEffectInterface {
    val name: String
    val defaultValue: String?
    val gmDescription: String
    fun playerDescription(effect: ScriptEffect): String
    fun validate(effect: ScriptEffect): String?
    fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution

    companion object {

        fun validateDuration(messageService: MessageService, effect: ScriptEffect): String? {
            if (effect.value == null) return messageService.getMessage("script.validate.duration")
            return effect.value.validateDuration()
        }

        fun validateIntegerGreaterThanZero(messageService: MessageService, effect: ScriptEffect): String? {
            if (effect.value == null) return messageService.getMessage("script.validate.value")
            val value = effect.value.toIntOrNull()
            if (value == null || value <=0) return messageService.getMessage("script.validate.greaterThanZero")
            return null
        }

        fun validateNonEmptyText(messageService: MessageService, effect: ScriptEffect): String? {
            if (effect.value == null) return messageService.getMessage("script.validate.text")
            if (effect.value.isBlank()) return messageService.getMessage("script.validate.textEmpty")
            return null
        }
    }
}


