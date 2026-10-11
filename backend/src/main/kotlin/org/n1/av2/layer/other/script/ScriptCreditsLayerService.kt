package org.n1.av2.layer.other.script

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.hacker.skill.SkillService
import org.n1.av2.hacker.skill.SkillType
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.platform.iam.user.DATA_FENCE_USER
import org.n1.av2.platform.iam.user.UserAndHackerService
import org.n1.av2.script.credittransaction.CreditTransactionService
import org.n1.av2.site.entity.NodeEntityService
import org.springframework.stereotype.Service

@Service
class ScriptCreditsLayerService(
    private val connectionService: ConnectionService,
    private val nodeEntityService: NodeEntityService,
    private val skillService: SkillService,
    private val userAndHackerService: UserAndHackerService,
    private val creditTransactionService: CreditTransactionService,
    private val i18n: I18n,
) {

    fun hack(layer: ScriptCreditsLayer, hackerState: HackerStateRunning) {
        if (layer.stolen) {
            connectionService.replyTerminalReceive(i18n.t("script-credits.no-data"))
            connectionService.replyTerminalReceive(i18n.t("script-credits.recently-deleted"))
            return
        }

        if (layer.amount == 0) {
            connectionService.replyTerminalReceive(i18n.t("script-credits.no-data"))
            return
        }

        if (!skillService.currentUserHasSkill(SkillType.SCRIPT_CREDITS)) {
            connectionService.replyTerminalReceive(i18n.t("script-credits.valuable-found"))
            connectionService.replyTerminalReceive(i18n.t("script-credits.encryption-missing-skill"))
            return
        }

        connectionService.replyTerminalReceive(i18n.t("script-credits.selling", layer.amount.toString()))
        connectionService.replyTerminalReceive(i18n.t("script-credits.clearing"))
        connectionService.replyTerminalReceive(i18n.t("script-credits.done"))

        creditTransactionService.transferCredits(DATA_FENCE_USER.id, hackerState.userId, layer.amount, "Data sale")
        creditTransactionService.sendTransactionsForUser(hackerState.userId)
        userAndHackerService.sendDetailsOfCurrentUser()

        val node = nodeEntityService.findByLayerId(layer.id)
        val layerToEdit = node.getLayerById(layer.id) as ScriptCreditsLayer
        layerToEdit.stolen = true
        nodeEntityService.save(node)
    }
}
