package org.n1.av2.script.effect.helper

import org.n1.av2.platform.i18n.I18n
import org.n1.av2.run.entity.NodeScanStatus
import org.n1.av2.run.entity.RunEntityService
import org.n1.av2.site.entity.Node
import org.springframework.stereotype.Service

@Service
class NodeAccessHelper(
    private val runEntityService: RunEntityService,
    private val i18n: I18n,
) {

    fun checkNodeRevealed(targetNode: Node?, networkId: String, runId: String): String? {
        if (targetNode == null) return nodeNotFound(networkId)

        val run = runEntityService.getByRunId(runId)

        val targetNodeStatus = run.nodeScanById[targetNode.id]?.status ?: return nodeNotFound(networkId)
        if (targetNodeStatus == NodeScanStatus.UNDISCOVERED_0 || targetNodeStatus == NodeScanStatus.UNCONNECTABLE_1) {
            return nodeNotFound(networkId)
        }
        return null
    }

    private fun nodeNotFound(networkId: String) = i18n.t("node-access.not-found", networkId)
}
