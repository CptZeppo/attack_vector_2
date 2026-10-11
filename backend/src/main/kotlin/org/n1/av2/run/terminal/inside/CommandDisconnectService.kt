package org.n1.av2.run.terminal.inside

import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.platform.i18n.I18n
import org.n1.av2.run.RunService
import org.n1.av2.run.terminal.SyntaxHighlightingService
import org.springframework.stereotype.Service

@Service
class CommandDisconnectService(
    private val runService: RunService,
    private val insideTerminalHelper: InsideTerminalHelper,
    private val syntaxHighlightingService: SyntaxHighlightingService,
    private val i18n: I18n,
) {

    fun disconnect(hackerState: HackerStateRunning) {
        if (!insideTerminalHelper.verifyInside(hackerState)) return

        runService.hackerDisconnect(hackerState.toState(), i18n.t("run.disconnected"))
        syntaxHighlightingService.sendForOutside()
    }
}
