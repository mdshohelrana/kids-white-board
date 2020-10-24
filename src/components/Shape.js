import React, {useCallback} from "react";

import {SHAPE_TYPES} from "../constants/constants";
import {useShapes} from "../states/state";
import {Circle} from "./Circle";
import {Rectangle} from "./Rectangle";
import {Square} from "./Square";

export function Shape({shape}) {
    const isSelectedSelector = useCallback(
        (state) => state.selected === shape.id,
        [shape]
    );
    const isSelected = useShapes(isSelectedSelector);

    if (shape.type === SHAPE_TYPES.RECT) {
        return <Rectangle {...shape} isSelected={isSelected}/>;
    } else if (shape.type === SHAPE_TYPES.CIRCLE) {
        return <Circle {...shape} isSelected={isSelected}/>;
    } else if (shape.type === SHAPE_TYPES.SQUARE) {
        return <Square {...shape} isSelected={isSelected}/>;
    }

    return null;
}
