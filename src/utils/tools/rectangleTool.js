import {AnnotationTool} from '@cornerstonejs/tools/dist/esm/tools/base';
import {eventTarget, getEnabledElement, triggerEvent, utilities as csUtils, VolumeViewport,} from '@cornerstonejs/core';
import throttle from '@cornerstonejs/tools/dist/esm/utilities/throttle';
import {addAnnotation, getAnnotations, removeAnnotation,} from '@cornerstonejs/tools/dist/esm/stateManagement';
import {isAnnotationLocked} from '@cornerstonejs/tools/dist/esm/stateManagement/annotation/annotationLocking';
import {isAnnotationVisible} from '@cornerstonejs/tools/dist/esm/stateManagement/annotation/annotationVisibility';
import {
    drawHandles as drawHandlesSvg,
    drawLinkedTextBox as drawLinkedTextBoxSvg,
    drawRect as drawRectSvg,
} from '@cornerstonejs/tools/dist/esm/drawingSvg';
import {state} from '@cornerstonejs/tools/dist/esm/store';
import {Events} from '@cornerstonejs/tools/dist/esm/enums';
import {getViewportIdsWithToolToRender} from '@cornerstonejs/tools/dist/esm/utilities/viewportFilters';
import * as rectangle from '@cornerstonejs/tools/dist/esm/utilities/math/rectangle';
import {getTextBoxCoordsCanvas} from '@cornerstonejs/tools/dist/esm/utilities/drawing';
import getWorldWidthAndHeightFromCorners
    from '@cornerstonejs/tools/dist/esm/utilities/planar/getWorldWidthAndHeightFromCorners';
import {hideElementCursor, resetElementCursor,} from '@cornerstonejs/tools/dist/esm/cursors/elementCursor';
import triggerAnnotationRenderForViewportIds
    from '@cornerstonejs/tools/dist/esm/utilities/triggerAnnotationRenderForViewportIds';
import {getModalityUnit} from '@cornerstonejs/tools/dist/esm/utilities/getModalityUnit';
import {isViewportPreScaled} from '@cornerstonejs/tools/dist/esm/utilities/viewport/isViewportPreScaled';
import {pointStore} from "@/store/modules/pointStore";
import {spaceMovementDetector} from "@/utils/toolHandler";

let originalEightPoints = pointStore()
let timeStamp
const { transformWorldToIndex } = csUtils;
class RectangleROITool extends AnnotationTool {
    constructor(toolProps = {}, defaultToolProps = {
        supportedInteractionTypes: ['Mouse', 'Touch'],
        configuration: {
            shadow: true,
            preventHandleOutsideImage: false,
        },
    }) {
        super(toolProps, defaultToolProps);
        this.addNewAnnotation = (evt) => {

            const eventDetail = evt.detail;
            const { currentPoints, element } = eventDetail;
            const worldPos = currentPoints.world;
            const enabledElement = getEnabledElement(element);
            const { viewport, renderingEngine } = enabledElement;
            this.isDrawing = true;
            const camera = viewport.getCamera();
            const { viewPlaneNormal, viewUp } = camera;
            const referencedImageId = this.getReferencedImageId(viewport, worldPos, viewPlaneNormal, viewUp);
            const FrameOfReferenceUID = viewport.getFrameOfReferenceUID();
            timeStamp = Date.now()
            // console.log('uuid: ', currentPoints.world)
            const annotation = {
                invalidated: true,
                highlighted: true,
                metadata: {
                    toolName: this.getToolName(),
                    viewPlaneNormal: [...viewPlaneNormal],
                    viewUp: [...viewUp],
                    FrameOfReferenceUID,
                    referencedImageId,
                },
                data: {
                    label: timeStamp,
                    handles: {
                        points: [
                            [...worldPos],
                            [...worldPos],
                            [...worldPos],
                            [...worldPos],
                        ],
                        textBox: {
                            hasMoved: false,
                            worldPosition: [0, 0, 0],
                            worldBoundingBox: {
                                topLeft: [0, 0, 0],
                                topRight: [0, 0, 0],
                                bottomLeft: [0, 0, 0],
                                bottomRight: [0, 0, 0],
                            },
                        },
                        activeHandleIndex: null,
                    },
                    cachedStats: {},
                }
            };

            addAnnotation(annotation, element);

            const viewportIdsToRender = getViewportIdsWithToolToRender(element, this.getToolName());
            this.editData = {
                annotation,
                viewportIdsToRender,
                handleIndex: 3,
                movingTextBox: false,
                newAnnotation: true,
                hasMoved: false,
            };
            this._activateDraw(element);
            hideElementCursor(element);
            evt.preventDefault();
            triggerAnnotationRenderForViewportIds(renderingEngine, viewportIdsToRender);
            return annotation;
        };
        this.isPointNearTool = (element, annotation, canvasCoords, proximity) => {
            const enabledElement = getEnabledElement(element);
            const { viewport } = enabledElement;
            const { data } = annotation;
            const { points } = data.handles;
            const canvasPoint1 = viewport.worldToCanvas(points[0]);
            const canvasPoint2 = viewport.worldToCanvas(points[3]);
            const rect = this._getRectangleImageCoordinates([
                canvasPoint1,
                canvasPoint2,
            ]);
            const point = [canvasCoords[0], canvasCoords[1]];
            const { left, top, width, height } = rect;
            const distanceToPoint = rectangle.distanceToPoint([left, top, width, height], point);
            if (distanceToPoint <= proximity) {
                return true;
            }
            return false;
        };
        this.toolSelectedCallback = (evt, annotation) => {
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            annotation.highlighted = true;
            const viewportIdsToRender = getViewportIdsWithToolToRender(element, this.getToolName());
            this.editData = {
                annotation,
                viewportIdsToRender,
                movingTextBox: false,
            };
            this._activateModify(element);
            hideElementCursor(element);
            const enabledElement = getEnabledElement(element);
            const { renderingEngine } = enabledElement;
            triggerAnnotationRenderForViewportIds(renderingEngine, viewportIdsToRender);
            evt.preventDefault();
        };
        this.handleSelectedCallback = (evt, annotation, handle) => {
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            const { data } = annotation;
            annotation.highlighted = true;
            let movingTextBox = false;
            let handleIndex;
            if (handle.worldPosition) {
                movingTextBox = true;
            }
            else {
                handleIndex = data.handles.points.findIndex((p) => p === handle);
            }
            const viewportIdsToRender = getViewportIdsWithToolToRender(element, this.getToolName());
            this.editData = {
                annotation,
                viewportIdsToRender,
                handleIndex,
                movingTextBox,
            };
            this._activateModify(element);
            hideElementCursor(element);
            const enabledElement = getEnabledElement(element);
            const { renderingEngine } = enabledElement;
            triggerAnnotationRenderForViewportIds(renderingEngine, viewportIdsToRender);
            evt.preventDefault();
        };
        this._endCallback = (evt) => {
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            const { annotation, viewportIdsToRender, newAnnotation, hasMoved } = this.editData;

            const { data } = annotation;
            if (newAnnotation && !hasMoved) {
                return;
            }
            data.handles.activeHandleIndex = null;
            this._deactivateModify(element);
            this._deactivateDraw(element);
            resetElementCursor(element);
            const enabledElement = getEnabledElement(element);
            const { renderingEngine } = enabledElement;
            this.editData = null;
            this.isDrawing = false;
            if (this.isHandleOutsideImage &&
                this.configuration.preventHandleOutsideImage) {
                removeAnnotation(annotation.annotationUID);
            }

            drawRectangle(RectangleROITool.toolName, annotation, viewportIdsToRender[0], element.parentElement.children)
            spaceMovementDetector(evt, 'createRectangle')

            const AllViewports = ['CT_AXIAL','CT_SAGITTAL','CT_CORONAL']
            triggerAnnotationRenderForViewportIds(renderingEngine, AllViewports);
            if (newAnnotation) {
                const eventType = Events.ANNOTATION_COMPLETED;
                const eventDetail = {
                    annotation,
                };
                triggerEvent(eventTarget, eventType, eventDetail);
            }
            // console.log(data)
        };
        this._dragCallback = (evt) => {
            this.isDrawing = true;
            const eventDetail = evt.detail;
            const { element } = eventDetail;
            const { annotation, viewportIdsToRender, handleIndex, movingTextBox } = this.editData;
            const { data } = annotation;
            if (movingTextBox) {
                const { deltaPoints } = eventDetail;
                const worldPosDelta = deltaPoints.world;
                const { textBox } = data.handles;
                const { worldPosition } = textBox;
                worldPosition[0] += worldPosDelta[0];
                worldPosition[1] += worldPosDelta[1];
                worldPosition[2] += worldPosDelta[2];
                textBox.hasMoved = true;
            }
            else if (handleIndex === undefined) {
                const { deltaPoints } = eventDetail;
                const worldPosDelta = deltaPoints.world;
                const { points } = data.handles;
                points.forEach((point) => {
                    point[0] += worldPosDelta[0];
                    point[1] += worldPosDelta[1];
                    point[2] += worldPosDelta[2];
                });
                annotation.invalidated = true;
            }
            else {
                const { currentPoints } = eventDetail;
                const enabledElement = getEnabledElement(element);
                const { worldToCanvas, canvasToWorld } = enabledElement.viewport;
                const worldPos = currentPoints.world;
                const { points } = data.handles;
                points[handleIndex] = [...worldPos];
                let bottomLeftCanvas;
                let bottomRightCanvas;
                let topLeftCanvas;
                let topRightCanvas;
                let bottomLeftWorld;
                let bottomRightWorld;
                let topLeftWorld;
                let topRightWorld;
                switch (handleIndex) {
                    case 0:
                    case 3:
                        bottomLeftCanvas = worldToCanvas(points[0]);
                        topRightCanvas = worldToCanvas(points[3]);
                        bottomRightCanvas = [topRightCanvas[0], bottomLeftCanvas[1]];
                        topLeftCanvas = [bottomLeftCanvas[0], topRightCanvas[1]];
                        bottomRightWorld = canvasToWorld(bottomRightCanvas);
                        topLeftWorld = canvasToWorld(topLeftCanvas);
                        points[1] = bottomRightWorld;
                        points[2] = topLeftWorld;
                        break;
                    case 1:
                    case 2:
                        bottomRightCanvas = worldToCanvas(points[1]);
                        topLeftCanvas = worldToCanvas(points[2]);
                        bottomLeftCanvas = [
                            topLeftCanvas[0],
                            bottomRightCanvas[1],
                        ];
                        topRightCanvas = [
                            bottomRightCanvas[0],
                            topLeftCanvas[1],
                        ];
                        bottomLeftWorld = canvasToWorld(bottomLeftCanvas);
                        topRightWorld = canvasToWorld(topRightCanvas);
                        points[0] = bottomLeftWorld;
                        points[3] = topRightWorld;
                        break;
                }
                annotation.invalidated = true;
            }
            this.editData.hasMoved = true;
            const enabledElement = getEnabledElement(element);
            const { renderingEngine } = enabledElement;
            triggerAnnotationRenderForViewportIds(renderingEngine, viewportIdsToRender);
        };
        this.cancel = (element) => {
            if (this.isDrawing) {
                this.isDrawing = false;
                this._deactivateDraw(element);
                this._deactivateModify(element);
                resetElementCursor(element);
                const { annotation, viewportIdsToRender, newAnnotation } = this.editData;
                const { data } = annotation;
                annotation.highlighted = false;
                data.handles.activeHandleIndex = null;
                const enabledElement = getEnabledElement(element);
                const { renderingEngine } = enabledElement;
                triggerAnnotationRenderForViewportIds(renderingEngine, viewportIdsToRender);
                if (newAnnotation) {
                    const eventType = Events.ANNOTATION_COMPLETED;
                    const eventDetail = {
                        annotation,
                    };
                    triggerEvent(eventTarget, eventType, eventDetail);
                }
                this.editData = null;
                return annotation.annotationUID;
            }
        };
        this._activateDraw = (element) => {
            state.isInteractingWithTool = true;
            element.addEventListener(Events.MOUSE_UP, this._endCallback);
            element.addEventListener(Events.MOUSE_DRAG, this._dragCallback);
            element.addEventListener(Events.MOUSE_MOVE, this._dragCallback);
            element.addEventListener(Events.MOUSE_CLICK, this._endCallback);
            element.addEventListener(Events.TOUCH_END, this._endCallback);
            element.addEventListener(Events.TOUCH_DRAG, this._dragCallback);
            element.addEventListener(Events.TOUCH_TAP, this._endCallback);
        };
        this._deactivateDraw = (element) => {
            state.isInteractingWithTool = false;
            element.removeEventListener(Events.MOUSE_UP, this._endCallback);
            element.removeEventListener(Events.MOUSE_DRAG, this._dragCallback);
            element.removeEventListener(Events.MOUSE_MOVE, this._dragCallback);
            element.removeEventListener(Events.MOUSE_CLICK, this._endCallback);
            element.removeEventListener(Events.TOUCH_END, this._endCallback);
            element.removeEventListener(Events.TOUCH_DRAG, this._dragCallback);
            element.removeEventListener(Events.TOUCH_TAP, this._endCallback);
        };
        this._activateModify = (element) => {
            state.isInteractingWithTool = true;
            element.addEventListener(Events.MOUSE_UP, this._endCallback);
            element.addEventListener(Events.MOUSE_DRAG, this._dragCallback);
            element.addEventListener(Events.MOUSE_CLICK, this._endCallback);
            element.addEventListener(Events.TOUCH_END, this._endCallback);
            element.addEventListener(Events.TOUCH_DRAG, this._dragCallback);
            element.addEventListener(Events.TOUCH_TAP, this._endCallback);
        };
        this._deactivateModify = (element) => {
            state.isInteractingWithTool = false;
            element.removeEventListener(Events.MOUSE_UP, this._endCallback);
            element.removeEventListener(Events.MOUSE_DRAG, this._dragCallback);
            element.removeEventListener(Events.MOUSE_CLICK, this._endCallback);
            element.removeEventListener(Events.TOUCH_END, this._endCallback);
            element.removeEventListener(Events.TOUCH_DRAG, this._dragCallback);
            element.removeEventListener(Events.TOUCH_TAP, this._endCallback);
        };
        this.renderAnnotation = (enabledElement, svgDrawingHelper) => {
            let renderStatus = false;
            const { viewport } = enabledElement;
            const { element } = viewport;
            let annotations = getAnnotations(this.getToolName(), element);
            if (!annotations?.length) {
                return renderStatus;
            }
            annotations = this.filterInteractableAnnotationsForElement(element, annotations);
            if (!annotations?.length) {
                return renderStatus;
            }
            const targetId = this.getTargetId(viewport);
            const renderingEngine = viewport.getRenderingEngine();
            const styleSpecifier = {
                toolGroupId: this.toolGroupId,
                toolName: this.getToolName(),
                viewportId: enabledElement.viewport.id,
            };
            for (let i = 0; i < annotations.length; i++) {
                const annotation = annotations[i];
                const { annotationUID, data } = annotation;
                const { points, activeHandleIndex } = data.handles;
                const canvasCoordinates = points.map((p) => viewport.worldToCanvas(p));
                styleSpecifier.annotationUID = annotationUID;
                const lineWidth = this.getStyle('lineWidth', styleSpecifier, annotation);
                const lineDash = this.getStyle('lineDash', styleSpecifier, annotation);
                const color = annotation['lineColor'] ? annotation.lineColor : this.getStyle('color', styleSpecifier, annotation);
                const { viewPlaneNormal, viewUp } = viewport.getCamera();
                if (!data.cachedStats[targetId] ||
                    data.cachedStats[targetId].unit === undefined) {
                    data.cachedStats[targetId] = {
                        Modality: null,
                        area: null,
                        max: null,
                        mean: null,
                        stdDev: null,
                        areaUnit: null,
                    };
                    this._calculateCachedStats(annotation, viewPlaneNormal, viewUp, renderingEngine, enabledElement);
                }
                else if (annotation.invalidated) {
                    this._throttledCalculateCachedStats(annotation, viewPlaneNormal, viewUp, renderingEngine, enabledElement);
                    if (viewport instanceof VolumeViewport) {
                        const { referencedImageId } = annotation.metadata;
                        for (const targetId in data.cachedStats) {
                            if (targetId.startsWith('imageId')) {
                                const viewports = renderingEngine.getStackViewports();
                                const invalidatedStack = viewports.find((vp) => {
                                    const referencedImageURI = csUtils.imageIdToURI(referencedImageId);
                                    const hasImageURI = vp.hasImageURI(referencedImageURI);
                                    const currentImageURI = csUtils.imageIdToURI(vp.getCurrentImageId());
                                    return hasImageURI && currentImageURI !== referencedImageURI;
                                });
                                if (invalidatedStack) {
                                    delete data.cachedStats[targetId];
                                }
                            }
                        }
                    }
                }
                if (!viewport.getRenderingEngine()) {
                    console.warn('Rendering Engine has been destroyed');
                    return renderStatus;
                }
                let activeHandleCanvasCoords;
                if (!isAnnotationVisible(annotationUID)) {
                    continue;
                }
                if (!isAnnotationLocked(annotation) &&
                    !this.editData &&
                    activeHandleIndex !== null) {
                    activeHandleCanvasCoords = [canvasCoordinates[activeHandleIndex]];
                }
                if (activeHandleCanvasCoords) {
                    const handleGroupUID = '0';
                    drawHandlesSvg(svgDrawingHelper, annotationUID, handleGroupUID, activeHandleCanvasCoords, {
                        color,
                    });
                }
                const dataId = `${annotationUID}-rect`;
                const rectangleUID = '0';
                drawRectSvg(svgDrawingHelper, annotationUID, rectangleUID, canvasCoordinates[0], canvasCoordinates[3], {
                    color,
                    lineDash,
                    lineWidth,
                }, dataId);
                renderStatus = true;
                const isPreScaled = isViewportPreScaled(viewport, targetId);
                // const textLines = null
                const textLines = this._getTextLines(data, targetId, isPreScaled);

                if (!textLines || textLines.length === 0) {
                    continue;
                }
                if (!data.handles.textBox.hasMoved) {
                    const canvasTextBoxCoords = getTextBoxCoordsCanvas(canvasCoordinates);
                    data.handles.textBox.worldPosition =
                        viewport.canvasToWorld(canvasTextBoxCoords);
                }
                const textBoxPosition = viewport.worldToCanvas(data.handles.textBox.worldPosition);
                const textBoxUID = '1';
                const boundingBox = drawLinkedTextBoxSvg(svgDrawingHelper, annotationUID, textBoxUID, textLines, textBoxPosition, canvasCoordinates, {}, this.getLinkedTextBoxStyle(styleSpecifier, annotation));
                const { x: left, y: top, width, height } = boundingBox;
                data.handles.textBox.worldBoundingBox = {
                    topLeft: viewport.canvasToWorld([left, top]),
                    topRight: viewport.canvasToWorld([left + width, top]),
                    bottomLeft: viewport.canvasToWorld([left, top + height]),
                    bottomRight: viewport.canvasToWorld([left + width, top + height]),
                };
            }
            return renderStatus;
        };
        this._getRectangleImageCoordinates = (points) => {
            const [point0, point1] = points;
            return {
                left: Math.min(point0[0], point1[0]),
                top: Math.min(point0[1], point1[1]),
                width: Math.abs(point0[0] - point1[0]),
                height: Math.abs(point0[1] - point1[1]),
            };
        };
        this._getTextLines = (data, targetId, isPreScaled) => {
            const cachedVolumeStats = data.cachedStats[targetId];
            const { area, mean, max, stdDev, Modality, areaUnit } = cachedVolumeStats;
            if (mean === undefined) {
                return;
            }
            const textLines = [];
            const unit = getModalityUnit(Modality, isPreScaled);
            textLines.push(`Area: ${area.toFixed(2)} ${areaUnit}\xb2`);
            textLines.push(`Mean: ${mean.toFixed(2)} ${unit}`);
            textLines.push(`Max: ${max.toFixed(2)} ${unit}`);
            textLines.push(`Std Dev: ${stdDev.toFixed(2)} ${unit}`);
            if (data.handles.textBox.worldPosition.length === 0 && data.handles.textBox.worldBoundingBox.topLeft.length ===0 &&
                data.handles.textBox.worldBoundingBox.topRight.length === 0) {
                return null;
            } else {
                return textLines;
            }
        };
        this._calculateCachedStats = (annotation, viewPlaneNormal, viewUp, renderingEngine, enabledElement) => {
            const { data } = annotation;
            const { viewportId, renderingEngineId } = enabledElement;
            const worldPos1 = data.handles.points[0];
            const worldPos2 = data.handles.points[3];
            const { cachedStats } = data;
            const targetIds = Object.keys(cachedStats);
            for (let i = 0; i < targetIds.length; i++) {
                const targetId = targetIds[i];
                const image = this.getTargetIdImage(targetId, renderingEngine);
                if (!image) {
                    continue;
                }
                const { dimensions, imageData, metadata, hasPixelSpacing } = image;
                const scalarData = 'getScalarData' in image ? image.getScalarData() : image.scalarData;
                const worldPos1Index = transformWorldToIndex(imageData, worldPos1);
                worldPos1Index[0] = Math.floor(worldPos1Index[0]);
                worldPos1Index[1] = Math.floor(worldPos1Index[1]);
                worldPos1Index[2] = Math.floor(worldPos1Index[2]);
                const worldPos2Index = transformWorldToIndex(imageData, worldPos2);
                worldPos2Index[0] = Math.floor(worldPos2Index[0]);
                worldPos2Index[1] = Math.floor(worldPos2Index[1]);
                worldPos2Index[2] = Math.floor(worldPos2Index[2]);
                if (this._isInsideVolume(worldPos1Index, worldPos2Index, dimensions)) {
                    this.isHandleOutsideImage = false;
                    const iMin = Math.min(worldPos1Index[0], worldPos2Index[0]);
                    const iMax = Math.max(worldPos1Index[0], worldPos2Index[0]);
                    const jMin = Math.min(worldPos1Index[1], worldPos2Index[1]);
                    const jMax = Math.max(worldPos1Index[1], worldPos2Index[1]);
                    const kMin = Math.min(worldPos1Index[2], worldPos2Index[2]);
                    const kMax = Math.max(worldPos1Index[2], worldPos2Index[2]);
                    const { worldWidth, worldHeight } = getWorldWidthAndHeightFromCorners(viewPlaneNormal, viewUp, worldPos1, worldPos2);
                    const area = worldWidth * worldHeight;
                    let count = 0;
                    let mean = 0;
                    let stdDev = 0;
                    let max = -Infinity;
                    const yMultiple = dimensions[0];
                    const zMultiple = dimensions[0] * dimensions[1];
                    for (let k = kMin; k <= kMax; k++) {
                        for (let j = jMin; j <= jMax; j++) {
                            for (let i = iMin; i <= iMax; i++) {
                                const value = scalarData[k * zMultiple + j * yMultiple + i];
                                if (value > max) {
                                    max = value;
                                }
                                count++;
                                mean += value;
                            }
                        }
                    }
                    mean /= count;
                    for (let k = kMin; k <= kMax; k++) {
                        for (let j = jMin; j <= jMax; j++) {
                            for (let i = iMin; i <= iMax; i++) {
                                const value = scalarData[k * zMultiple + j * yMultiple + i];
                                const valueMinusMean = value - mean;
                                stdDev += valueMinusMean * valueMinusMean;
                            }
                        }
                    }
                    stdDev /= count;
                    stdDev = Math.sqrt(stdDev);
                    cachedStats[targetId] = {
                        Modality: metadata.Modality,
                        area,
                        mean,
                        stdDev,
                        max,
                        areaUnit: hasPixelSpacing ? 'mm' : 'px',
                    };
                }
                else {
                    this.isHandleOutsideImage = true;
                    cachedStats[targetId] = {
                        Modality: metadata.Modality,
                    };
                }
            }
            annotation.invalidated = false;
            const eventType = Events.ANNOTATION_MODIFIED;
            const eventDetail = {
                annotation,
                viewportId,
                renderingEngineId,
            };
            triggerEvent(eventTarget, eventType, eventDetail);
            return cachedStats;
        };
        this._isInsideVolume = (index1, index2, dimensions) => {
            return (csUtils.indexWithinDimensions(index1, dimensions) &&
                csUtils.indexWithinDimensions(index2, dimensions));
        };
        this._throttledCalculateCachedStats = throttle(this._calculateCachedStats, 100, { trailing: true });
    }
}
const creatEightPoints = (data, distanceX, distanceY, distanceZ, annotationUID, viewportId, eightPoints) => {
    let points
    let isCreateNew = true
    if (eightPoints && eightPoints.point1) {
        points = eightPoints
        isCreateNew = false
    } else {
        points = {
            point1: null,
            point2: null,
            point3: null,
            point4: null,
            point5: null,
            point6: null,
            point7: null,
            point8: null,
        }
    }

    const rawPoints = data

    // sequence
    // Axial 0,1,2,3,
    // Sagittal 0,1
    // Coronal 1
    // Another
    let distanceW
    let distanceH
    let gap
    console.log(888)
    switch (viewportId) {
        case 'CT_AXIAL':

            points.point1 = isCreateNew ? rawPoints[0] : [rawPoints[0][0], rawPoints[0][1], points.point1[2]]
            points.point2 = isCreateNew ? rawPoints[1] : [rawPoints[1][0], rawPoints[1][1], points.point2[2]]
            points.point3 = isCreateNew ? rawPoints[2] : [rawPoints[2][0], rawPoints[2][1], points.point3[2]]
            points.point4 = isCreateNew ? rawPoints[3] : [rawPoints[3][0], rawPoints[3][1], points.point4[2]]
            if (isCreateNew) {
                distanceW = Math.abs(points.point2[0] - points.point1[0])
                distanceH = Math.abs(points.point3[1] - points.point1[1])
                gap = distanceW < distanceH ? distanceW : distanceH
            }

            points.point5 = [points.point3[0], points.point3[1], isCreateNew ? (points.point3[2] + gap) :points.point5[2]]
            points.point6 = [points.point1[0], points.point1[1], isCreateNew ? (points.point1[2] + gap) :points.point6[2]]
            points.point7 = [points.point2[0], points.point2[1], isCreateNew ? (points.point2[2] + gap) :points.point7[2]]
            points.point8 = [points.point4[0], points.point4[1], isCreateNew ? (points.point4[2] + gap) :points.point8[2]]
            console.log(gap, points.point5, points.point3)
            break;
        case 'CT_SAGITTAL':
            points.point6 = isCreateNew ? rawPoints[0] : [points.point6[0], rawPoints[0][1], rawPoints[0][2]]
            points.point5 = isCreateNew ? rawPoints[1] : [points.point5[0], rawPoints[1][1], rawPoints[1][2]]
            points.point1 = isCreateNew ? rawPoints[2] : [points.point1[0], rawPoints[2][1], rawPoints[2][2]]
            points.point3 = isCreateNew ? rawPoints[3] : [points.point3[0], rawPoints[3][1], rawPoints[3][2]]
            if (isCreateNew) {
                distanceW = Math.abs(points.point6[2] - points.point1[2])
                distanceH = Math.abs(points.point6[1] - points.point5[1])
                gap = distanceW < distanceH ? distanceW : distanceH
            }
            points.point2 = [isCreateNew ? (points.point1[0] + gap) : points.point2[0], points.point1[1], points.point1[2]]
            points.point4 = [isCreateNew ? (points.point3[0] + gap) : points.point4[0], points.point3[1], points.point3[2]]
            points.point7 = [isCreateNew ? (points.point6[0] + gap) : points.point7[0], points.point6[1], points.point6[2]]
            points.point8 = [isCreateNew ? (points.point5[0] + gap) : points.point8[0], points.point5[1], points.point5[2]]
            break;
        case 'CT_CORONAL':
            points.point6 = isCreateNew ? rawPoints[0] : [rawPoints[0][0], points.point6[1], rawPoints[0][2]]
            points.point7 = isCreateNew ? rawPoints[1] : [rawPoints[1][0], points.point7[1], rawPoints[1][2]]
            points.point1 = isCreateNew ? rawPoints[2] : [rawPoints[2][0], points.point1[1], rawPoints[2][2]]
            points.point2 = isCreateNew ? rawPoints[3] : [rawPoints[3][0], points.point2[1], rawPoints[3][2]]
            if (isCreateNew) {
                distanceW = Math.abs(points.point6[0] - points.point7[0])
                distanceH = Math.abs(points.point6[2] - points.point1[2])
                gap = distanceW < distanceH ? distanceW : distanceH
            }
            points.point3 = [points.point1[0], isCreateNew ? (points.point1[1] + gap) : points.point3[1], points.point1[2]]
            points.point4 = [points.point2[0], isCreateNew ? (points.point2[1] + gap) : points.point4[1], points.point2[2]]
            points.point5 = [points.point6[0], isCreateNew ? (points.point6[1] + gap) : points.point5[1], points.point6[2]]
            points.point8 = [points.point7[0], isCreateNew ? (points.point7[1] + gap) : points.point8[1], points.point7[2]]
            break;
    }
    originalEightPoints.setCurrentAnnotation(points, annotationUID)
}

const compareTwoPoints = (p1, p2, notCompareAxis) => {
    let compareResult = true
    switch (notCompareAxis) {
        case 'x':
            compareResult = (p1[1] === p2[1]) && (p1[2] === p2[2])
            break;
        case 'y':
            compareResult = (p1[0] === p2[0]) && (p1[2] === p2[2])
            break;
        case 'z':
            compareResult = (p1[0] === p2[0]) && (p1[1] === p2[1])
            break;
        case 'no':
            compareResult = (p1[0] === p2[0]) && (p1[1] === p2[1]) && (p1[2] === p2[2])
            break;
    }
    return !compareResult
}

const isSquarePointsAllMoved = (eightPoints, newPoints, viewportId) => {
    let isMoved = false
    console.log('8 points: ', eightPoints.point1)
    console.log('new points:', newPoints)
    // the point1 changed, the whole cube should be recreated
    switch (viewportId) {
        case 'CT_AXIAL':
            if (compareTwoPoints(newPoints[0], eightPoints.point1, 'z')) {
                console.log('CT_AXIAL isMoved')
                isMoved = true
            } else {
                // 2,3,4 changed
                // 7,5,8 should be changed
                if (compareTwoPoints(newPoints[1], eightPoints.point2, 'z')) {
                    originalEightPoints.setOnePoint([newPoints[1][0]], 'point2', [0])
                    originalEightPoints.setOnePoint([newPoints[3][0]], 'point4', [0])
                    originalEightPoints.setOnePoint([newPoints[1][0]], 'point7',[0])
                    originalEightPoints.setOnePoint([newPoints[3][0]], 'point8',[0])
                }
                if (compareTwoPoints(newPoints[2], eightPoints.point3, 'z')) {
                    originalEightPoints.setOnePoint([newPoints[2][1]], 'point3', [1])
                    originalEightPoints.setOnePoint([newPoints[3][1]], 'point4', [1])
                    originalEightPoints.setOnePoint([newPoints[2][1]], 'point5', [1])
                    originalEightPoints.setOnePoint([newPoints[3][1]], 'point8', [1])
                }
                if (compareTwoPoints(newPoints[1], eightPoints.point2, 'z') && compareTwoPoints(newPoints[2], eightPoints.point3, 'z')) {
                    originalEightPoints.setOnePoint([newPoints[3][0], newPoints[3][1]], 'point4', [0,1])
                    originalEightPoints.setOnePoint([newPoints[3][0], newPoints[3][1]], 'point8', [0,1])
                }
            }
            break;
        case 'CT_SAGITTAL':
            if (compareTwoPoints(newPoints[2], eightPoints.point1, 'x')) {
                // addAnnotation(, ele2)
                console.log('CT_SAGITTAL isMoved')
                isMoved = true
            }  else {
                // 5,6,3 changed
                // 8,7,4 should be changed
                if (compareTwoPoints(newPoints[0], eightPoints.point6, 'x')) {
                    originalEightPoints.setOnePoint([newPoints[0][2]], 'point6', [2])
                    originalEightPoints.setOnePoint([newPoints[1][2]], 'point5', [2])
                    originalEightPoints.setOnePoint([newPoints[0][2]], 'point7',[2])
                    originalEightPoints.setOnePoint([newPoints[1][2]], 'point8',[2])
                }
                if (compareTwoPoints(newPoints[3], eightPoints.point3, 'x')) {
                    originalEightPoints.setOnePoint([newPoints[3][1]], 'point3', [1])
                    originalEightPoints.setOnePoint([newPoints[1][1]], 'point5', [1])
                    originalEightPoints.setOnePoint([newPoints[3][1]], 'point4',[1])
                    originalEightPoints.setOnePoint([newPoints[1][1]], 'point8',[1])
                }
                if (compareTwoPoints(newPoints[0], eightPoints.point6, 'x') && compareTwoPoints(newPoints[3], eightPoints.point3, 'x')) {
                    originalEightPoints.setOnePoint([newPoints[1][1], newPoints[1][2]], 'point5', [1,2])
                    originalEightPoints.setOnePoint([newPoints[1][1], newPoints[1][2]], 'point8', [1,2])
                }
            }
            break;
        case 'CT_CORONAL':
            if (compareTwoPoints(newPoints[2], eightPoints.point1, 'y')) {
                console.log('CT_CORONAL isMoved')
                isMoved = true
            }  else {
                // 6,7,2 changed
                // 5,8,4 should be changed
                if (compareTwoPoints(newPoints[0], eightPoints.point6, 'y')) {
                    originalEightPoints.setOnePoint([newPoints[0][2]], 'point6', [2])
                    originalEightPoints.setOnePoint([newPoints[1][2]], 'point7', [2])
                    originalEightPoints.setOnePoint([newPoints[0][2]], 'point5', [2])
                    originalEightPoints.setOnePoint([newPoints[1][2]], 'point8', [2])
                }
                if (compareTwoPoints(newPoints[3], eightPoints.point2, 'y')) {
                    originalEightPoints.setOnePoint([newPoints[3][0]], 'point2', [0])
                    originalEightPoints.setOnePoint([newPoints[1][0]], 'point7', [0])
                    originalEightPoints.setOnePoint([newPoints[3][0]], 'point4', [0])
                    originalEightPoints.setOnePoint([newPoints[1][0]], 'point8', [0])
                }
                if (compareTwoPoints(newPoints[0], eightPoints.point6, 'y') && compareTwoPoints(newPoints[3], eightPoints.point2, 'y')) {
                    originalEightPoints.setOnePoint([newPoints[1][0], newPoints[1][2]], 'point7', [0,2])
                    originalEightPoints.setOnePoint([newPoints[1][0], newPoints[1][2]], 'point8', [0,2])
                }
            }
            break;
    }
    return isMoved
}

const drawRectangle = (selectedToolName, data, viewportId, elements) => {
    console.log('----')

    const ele1 =  elements[0]
    const ele2 =  elements[1]
    const ele3 =  elements[2]
    // console.log('data: ', data, viewportId)
    let annotationUID = baseAnnotationUID(data['annotationUID'])

    const eightPoints = originalEightPoints.getCurrentAnnotation
    const newSquare = objectCopy(fixPoints(data['data']['handles']['points'], 2))
    const thickness = originalEightPoints.getDicomThickness
    // console.log('8:',eightPoints)
    let xLength = thickness
    let yLength = thickness
    let zLength = thickness
    if (eightPoints.annotationUID && eightPoints.annotationUID === annotationUID) {
        const isMoved = isSquarePointsAllMoved(eightPoints, newSquare, viewportId)
        if (isMoved) {
            creatEightPoints(newSquare, 0,0,0, annotationUID, viewportId, eightPoints)
        }
    } else {
        creatEightPoints(newSquare, xLength,yLength,zLength, annotationUID, viewportId)
    }

    const newData1 = objectCopy(data)
    const newData2 = objectCopy(data)
    const newData3 = objectCopy(data)
    let annotationList
    switch (viewportId) {
        case 'CT_AXIAL':
            annotationList = getAnnotations(selectedToolName, ele1)
            break;
        case 'CT_SAGITTAL':
            annotationList = getAnnotations(selectedToolName, ele2)
            break;
        case 'CT_CORONAL':
            annotationList = getAnnotations(selectedToolName, ele3)
            break;
    }

    for (let i = annotationList.length -1; i >= 0; i --) {
        const tempString = data['annotationUID'].substring(0, data['annotationUID'].length -2)
        if (annotationList[i]['annotationUID'].includes(tempString)) {
            // console.log(data['annotationUID'])
            // console.log(annotationList[i]['annotationUID'])
            removeAnnotation(annotationList[i]['annotationUID'])
        }
    }
    newData1['metadata']['viewPlaneNormal'] = [-0, -0, -1]
    newData1['metadata']['viewUp'] = [0, -1, 0]
    newData2['metadata']['viewPlaneNormal'] = [1, -0, -0]
    newData2['metadata']['viewUp'] = [0, 0, 1]
    newData3['metadata']['viewPlaneNormal'] = [-0, -1, -0]
    newData3['metadata']['viewUp'] = [0, 0, 1]
    if (annotationUID.includes('_index_')) {
        annotationUID = baseAnnotationUID(annotationUID)
    }
    newData1['annotationUID'] = annotationUID + '_index_1'
    newData2['annotationUID'] = annotationUID + '_index_2'
    newData3['annotationUID'] = annotationUID + '_index_3'

    newData1['data']['handles']['points'] = layerPointsCalculate('AXIAL')
    newData2['data']['handles']['points'] = layerPointsCalculate('SAGITTAL')
    newData3['data']['handles']['points'] = layerPointsCalculate('CORONAL')

    // console.log('point 1:',newData1['data']['handles']['points'])
    // console.log('point 2:',newData2['data']['handles']['points'])
    // console.log('point 3:',newData3['data']['handles']['points'])

    addAnnotation(newData1, ele1);
    addAnnotation(newData2, ele2);
    addAnnotation(newData3, ele3);
}

const layerPointsCalculate = (targetLayer) => {
    let points = originalEightPoints.getCurrentAnnotation
    // console.log('8 points from store: ', points)
    let targetPoints
    if (targetLayer === 'AXIAL') {
        targetPoints = createSquareFromEightPoints(points, 1, 2, 3, 4)
    } else if (targetLayer === 'SAGITTAL') {
        // this layer left and right should be replaced
        targetPoints = createSquareFromEightPoints(points, 6, 5, 1, 3)
    } else if (targetLayer === 'CORONAL') {
        targetPoints = createSquareFromEightPoints(points, 6, 7, 1, 2)
    }
    // console.log('2 targetLayer ',targetPoints)
    return targetPoints
}

const createSquareFromEightPoints = (points, p1, p2, p3, p4) => {
    const tempArr = []
    const pointsArr = [p1,p2,p3,p4]
    for (let i = 0; i < pointsArr.length; i ++) {
        for (let key in points) {
            if (key.includes(pointsArr[i])) {
                tempArr.push(points[key])
                break
            }
        }
    }
    return tempArr
}

const baseAnnotationUID = (annotationUID) => {
    return annotationUID.indexOf('_index_') > 0 ?annotationUID.substring(0, annotationUID.indexOf('_index_')) : annotationUID
}

const fixNumber = (numArray, length) => {
    return numArray.map(num => {
        return Number(num.toFixed(length))
    })
}
const fixPoints = (points, length) => {
    return points.map(numArray => {
        return numArray.map(num => {
            return Number(num.toFixed(length))
        })
    })
}

const objectCopy = (data) => {
    return (JSON.parse(JSON.stringify(data)))
}

RectangleROITool.toolName = 'RectangleROI';

export default RectangleROITool;
//# sourceMappingURL=RectangleROITool.js.map
