package org.n1.av2.layer.other.timeradjuster

import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.connection.ServerActions
import org.n1.av2.platform.iam.user.CurrentUserService
import org.n1.av2.platform.util.createId
import org.n1.av2.platform.util.toDuration
import org.n1.av2.platform.util.toHumanTime
import org.n1.av2.run.local.MessageService
import org.n1.av2.timer.TimerEntityService
import org.n1.av2.timer.TimerLabel
import org.n1.av2.timer.TimerService
import org.springframework.stereotype.Service


@Service
class TimerAdjusterService(
    private val connectionService: ConnectionService,
    private val timerService: TimerService,
    private val timerEntityService: TimerEntityService,
    private val timerAdjusterStatusRepository: TimerAdjusterStatusRepository,
    private val currentUserService: CurrentUserService,
    private val messageService: MessageService,
) {

    fun hack(layer: TimerAdjusterLayer) {
        connectionService.replyTerminalReceive(messageService.getMessageAsLines("layer.timerAdjuster.hack", layer.name))
        val timeAdjustmentText = when (layer.adjustmentType) {
            TimerAdjustmentType.SPEED_UP -> messageService.getMessageAsLines("layer.timerAdjuster.hack.speedUp", layer.amount.toDuration().toHumanTime())
            TimerAdjustmentType.SLOW_DOWN -> messageService.getMessageAsLines("layer.timerAdjuster.hack.slowDown", layer.amount.toDuration().toHumanTime())
        }
        connectionService.replyTerminalReceive(timeAdjustmentText)

        val recurringText = when (layer.recurring) {
            TimerAdjustmentRecurring.FIRST_ENTRY_ONLY -> messageService.getMessageAsLines("layer.timerAdjuster.hack.once")
            TimerAdjustmentRecurring.EACH_HACKER_ONCE -> messageService.getMessageAsLines("layer.timerAdjuster.hack.onceEach")
            TimerAdjustmentRecurring.EVERY_ENTRY -> messageService.getMessageAsLines("layer.timerAdjuster.hack.everyEntry")
        }
        connectionService.replyTerminalReceive(recurringText)
    }

    fun hackerArrivesNode(siteId: String, layer: TimerAdjusterLayer, nodeId: String, runId: String) {

        val status = timerAdjusterStatusRepository.findByLayerId(layer.id)
        if (status == null) {
            timerAdjusterStatusRepository.save(TimerAdjusterStatusEntity(
                id = createId("timerAdjusterStatus", timerAdjusterStatusRepository::findById),
                siteId = siteId,
                layerId = layer.id,
                enteredUserIds = listOf(currentUserService.userId)
            ))
            adjustTimer(siteId, layer)
            connectionService.toRun(runId, ServerActions.SERVER_FLASH_PATROLLER, "nodeId" to nodeId)
        }
        else {
            if (triggersAdjustment(layer, status)) {
                if (!status.enteredUserIds.contains(currentUserService.userId)) {
                    timerAdjusterStatusRepository.save(
                        status.copy(
                            enteredUserIds = status.enteredUserIds + currentUserService.userId
                        )
                    )
                }
                adjustTimer(siteId, layer)
                connectionService.toRun(runId, ServerActions.SERVER_FLASH_PATROLLER, "nodeId" to nodeId)
            }
        }
    }

    fun triggersAdjustment(layer: TimerAdjusterLayer, status: TimerAdjusterStatusEntity): Boolean {
        return when (layer.recurring) {
            TimerAdjustmentRecurring.FIRST_ENTRY_ONLY -> status.enteredUserIds.isEmpty()
            TimerAdjustmentRecurring.EVERY_ENTRY -> true
            TimerAdjustmentRecurring.EACH_HACKER_ONCE -> !status.enteredUserIds.contains(currentUserService.userId)
        }
    }

    fun adjustTimer(siteId: String, layer: TimerAdjusterLayer) {
        val timers = timerEntityService
            .findBySiteId(siteId)
            .filter { timer -> timer.label == TimerLabel.TRIPWIRE_SITE_SHUTDOWN }

        if (timers.isNotEmpty()) {

            if (layer.adjustmentType == TimerAdjustmentType.SPEED_UP) {
                connectionService.replyTerminalReceive(messageService.getMessageAsLines("layer.timerAdjuster.speedUp", layer.name))
                timers.forEach { timer ->
                    timerService.speedUpTimer(timer, layer.amount.toDuration())
                }
            }
            else {
                connectionService.replyTerminalReceive(messageService.getMessageAsLines("layer.timerAdjuster.slowDown", layer.name))
                timers.forEach { timer ->
                    timerService.delayTripwireTimer(timer, layer.amount.toDuration())
                }

            }
        }
    }

    fun siteReset(siteId: String) {
        timerAdjusterStatusRepository.deleteBySiteId(siteId)
    }

}
