package org.n1.av2.script.effect.positive

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.run.entity.RunEntityService
import org.n1.av2.run.local.MessageService
import org.n1.av2.run.scanning.InitiateScanService
import org.n1.av2.script.effect.ScriptEffectInterface
import org.n1.av2.script.effect.ScriptExecution
import org.n1.av2.script.effect.helper.NodeAccessHelper
import org.n1.av2.script.type.ScriptEffect
import org.n1.av2.site.entity.NodeEntityService
import org.springframework.stereotype.Service

/**
 * Linked type:
 * @see org.n1.av2.script.effect.ScriptEffectType.SCAN_ICE_NODE
 */
@Service
class ScanBeyondIceNodeEffectService(
    private val runEntityService: RunEntityService,
    private val initiateScanService: InitiateScanService,
    private val nodeEntityService: NodeEntityService,
    private val nodeAccessHelper: NodeAccessHelper,
    private val messageService: MessageService
) : ScriptEffectInterface {

    override val name = messageService.getMessage("script.effect.scan.name")
    override val defaultValue = "00:01:00"
    override val gmDescription = messageService.getMessage("script.effect.scan.description.gm")

    override fun playerDescription(effect: ScriptEffect) = messageService.getMessage("script.effect.scan.description.player")

    override fun validate(effect: ScriptEffect) = null

    override fun prepareExecution(effect: ScriptEffect, argumentTokens: List<String>, hackerState: HackerStateRunning): ScriptExecution {
        val networkId = argumentTokens.firstOrNull() ?: return ScriptExecution(messageService.getMessage("script.effect.scan.execute"))

        val targetNode = nodeEntityService.findByNetworkId(hackerState.siteId, networkId)
        nodeAccessHelper.checkNodeRevealed(targetNode, networkId, hackerState.runId)?.let { return ScriptExecution(it) }

        return ScriptExecution {
            val run = runEntityService.getByRunId(hackerState.runId)
            initiateScanService.scanIgnoringIceAtTargetNode(run, null, targetNode!!)
        }
    }

}
