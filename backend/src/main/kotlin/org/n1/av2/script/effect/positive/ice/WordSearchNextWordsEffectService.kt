package org.n1.av2.script.effect.positive.ice

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.ice.common.IceLayer
import org.n1.av2.layer.ice.wordsearch.WordSearchIceStatusRepo
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.script.effect.SCRIPT_CANNOT_INSTANTIATE_ICE_KEY
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.effect.helper.IceEffectHelper
import org.n1.av2.script.type.ScriptEffect
import org.n1.av2.site.entity.enums.LayerType
import org.springframework.stereotype.Service

/**
 * Linked type:
 * @see org.n1.av2.script.effect.ScriptEffectType.WORD_SEARCH_NEXT_WORDS
 */
@Service
class WordSearchNextWordsEffectService(
    private val iceEffectHelper: IceEffectHelper,
    private val connectionService: ConnectionService,
    private val wordSearchIceStatusRepo: WordSearchIceStatusRepo,
    private val i18n: I18n,
) : ScriptEffectInterface {


    override val name = i18n.t("word-search-next-words.name")
    override val defaultValue = "5"
    override val gmDescription = i18n.t("word-search-next-words.description-gm")

    override fun playerDescription(effect: ScriptEffect) = i18n.t("word-search-next-words.description-player", effect.value!!)

    override fun validate(effect: ScriptEffect) = ScriptEffectInterface.validateIntegerGreaterThanZero(i18n, effect)

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        return iceEffectHelper.runForSpecificIceType(LayerType.WORD_SEARCH_ICE, argumentTokens, hackerState) { layer: IceLayer ->
            ScriptExecution {
                val iceStatus = wordSearchIceStatusRepo.findByLayerId(layer.id) ?: error(i18n.t(SCRIPT_CANNOT_INSTANTIATE_ICE_KEY, layer.id))
                val wordsLeft = iceStatus.words.drop(iceStatus.wordIndex)
                val wordsToShow = wordsLeft.take(effect.value!!.toInt())

                connectionService.replyTerminalReceive(i18n.t("script-effect.next-words"))
                wordsToShow.forEach {
                    connectionService.replyTerminalReceive("- $it")
                }
            }
        }
    }
}
