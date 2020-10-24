import {createStore} from "@halka/state";
import produce from "immer";
import clamp from "clamp";
import {nanoid} from "nanoid";

import {SHAPE_TYPES, DEFAULTS, LIMITS} from "../constants/constants";
import {playAudio} from "../utils/utils";
import Rectangle from '../assets/sounds/shapes/rectangle.mp3';
import Circle from '../assets/sounds/shapes/circle.mp3';
import Square from '../assets/sounds/shapes/square.mp3';

const APP_NAMESPACE = "__interactive_board__";

const baseState = {
    selected: null,
    shapes: {},
};

export const useShapes = createStore(() => {
    const initialState = JSON.parse(localStorage.getItem(APP_NAMESPACE));

    return {...baseState, shapes: initialState ?? {}};
});

const setState = (fn) => useShapes.set(produce(fn));

export const saveDiagram = () => {
    const state = useShapes.get();
    localStorage.setItem(APP_NAMESPACE, JSON.stringify(state.shapes));
};

export const reset = () => {
    localStorage.removeItem(APP_NAMESPACE);
    useShapes.set(baseState);
};

export const createSquare = ({x, y}) => {
    setState((state) => {
        state.shapes[nanoid()] = {
            type: SHAPE_TYPES.RECT,
            width: DEFAULTS.SQUARE.WIDTH,
            height: DEFAULTS.SQUARE.HEIGHT,
            fill: DEFAULTS.SQUARE.FILL,
            stroke: DEFAULTS.SQUARE.STROKE,
            rotation: DEFAULTS.SQUARE.ROTATION,
            x,
            y,
        };
        playAudio(Square);
    });
};

export const createRectangle = ({x, y}) => {
    setState((state) => {
        state.shapes[nanoid()] = {
            type: SHAPE_TYPES.RECT,
            width: DEFAULTS.RECT.WIDTH,
            height: DEFAULTS.RECT.HEIGHT,
            fill: DEFAULTS.RECT.FILL,
            stroke: DEFAULTS.RECT.STROKE,
            rotation: DEFAULTS.RECT.ROTATION,
            x,
            y,
        };
        playAudio(Rectangle);
    });
};

export const createCircle = ({x, y}) => {
    setState((state) => {
        state.shapes[nanoid()] = {
            type: SHAPE_TYPES.CIRCLE,
            radius: DEFAULTS.CIRCLE.RADIUS,
            fill: DEFAULTS.CIRCLE.FILL,
            stroke: DEFAULTS.CIRCLE.STROKE,
            x,
            y,
        };
        playAudio(Circle);
    });
};

export const selectShape = (id) => {
    setState((state) => {
        state.selected = id;
        const tempState = useShapes.get();

        Object.entries(tempState.shapes).forEach(([key, value]) => {
            const shape = tempState.shapes[key];
            if (shape.type === SHAPE_TYPES.RECT) {
                playAudio(Rectangle);

            } else if (shape.type === SHAPE_TYPES.CIRCLE) {
                playAudio(Circle);

            } else if (shape.type === SHAPE_TYPES.SQUARE) {
                playAudio(Square);
            }
        });
    });
};

export const clearSelection = () => {
    setState((state) => {
        state.selected = null;
    });
};

export const moveShape = (id, event) => {
    setState((state) => {
        const shape = state.shapes[id];

        if (shape) {
            shape.x = event.target.x();
            shape.y = event.target.y();
        }
    });
};

export const updateAttribute = (attr, value) => {
    setState((state) => {
        const shape = state.shapes[state.selected];

        if (shape) {
            shape[attr] = value;
        }
    });
};

export const transformRectangleShape = (node, id, event) => {
    // transformer is changing scale of the node
    // and NOT its width or height
    // but in the store we have only width and height
    // to match the data better we will reset scale on transform end
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // we will reset the scale back
    node.scaleX(1);
    node.scaleY(1);

    setState((state) => {
        const shape = state.shapes[id];

        if (shape) {
            shape.x = node.x();
            shape.y = node.y();

            shape.rotation = node.rotation();

            shape.width = clamp(
                // increase the width in order of the scale
                node.width() * scaleX,
                // should not be less than the minimum width
                LIMITS.RECT.MIN,
                // should not be more than the maximum width
                LIMITS.RECT.MAX
            );
            shape.height = clamp(
                node.height() * scaleY,
                LIMITS.RECT.MIN,
                LIMITS.RECT.MAX
            );
        }
    });
};

export const transformCircleShape = (node, id, event) => {
    // transformer is changing scale of the node
    // and NOT its width or height
    // but in the store we have only width and height
    // to match the data better we will reset scale on transform end
    const scaleX = node.scaleX();

    // we will reset the scale back
    node.scaleX(1);
    node.scaleY(1);

    setState((state) => {
        const shape = state.shapes[id];

        if (shape) {
            shape.x = node.x();
            shape.y = node.y();

            shape.radius = clamp(
                (node.width() * scaleX) / 2,
                LIMITS.CIRCLE.MIN,
                LIMITS.CIRCLE.MAX
            );
        }
    });
};
