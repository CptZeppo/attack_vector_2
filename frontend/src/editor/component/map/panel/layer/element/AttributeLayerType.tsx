import React from 'react'
import {SilentLink} from "../../../../../../common/component/SilentLink"
import {Glyphicon} from "../../../../../../common/component/icon/Glyphicon"
import {IceType, iceSimpleName, iceTypeDefaultSorter, OS} from "../../../../../../common/enums/LayerTypes"
import {sendChangeLayerType, sendRemoveLayer} from "../../../../../server/EditorServerClient"
import {LayerDetails, NodeI} from "../../../../../../common/sites/SiteModel";

const isIceType = (type: string): type is IceType => Object.values(IceType).includes(type as IceType)

const renderRemove = (layer: LayerDetails, remove: () => void) => {
    if (layer.type === OS) {
        return null
    }
    return (
        <span className="pull-right">
            <SilentLink onClick={() => remove()}>
                <Glyphicon name="glyphicon-trash"/>
            </SilentLink>
        </span>
    )
}

interface Props {
    node: NodeI,
    layer: LayerDetails,
    typeDisplay: string
}

const renderType = (node: NodeI, layer: LayerDetails, typeDisplay: string) => {
    // For ICE layers, offer a dropdown to change WHICH ICE puzzle this layer is - the layer keeps its id,
    // position (level), name and strength, so the GM doesn't have to delete + re-add (which reorders the
    // stack). Non-ICE layers keep the plain read-only label.
    if (!isIceType(layer.type)) {
        return <span className="strong layer_text_label text_gold" style={{top: "7px", position: "relative"}}>{typeDisplay}</span>
    }

    const changeType = (newType: string) => {
        if (newType !== layer.type) {
            sendChangeLayerType({nodeId: node.id, layerId: layer.id, layerType: newType})
        }
    }

    return (
        <select className="form-control" value={layer.type} onChange={(event) => changeType(event.target.value)}>
            {Object.values(IceType).sort(iceTypeDefaultSorter).map(iceType => (
                <option key={iceType} value={iceType}>ICE {iceSimpleName[iceType]}</option>
            ))}
        </select>
    )
}

export const AttributeLayerType = ({node, layer, typeDisplay}: Props) => {

    const remove = () => {
        sendRemoveLayer({nodeId: node.id, layerId: layer.id})
    }

    return (
        <div className="row form-group layerFieldTopRow">
            <div className="col-lg-3 control-label layerLabel">Type</div>
            <div className="col-lg-8 noRightPadding">
                {renderType(node, layer, typeDisplay)}
            </div>
            <div className="col-lg-1 layerHelpColumn">
                <span>{renderRemove(layer, remove)}</span>
            </div>
        </div>
    )
}
