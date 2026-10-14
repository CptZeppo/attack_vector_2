package org.n1.av2.site.entity

import org.n1.av2.platform.i18n.I18n
import org.n1.av2.site.entity.enums.LayerType
import org.springframework.stereotype.Service

@Service
class ThemeService(
    private val i18n: I18n,
) {
    private val layerNameMap: Map<LayerType, String> = this.initLayerNames()
    private val iceNameMap: Map<LayerType, String> = this.initIceNames()

    fun initLayerNames(): Map<LayerType, String> {
        val map = HashMap<LayerType, String>()
        for (layerType in LayerType.entries) {
            map[layerType] = this.i18n.t("layer-name.$layerType")
        }
        return map
    }

    fun initIceNames(): Map<LayerType, String> {
        val map = HashMap<LayerType, String>()
        for (layerType in LayerType.entries) {
            if(layerType.ice) {
                map[layerType] = this.i18n.t("ice-name.$layerType")
            }
        }
        return map
    }

    fun themeName(type: LayerType): String {
        return this.layerNameMap[type]!!
    }

    fun iceSimpleName(type: LayerType): String {
        if (!type.ice) {
            error("Not ICE: $type")
        }
        return this.iceNameMap[type]!!
    }

}
