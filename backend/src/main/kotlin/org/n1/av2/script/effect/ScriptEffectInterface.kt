package org.n1.av2.script.effect

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.platform.util.validateDuration
import org.n1.av2.script.effect.TerminalState.UNLOCK_AFTER_SCRIPT
import org.n1.av2.script.type.ScriptEffect

const val SCRIPT_CANNOT_INTERACT_KEY = "script-effect.cannot-interact-layer"
const val SCRIPT_CANNOT_INSTANTIATE_ICE_KEY = "script-effect.cannot-instantiate-ice"

enum class TerminalState {
    UNLOCK_AFTER_SCRIPT,
    KEEP_LOCKED
}

class ScriptExecution(val errorMessage: String?, val executionMethod: () -> Unit, val terminalState: TerminalState = UNLOCK_AFTER_SCRIPT) {
    constructor(errorMessage: String) : this(errorMessage, { })
    constructor(executionMethod: () -> Unit) : this(null, executionMethod)
    constructor(terminalState: TerminalState, executionMethod: () -> Unit) : this(null, executionMethod, terminalState)
}

interface ScriptEffectInterface {
    val name: String
    val defaultValue: String?
    val gmDescription: String
    fun playerDescription(effect: ScriptEffect): String
    fun validate(effect: ScriptEffect): String?
    fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution

    companion object {

        fun validateDuration(i18n: I18n, effect: ScriptEffect): String? {
            if (effect.value == null) return i18n.t("script-effect.duration")
            return effect.value.validateDuration()
        }

        fun validateIntegerGreaterThanZero(i18n: I18n, effect: ScriptEffect): String? {
            if (effect.value == null) return i18n.t("script-effect.value")
            val value = effect.value.toIntOrNull()
            if (value == null || value <= 0) return i18n.t("script-effect.greater-than-zero")
            return null
        }

        fun validateNonEmptyText(i18n: I18n, effect: ScriptEffect): String? {
            if (effect.value == null) return i18n.t("script-effect.text")
            if (effect.value.isBlank()) return i18n.t("script-effect.text-empty")
            return null
        }
    }
}


