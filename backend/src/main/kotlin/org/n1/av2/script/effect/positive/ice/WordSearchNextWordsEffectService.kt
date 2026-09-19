package org.n1.av2.script.effect.positive.ice

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.ice.common.IceLayer
import org.n1.av2.layer.ice.wordsearch.WordSearchIceStatusRepo
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.run.local.MessageService
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
    private val messageService: MessageService
) : ScriptEffectInterface {


    override val name = messageService.getMessage("script.effect.ice.wordSearch.name")
    override val defaultValue = "5"
    override val gmDescription = messageService.getMessage("script.effect.ice.wordSearch.description.gm")

    override fun playerDescription(effect: ScriptEffect) = messageService.getMessage("script.effect.ice.wordSearch.description.player", effect.value!!)

    override fun validate(effect: ScriptEffect) = ScriptEffectInterface.validateIntegerGreaterThanZero(messageService, effect)

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        return iceEffectHelper.runForSpecificIceType(LayerType.WORD_SEARCH_ICE, argumentTokens, hackerState) { layer: IceLayer ->
            ScriptExecution {
                val iceStatus = wordSearchIceStatusRepo.findByLayerId(layer.id) ?: error(messageService.getMessage("script.effect.ice.wordSearch.error", layer.id))
                val wordsLeft = iceStatus.words.drop(iceStatus.wordIndex)
                val wordsToShow = wordsLeft.take(effect.value!!.toInt())

                connectionService.replyTerminalReceive(messageService.getMessage("script.effect.ice.wordSearch.execution"))
                wordsToShow.forEach {
                    connectionService.replyTerminalReceive("- $it")
                }
            }
        }
    }
}
