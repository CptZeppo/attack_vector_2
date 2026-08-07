package org.n1.av2.run.terminal.inside

import org.n1.av2.hacker.hackerstate.HackerActivity
import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.layer.Layer
import org.n1.av2.layer.ice.common.IceLayer
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.run.local.MessageService
import org.n1.av2.site.entity.Node
import org.n1.av2.site.entity.NodeEntityService
import org.springframework.stereotype.Service

@Service
class InsideTerminalHelper(
    private val connectionService: ConnectionService,
    private val nodeEntityService: NodeEntityService,
    private val messageService: MessageService,
) {

    fun verifyInside(hackerState: HackerStateRunning): Boolean {
        if (hackerState.activity != HackerActivity.INSIDE) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.inside.notInside"))
            return false
        }
        return true
    }

    fun findBlockingIceLayer(node: Node, runId: String): Layer? {
        val iceLayers = node.layers.filterIsInstance<IceLayer>()
        return iceLayers.findLast { !it.hacked }
    }

    fun verifyCanAccessLayer(layerArgument: String, hackerState: HackerStateRunning, command: String): Layer? {
        requireNotNull(hackerState.currentNodeId)
        val node = nodeEntityService.getById(hackerState.currentNodeId)

        val level = layerArgument.toIntOrNull() ?: return reportLayerUnknown(node, layerArgument, command)
        if (level < 0 || level >= node.layers.size) return reportLayerUnknown(node, layerArgument, command)

        val blockingIceLayer = findBlockingIceLayer(node, hackerState.runId)
        if (blockingIceLayer != null && blockingIceLayer.level > level) return reportBlockingIce(blockingIceLayer)

        val layer = node.layers.find { it.level == level }!!
        return layer
    }

    private fun reportLayerUnknown(node: Node, layerInput: String, command: String): Layer? {
        val layerCount = node.layers.size
        if (layerCount == 1) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.inside.layerUnknown.one", layerInput, command))
        } else {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.inside.layerUnknown.multy", layerInput, layerCount, layerCount - 1))
        }
        return null
    }

    private fun reportBlockingIce(blockingIceLayer: Layer): Layer? {
        connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.inside.blocked", blockingIceLayer.name, blockingIceLayer.level ))
        return null
    }

}
