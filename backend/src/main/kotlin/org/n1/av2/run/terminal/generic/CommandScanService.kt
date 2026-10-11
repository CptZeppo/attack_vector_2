package org.n1.av2.run.terminal.generic

import org.n1.av2.hacker.hackerstate.HackerActivity
import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.hacker.skill.SkillService
import org.n1.av2.hacker.skill.SkillType
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.run.entity.RunEntityService
import org.n1.av2.run.scanning.InitiateScanService
import org.n1.av2.run.terminal.outside.OutsideTerminalHelper
import org.n1.av2.site.entity.NodeEntityService
import org.n1.av2.site.entity.SitePropertiesEntityService
import org.springframework.stereotype.Service

@Service
class CommandScanService(
    private val connectionService: ConnectionService,
    private val runEntityService: RunEntityService,
    private val nodeEntityService: NodeEntityService,
    private val initiateScanService: InitiateScanService,
    private val sitePropertiesEntityService: SitePropertiesEntityService,
    private val devCommandHelper: DevCommandHelper,
    private val outsideTerminalHelper: OutsideTerminalHelper,
    private val skillService: SkillService,
    private val i18n: I18n,
) {

    fun processScan(arguments: List<String>, hackerState: HackerStateRunning) {
        if (!checkHasScanSkill()) return

        if (hackerState.activity == HackerActivity.OUTSIDE) processScanFromOutside(arguments, hackerState)
        if (hackerState.activity == HackerActivity.INSIDE) processScanFromInside(arguments, hackerState)
    }

    private fun processScanFromOutside(arguments: List<String>, hackerState: HackerStateRunning) {
        if (arguments.isNotEmpty()) {
            connectionService.replyTerminalReceive(i18n.t("scan.ignoring-args-outside"))
        }
        if (!checkHasScanSkill()) return
        if (!outsideTerminalHelper.verifySiteNotShutdown(hackerState.siteId)) return

        val run = runEntityService.getByRunId(hackerState.runId)
        val networkId = sitePropertiesEntityService.getBySiteId(run.siteId).startNodeNetworkId

        val node = nodeEntityService.findByNetworkId(run.siteId, networkId)
            ?: return connectionService.replyTerminalReceive(i18n.t("scan.no-route"))

        connectionService.replyTerminalSetLocked(true)
        initiateScanService.scanFromOutside(run, node)
    }

    private fun processScanFromInside(arguments: List<String>, hackerState: HackerStateRunning) {
        if (arguments.isNotEmpty()) {
            connectionService.replyTerminalReceive(i18n.t("scan.ignoring-args-inside"))
        }
        connectionService.replyTerminalSetLocked(true)
        requireNotNull(hackerState.currentNodeId)
        val run = runEntityService.getByRunId(hackerState.runId)
        val node = nodeEntityService.findById(hackerState.currentNodeId)
        initiateScanService.scanFromInside(run, node)
    }

    private fun checkHasScanSkill(): Boolean {
        val hasScanSkill = skillService.currentUserHasSkill(SkillType.SCAN)
        if (!hasScanSkill) {
            connectionService.replyTerminalReceive(i18n.t("terminal.missing-skill"))
            return false
        }
        return true
    }

    fun processQuickScan(hackerState: HackerStateRunning) {
        if (!devCommandHelper.checkDevModeEnabled()) return


        if (!outsideTerminalHelper.verifyOutside(hackerState)) return
        val run = runEntityService.getByRunId(hackerState.runId)

        initiateScanService.quickScan(run)
        connectionService.replyTerminalReceive(i18n.t("scan.quick-scanned"))
    }

}
