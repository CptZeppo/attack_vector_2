package org.n1.av2.run.terminal.inside.skillbased

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.hacker.skill.SkillService
import org.n1.av2.hacker.skill.SkillType
import org.n1.av2.layer.other.tripwire.TripwireLayer
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.util.pluralS
import org.n1.av2.run.local.MessageService
import org.n1.av2.run.terminal.MISSING_SKILL_RESPONSE
import org.n1.av2.run.terminal.inside.CommandMoveService
import org.n1.av2.run.terminal.inside.InsideTerminalHelper
import org.n1.av2.site.entity.NodeEntityService
import org.n1.av2.timer.TimerEntityService
import org.n1.av2.timer.TimerService
import org.springframework.stereotype.Service

@Service
class CommandUndoTripwireService(
    private val nodeEntityService: NodeEntityService,
    private val connectionService: ConnectionService,
    private val insideTerminalHelper: InsideTerminalHelper,
    private val skillService: SkillService,
    private val timerEntityService: TimerEntityService,
    private val timerService: TimerService,
    private val commandMoveService: CommandMoveService,
    private val messageService: MessageService,
) {

    fun processCommand(hackerState: HackerStateRunning) {
        if (!skillService.currentUserHasSkill(SkillType.UNDO_TRIPWIRE)) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines(MISSING_SKILL_RESPONSE))
            return
        }

        if (!insideTerminalHelper.verifyInside(hackerState)) return
        requireNotNull(hackerState.currentNodeId)
        if (hackerState.previousNodeId == null || hackerState.previousNodeId == hackerState.currentNodeId) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.undoTripwire.error.noNode"))
            return
        }

        val currentNode = nodeEntityService.findById(hackerState.currentNodeId)
        val tripwireLayers: List<TripwireLayer> = currentNode.layers.filterIsInstance<TripwireLayer>()
        if (tripwireLayers.isEmpty()) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.undoTripwire.error.noTripwire"))
            return
        }

        val timers = tripwireLayers
            .mapNotNull { timerEntityService.findByLayer(it.id) }
            .filter { it.userId == hackerState.userId }
        if (timers.isEmpty()) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.undoTripwire.error.notTriggered"))
            return
        }

        timers.forEach { timer ->
            val layer = tripwireLayers.find { it.id == timer.layerId }
            if (layer != null) { // should always be true, but if it's not, then we don't crash
                timerService.stopTripwireTimer(timer, layer)
            }
        }

        connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.undoTripwire.rollback", pluralS(timers)))

        requireNotNull(hackerState.previousNodeId)
        val previousNode = nodeEntityService.getById(hackerState.previousNodeId)
        commandMoveService.processCommand(listOf(previousNode.networkId), hackerState)
    }
}
