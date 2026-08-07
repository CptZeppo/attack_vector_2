package org.n1.av2.run.terminal.generic

import org.n1.av2.hacker.hackerstate.HackerActivity
import org.n1.av2.hacker.hackerstate.HackerStateRunning
import org.n1.av2.hacker.skill.Skill
import org.n1.av2.hacker.skill.SkillService
import org.n1.av2.hacker.skill.SkillType.*
import org.n1.av2.hacker.skill.containsType
import org.n1.av2.platform.config.ConfigItem.DEV_HACKER_USE_DEV_COMMANDS
import org.n1.av2.platform.config.ConfigItem.HACKER_SCRIPT_LOAD_DURING_RUN
import org.n1.av2.platform.config.ConfigService
import org.n1.av2.platform.connection.ConnectionService
import org.n1.av2.run.local.MessageService
import org.springframework.stereotype.Service

@Service
class CommandHelpService(
    private val connectionService: ConnectionService,
    private val configService: ConfigService,
    private val skillService: SkillService,
    private val messageService: MessageService,
    ) {

    fun processHelp(arguments: List<String>, hackerState: HackerStateRunning) {
        val skills = skillService.findSkillsForUser(hackerState.userId)

        if (arguments.isEmpty() || arguments[0] != "shortcuts") {
            if (hackerState.activity == HackerActivity.INSIDE) {
                processHelpInside(skills)
            } else {
                processHelpOutside(skills)
            }
        } else {
            processHelpKeys()
        }
    }

    private fun processHelpOutside(skills: List<Skill>) {
        connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.help.outside")
        )
        if (skills.containsType(SCAN)) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.help.outside.scan"))
        }

        connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.help.outside.attack"))
        showRunScriptHelp(skills)
        showShareHelp()
        showDownloadScriptHelp(skills)

        if (configService.getAsBoolean(DEV_HACKER_USE_DEV_COMMANDS)) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.help.outside.dev"))
        }
    }

    private fun processHelpInside(skills: List<Skill>) {
        connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.help.inside"))

        if (skills.containsType(SCAN)) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.help.inside.scan"))
        }

        showRunScriptHelp(skills)
        showWeakenHelp(skills)
        showUndoTripwireHelp(skills)
        showJumpToHackerHelp(skills)

        connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.help.inside.passwordAndDC"))
        showShareHelp()
        showDownloadScriptHelp(skills)

        connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.help.inside.help"))
    }

    private fun processHelpKeys() =
        connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.help.inside.shortcuts"))

    private fun showRunScriptHelp(skills: List<Skill>) {
        if (skills.containsType(SCRIPT_RAM)) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.help.inside.script"))
        }
    }

    private fun showWeakenHelp(skills: List<Skill>) {
        if (skills.containsType(WEAKEN)) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.help.inside.weaken"))
        }
    }

    private fun showUndoTripwireHelp(skills: List<Skill>) {
        if (skills.containsType(UNDO_TRIPWIRE)) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.help.inside.undoTripwire"))
        }
    }

    private fun showJumpToHackerHelp(skills: List<Skill>) {
        if (skills.containsType(JUMP_TO_HACKER)) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.help.inside.jumpToHacker"))
        }
    }

    private fun showDownloadScriptHelp(skills: List<Skill>) {
        if (configService.getAsBoolean(HACKER_SCRIPT_LOAD_DURING_RUN) && skills.containsType(SCRIPT_RAM)) {
            connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.help.inside.dowloadScipt"))
        }
    }

    private fun showShareHelp() =
        connectionService.replyTerminalReceive(messageService.getMessageAsLines("command.help.inside.share"))
}
