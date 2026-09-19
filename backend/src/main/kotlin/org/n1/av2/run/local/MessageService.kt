package org.n1.av2.run.local

import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.MessageSource
import org.springframework.stereotype.Service
import java.util.*

@Service
class MessageService(
    private val messageSource: MessageSource,
) {

    @Value("\${local}")
    private val language: String? = null

    private var local = Locale.ENGLISH

    @PostConstruct
    fun init() {
        if (language != null) {
            this.local = Locale.of(language)
        }
    }

    fun getMessageAsLines(code: String, vararg args: Any): List<String> {
        val message = messageSource.getMessage(code, args, local).replace("\"", "")
        return message.lines()
    }

    fun getMessage(code: String, vararg args: Any): String {
        return messageSource.getMessage(code, args, local).replace("\"", "")
    }
}
