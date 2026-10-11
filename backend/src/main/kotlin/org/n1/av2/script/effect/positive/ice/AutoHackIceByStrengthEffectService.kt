package org.n1.av2.script.effect.positive.ice

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.ice.common.IceLayer
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.platform.inputvalidation.ValidationException
import org.n1.av2.script.effect.SCRIPT_CANNOT_INTERACT_KEY
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.effect.helper.IceEffectHelper
import org.n1.av2.script.effect.helper.ScriptEffectHelper
import org.n1.av2.script.type.ScriptEffect
import org.n1.av2.site.entity.ThemeService
import org.n1.av2.site.entity.enums.IceStrength
import org.n1.av2.site.entity.enums.LayerType
import org.springframework.stereotype.Service

/**
 * Linked type:
 * @see org.n1.av2.script.effect.ScriptEffectType.AUTO_HACK_ICE_BY_STRENGTH
 */
@Service
class AutoHackIceByStrengthEffectService(
    private val iceEffectHelper: IceEffectHelper,
    private val scriptEffectHelper: ScriptEffectHelper,
    private val themeService: ThemeService,
    private val i18n: I18n,
) : ScriptEffectInterface {

    override val name = i18n.t("auto-hack-ice-strength.name")
    override val defaultValue = "${IceStrength.WEAK.name}:${LayerType.PASSWORD_ICE},${LayerType.TAR_ICE}"
    override val gmDescription = i18n.t("auto-hack-ice-strength.description-gm")

    override fun playerDescription(effect: ScriptEffect): String {
        val strength = parseStrength(effect)
        val excludedIceTypes = parseExcludedIceTypes(effect)


        val orWeakerText = if (strength.value > IceStrength.VERY_WEAK.value) i18n.t("auto-hack-ice-strength.description-or-weaker") else ""

        return i18n.t(
            "auto-hack-ice-strength.description-player",
            strength.description.lowercase(),
            orWeakerText,
            excludedIceTypes.joinToString(", ") { themeService.themeName(it) })
    }

    private fun parseStrength(effect: ScriptEffect): IceStrength {
        val strength = effect.value?.split(":")[0] ?: throw ValidationException(i18n.t("auto-hack-ice-strength.invalid-strength"))
        return IceStrength.valueOf(strength)
    }

    private fun parseExcludedIceTypes(effect: ScriptEffect): List<LayerType> {
        val excludeIceTypes = effect.value?.split(":")[1] ?: throw ValidationException(i18n.t("auto-hack-ice-strength.invalid-exclusion"))
        return excludeIceTypes.split(",").map { LayerType.valueOf(it) }
    }

    override fun validate(effect: ScriptEffect): String? {
        try {
            parseStrength(effect)
            parseExcludedIceTypes(effect)
            return null
        } catch (_: Exception) {
            return i18n.t("auto-hack-ice-strength.invalid-format")
        }
    }

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        val runOnLayerResult = scriptEffectHelper.runOnLayer(argumentTokens, hackerState)
        runOnLayerResult.errorExecution?.let { return it }

        val layer = checkNotNull(runOnLayerResult.layer)
        if (layer !is IceLayer) {
            return ScriptExecution(i18n.t(SCRIPT_CANNOT_INTERACT_KEY))
        }
        val excludedIceTypes = parseExcludedIceTypes(effect)
        if (excludedIceTypes.contains(layer.type)) {
            return ScriptExecution(i18n.t("script-effect.cannot-hack-ice-type"))
        }
        val scriptStrength = parseStrength(effect)
        if (scriptStrength.value < layer.strength.value) {
            return ScriptExecution(i18n.t("script-effect.too-weak", layer.strength.description))
        }

        return iceEffectHelper.autoHack(layer, hackerState)
    }
}
