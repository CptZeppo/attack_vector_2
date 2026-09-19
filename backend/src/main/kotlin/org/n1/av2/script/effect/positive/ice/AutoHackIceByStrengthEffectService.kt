package org.n1.av2.script.effect.positive.ice

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.ice.common.IceLayer
import org.n1.av2.platform.inputvalidation.ValidationException
import org.n1.av2.run.local.MessageService
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.effect.helper.IceEffectHelper
import org.n1.av2.script.effect.helper.ScriptEffectHelper
import org.n1.av2.script.effect.scriptCannotInteractWithThisLayer
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
    private val messageService: MessageService
    ) : ScriptEffectInterface {

    override val name = messageService.getMessage("script.effect.ice.strength.name")
    override val defaultValue = "${IceStrength.WEAK.name}:${LayerType.PASSWORD_ICE},${LayerType.TAR_ICE}"
    override val gmDescription = messageService.getMessage("script.effect.ice.strength.description.gm")

    override fun playerDescription(effect: ScriptEffect): String {
        val strength = parseStrength(effect)
        val excludedIceTypes = parseExcludedIceTypes(effect)


        val orWeakerText = if (strength.value > IceStrength.VERY_WEAK.value) messageService.getMessage("script.effect.ice.strength.description.orWeaker") else ""

        return messageService.getMessage("script.effect.ice.strength.description.player", strength.description.lowercase(), orWeakerText, excludedIceTypes.joinToString(", ") { themeService.themeName(it) } )
    }

    private fun parseStrength(effect: ScriptEffect): IceStrength {
        val strength = effect.value?.split(":")[0] ?: throw ValidationException(messageService.getMessage("script.effect.ice.strength.error.strenght"))
        return IceStrength.valueOf(strength)
    }

    private fun parseExcludedIceTypes(effect: ScriptEffect): List<LayerType> {
        val excludeIceTypes = effect.value?.split(":")[1] ?:  throw ValidationException(messageService.getMessage("script.effect.ice.strength.error.exclusion"))
        return excludeIceTypes.split(",").map {LayerType.valueOf(it)}
    }

    override fun validate(effect: ScriptEffect): String? {
        try {
            parseStrength(effect)
            parseExcludedIceTypes(effect)
            return null
        }
        catch (_: Exception) {
            return messageService.getMessage("script.effect.ice.strength.error.format")
        }
    }

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        val runOnLayerResult = scriptEffectHelper.runOnLayer(argumentTokens, hackerState)
        runOnLayerResult.errorExecution?.let { return it }

        val layer = checkNotNull(runOnLayerResult.layer)
        if (layer !is IceLayer ) {
            return ScriptExecution(messageService.getMessage(scriptCannotInteractWithThisLayer))
        }
        val excludedIceTypes = parseExcludedIceTypes(effect)
        if (excludedIceTypes.contains(layer.type)) {
            return ScriptExecution(messageService.getMessage("script.effect.ice.strength.error.type"))
        }
        val scriptStrength = parseStrength(effect)
        if (scriptStrength.value < layer.strength.value) {
            return ScriptExecution(messageService.getMessage("script.effect.ice.strength.error.tooWeak", layer.strength.description))
        }

        return iceEffectHelper.autoHack(layer, hackerState)
    }
}
