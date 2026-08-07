package org.n1.av2.script.effect.helper

import org.n1.av2.run.entity.NodeScanStatus
import org.n1.av2.run.entity.RunEntityService
import org.n1.av2.run.local.MessageService
import org.n1.av2.site.entity.Node
import org.springframework.stereotype.Service

@Service
class NodeAccessHelper(
    private val runEntityService: RunEntityService,
    private val messageService: MessageService,
) {

    fun checkNodeRevealed(targetNode: Node?, networkId: String, runId: String): String? {
        if (targetNode == null )return nodeNotFound(networkId)

        val run = runEntityService.getByRunId(runId)

        val targetNodeStatus = run.nodeScanById[targetNode.id]?.status ?: return nodeNotFound(networkId)
        if (targetNodeStatus == NodeScanStatus.UNDISCOVERED_0 || targetNodeStatus == NodeScanStatus.UNCONNECTABLE_1) {
            return nodeNotFound(networkId)
        }
        return null
    }

    private fun nodeNotFound(networkId: String) = messageService.getMessage("script.node.notFound", networkId)
}
