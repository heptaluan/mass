import {
    Enums,
    getEnabledElement,
    getRenderingEngine, volumeLoader,
} from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import RectangleROITool from './tools/rectangleTool'
import CrosshairsTool from './tools/crosshairsTool'
import {pointStore} from "@/store/modules/pointStore";
import {mprButtonStore} from "@/store/modules/MRPButtons";
import {showAllAnnotations} from "@cornerstonejs/tools/dist/esm/stateManagement/annotation/annotationVisibility";
import {getAnnotations, addAnnotation, removeAnnotation} from "@cornerstonejs/tools/dist/esm/stateManagement";
import {jumpToWorld} from "@cornerstonejs/tools/src/utilities/viewport";
import getWorldWidthAndHeightFromCorners
    from "@cornerstonejs/tools/dist/esm/utilities/planar/getWorldWidthAndHeightFromCorners";
import {transformWorldToIndex} from "@cornerstonejs/core/src/utilities";

let originalEightPoints = pointStore()
let mprButton = mprButtonStore()
const {
    ToolGroupManager,
    Enums: csToolsEnums,
    PanTool,
    ZoomTool,
    // WindowLevelTool,
    StackScrollMouseWheelTool,
    // position display
    // CrosshairsTool,
    // brush
    // SegmentationDisplayTool,
    RectangleScissorsTool,
    // SphereScissorsTool,
    CircleScissorsTool,
    BrushTool,
    PaintFillTool,
    // measure
    LengthTool,
    ProbeTool,
    EllipticalROITool,
    BidirectionalTool,
    AngleTool,
    CobbAngleTool,
    ArrowAnnotateTool,
    utilities: cstUtils,
} = cornerstoneTools;

const { MouseBindings } = csToolsEnums;
// const { ViewportType } = Enums;
let selectedToolName = ''
let selectedToolGroupId = ''
let originalPointStore = pointStore()
let notMPRSelected = false

// const { segmentation: segmentationUtils } = cstUtils;

const viewportId1 = 'CT_AXIAL';
const viewportId2 = 'CT_SAGITTAL';
const viewportId3 = 'CT_CORONAL';

const viewportColors = {
    [viewportId1]: 'rgb(200, 0, 0)',
    [viewportId2]: 'rgb(200, 200, 0)',
    [viewportId3]: 'rgb(0, 200, 0)',
};

const viewportReferenceLineControllable = [
    viewportId1,
    viewportId2,
    viewportId3,
];

const viewportReferenceLineDraggableRotatable = [
    viewportId1,
    viewportId2,
    viewportId3,
];

const viewportReferenceLineSlabThicknessControlsOn = [
    viewportId1,
    viewportId2,
    viewportId3,
];

const measureToolNames = [
    LengthTool.toolName,
    ProbeTool.toolName,
    RectangleROITool.toolName,
    EllipticalROITool.toolName,
    BidirectionalTool.toolName,
    AngleTool.toolName,
    CobbAngleTool.toolName,
    ArrowAnnotateTool.toolName,
];

const cameraViewDirection = [
    {
        viewPlaneNormal: [-0, -0, -1],
        viewUp: [0, -1, 0]
    },
    {
        viewPlaneNormal: [1, -0, -0],
        viewUp: [0, 0, 1]
    },
    {
        viewPlaneNormal: [-0, -1, -0],
        viewUp: [0, 0, 1]
    }
]

let isDraw = false

const setToolGroupId = (id) => {
    selectedToolGroupId = id
}

const getReferenceLineColor = (viewportId) => {
    return viewportColors[viewportId];
}

const getReferenceLineControllable = (viewportId) => {
    const index = viewportReferenceLineControllable.indexOf(viewportId);
    return index !== -1;
}

const getReferenceLineDraggableRotatable = (viewportId) => {
    const index = viewportReferenceLineDraggableRotatable.indexOf(viewportId);
    return index !== -1;
}

const getReferenceLineSlabThicknessControlsOn = (viewportId) => {
    const index = viewportReferenceLineSlabThicknessControlsOn.indexOf(viewportId);
    return index !== -1;
}

const toolsCornerstoneAddHandler = () => {
    const toolsList = cornerstoneTools.state.tools;
    const tools = [
        CrosshairsTool,
        RectangleROITool,
        // WindowLevelTool,
        ZoomTool,
        PanTool,
    ];
    for (let i = 0; i < tools.length; i++) {
        if (!toolsList[tools[i].toolName]) {
            cornerstoneTools.addTool(tools[i]);
        }
    }
}

const addToolsToGroup = (toolGroup) => {
    // Manipulation Tools
    toolGroup.addTool(StackScrollMouseWheelTool.toolName);
    // Add Crosshairs tool and configure it to link the three viewports
    // These viewports could use different tool groups. See the PET-CT example
    // for a more complicated used case.
    toolGroup.addTool(CrosshairsTool.toolName, {
        getReferenceLineColor,
        getReferenceLineControllable,
        getReferenceLineDraggableRotatable,
        getReferenceLineSlabThicknessControlsOn,
    });

    // Manipulation Tools
    // toolGroup.addTool(WindowLevelTool.toolName);
    toolGroup.addTool(PanTool.toolName);
    toolGroup.addTool(ZoomTool.toolName);

    // Segmentation Tools
    // measure tools
    toolGroup.addTool(RectangleROITool.toolName);
}

const dropdownSelectChange = (toolGroup, options, name, isPassive) => {
    if (isPassive) {
        toolGroup.setToolPassive(name, {
            bindings: [{ mouseButton: MouseBindings.Secondary }],
        });
    } else {
        toolGroup.setToolActive(name, {
            bindings: [{ mouseButton: MouseBindings.Primary }],
        });
    }
}

// 取消其他工具
const setAllToolPassive = (toolGroupId) => {
    const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
    // toolGroup.setToolPassive(WindowLevelTool.toolName);
    toolGroup.setToolPassive(PanTool.toolName);
    toolGroup.setToolPassive(ZoomTool.toolName);
    toolGroup.setToolDisabled(CrosshairsTool.toolName);

    // toolGroup.setToolPassive(RectangleROITool.toolName);
};

const manualRender = (toolGroup, blendModeToUse) => {
    toolGroup.viewportsInfo.forEach(({ viewportId, renderingEngineId }) => {
        const renderingEngine = getRenderingEngine(renderingEngineId);
        const viewport = renderingEngine.getViewport(
            viewportId
        );
        if (blendModeToUse) {
            viewport.setBlendMode(blendModeToUse);
        }
        viewport.render();
    });
}

const changeMPRTool = (name, toolGroupId) => {
    selectedToolGroupId = toolGroupId
    const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
    notMPRSelected = false
    switch (name) {
        case 'Crosshairs': {
            toolDisabledHandler(toolGroup, CrosshairsTool.toolName)

            const crosshairsInstance = toolGroup.getToolInstance(
                CrosshairsTool.toolName
            );
            const oldConfiguration = crosshairsInstance.configuration;
            const blendModeToUse = Enums.BlendModes.MAXIMUM_INTENSITY_BLEND
            crosshairsInstance.configuration = {
                ...oldConfiguration,
                slabThicknessBlendMode: blendModeToUse,
            };

            toolGroup.setToolActive(CrosshairsTool.toolName, {
                bindings: [{ mouseButton: MouseBindings.Primary }],
            });

            // Update the blendMode for actors to instantly reflect the change
            manualRender(toolGroup, blendModeToUse)

            selectedToolName = CrosshairsTool.toolName
            break;
        }
        case 'RectangleROI': {
            // const newSelectedToolName = String(newSelectedToolNameAsStringOrNumber);
            // selectedToolName = newSelectedToolName
            toolDisabledHandler(toolGroup, 'RectangleROI')
            dropdownSelectChange(toolGroup, measureToolNames, 'RectangleROI')
            dropdownSelectChange(toolGroup, measureToolNames, CrosshairsTool.toolName, true)
            selectedToolName = 'RectangleROI'
            break;
        }
    }

}

const toolActiveHandler = (toolGroup, otherName) => {
    // toolGroup.setToolEnabled(SegmentationDisplayTool.toolName);
    if (otherName) {
        notMPRSelected = true
        let toolName
        switch (otherName) {
            // case 'WindowLevel':
            //     toolName = WindowLevelTool.toolName;
            //     break;
            case 'Pan':
                toolName = PanTool.toolName;
                break;
            case 'Zoom':
                toolName = ZoomTool.toolName;
                break;
        }

        toolGroup.setToolActive(toolName, {
            bindings: [
                {
                    mouseButton: MouseBindings.Primary, // Middle Click
                },
            ],
        });
    } else {
        toolGroup.setToolActive(PanTool.toolName, {
            bindings: [
                {
                    mouseButton: MouseBindings.Auxiliary, // Middle Click
                },
            ],
        });
        toolGroup.setToolActive(ZoomTool.toolName, {
            bindings: [
                {
                    mouseButton: MouseBindings.Secondary, // Right Click
                },
            ],
        });
        // As the Stack Scroll mouse wheel is a tool using the `mouseWheelCallback`
        // hook instead of mouse buttons, it does not need to assign any mouse button.
        toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);

        toolGroup.setToolActive(CrosshairsTool.toolName, {
            bindings: [{mouseButton: MouseBindings.Primary}],
        });
        notMPRSelected = false
        selectedToolName = CrosshairsTool.toolName
    }
}

const displayAnnotationsHandler = (check, toolGroupId) => {
    const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);

    if (!check) {
        toolDisabledHandler(toolGroup, 'RectangleROI', true)
        toolDisabledHandler(toolGroup, 'Crosshairs', true)
    } else {
        if (notMPRSelected) {
            dropdownSelectChange(toolGroup, measureToolNames, 'RectangleROI', true)
        } else {
            dropdownSelectChange(toolGroup, measureToolNames, 'RectangleROI')
            dropdownSelectChange(toolGroup, measureToolNames, 'Crosshairs')
        }
    }
};

const toolDisabledHandler = (toolGroup, newToolName, isForce) => {
    const currentToolName = toolGroup.getActivePrimaryMouseButtonTool();
    console.log(newToolName, currentToolName)
    if (isForce) {
        toolGroup.setToolDisabled(newToolName);
    } else {
        if (currentToolName === 'Crosshairs' && newToolName && newToolName === 'RectangleROI') {
            toolGroup.setToolPassive(currentToolName);
        } else if (currentToolName === 'RectangleROI' && newToolName && newToolName === 'Crosshairs') {
            toolGroup.setToolPassive(currentToolName);
        } else if (currentToolName) {
            toolGroup.setToolDisabled(currentToolName);
        }
    }
}
const rectangleToCross = (finished) => {
    if (!finished) {
        const toolGroup = ToolGroupManager.getToolGroup(selectedToolGroupId);
        toolGroup.setToolPassive('RectangleROI');
        toolGroup.setToolActive(CrosshairsTool.toolName, { bindings: [{ mouseButton: MouseBindings.Primary }]});
        mprButton.setButtonsStatus(2, false, true)
        mprButton.setButtonsStatus(1, true, false)
        mprButton.setButtonsStatus(3, false, false)
    } else {
        mprButton.setButtonsStatus(2, false, false)
        mprButton.setButtonsStatus(3, false, true)
    }
}

const drawFinishSwitch = (status) => {
    isDraw = status
    if (!isDraw) {
        rectangleToCross(true)
    }
}

const getMouseDownData = async (event, toolGroupId, volumeId, toolGroup) => {

    if (selectedToolName === 'Crosshairs') {
        // const viewPort = event.currentTarget
        // console.log('Crosshairs info: ', event.currentTarget.parentElement, viewPort)
        if (document.getElementsByClassName('activeLine').length > 0) {
            document.getElementsByClassName('activeLine')[0].classList.remove('activeLine')
        }
        event.currentTarget.parentElement.classList.add('activeLine')
    } else if (selectedToolName === 'RectangleROI') {
        const viewPort = event.currentTarget
    }
    // console.log('SegmentationRepresentations: ', segmentation.state.getSegmentationRepresentations(toolGroupId))
}


const getMouseUpData = async (event, toolGroupId) => {
    // selectedToolGroupId = ''
    // console.log('select name: ', selectedToolName)
    if (selectedToolName === 'RectangleROI') {
        // console.log('RectangleROI annotations: ', annotation.state.getAnnotations(selectedToolName, event.currentTarget.parentElement))
    } else if (selectedToolName === 'Crosshairs') {
        const viewPort = event.currentTarget
    }
    // console.log('RectangleROI annotations: ', annotation.state.getAnnotations('RectangleROI', event.currentTarget.parentElement))
}

const enableTool = (name) => {
    const toolGroup = ToolGroupManager.getToolGroup('tt');
    if (!toolGroup.toolOptions[name] || toolGroup.toolOptions[name].mode === "Disabled") {
        toolGroup.setToolActive(name);
    }
}

const getAllNodule = (noduleList) => {
    const cubeList = []
    noduleList.forEach(ele => {
        cubeList.push(ele.boxVO)
    })
    return cubeList
}

const readAllCube = (noduleList, specialCube, targetPosition) => {
    let allCube
    if (noduleList) {
        allCube = getAllNodule(noduleList)
    } else {
        const tempCube = originalEightPoints.getCurrentAnnotation
        if (tempCube && tempCube.point1) {
            if (!targetPosition || targetPosition !== 'savedNew') {
                originalEightPoints.deleteCube(tempCube)
            }
            originalEightPoints.removeCurrentAnnotation()
            drawFinishSwitch(false)
        }
        allCube = originalEightPoints.getCube('all')
    }
    const e1 = document.getElementsByClassName('viewport1')[0]

    const annotationList = getAnnotations('RectangleROI', e1)
    if (annotationList && annotationList.length > 0) {
        for (let i = annotationList.length - 1; i >= 0; i--) {
            removeAnnotation(annotationList[i]['annotationUID'])
        }
    }
    // console.log(getAnnotations('RectangleROI', e1))
    allCube.forEach(ele => {
        originalEightPoints.setCube(ele)
    })

    if (allCube.length === 0) {
        jumpToSpecialPoint([], true, targetPosition)
    }

    allCube.forEach((ele, index) => {
        // console.log(allCube)
        let annotation1 = annotationFormatBuilder(ele, ele.annotationUID, 0, 'white')
        let annotation2 = annotationFormatBuilder(ele, ele.annotationUID, 1, 'white')
        let annotation3 = annotationFormatBuilder(ele, ele.annotationUID, 2, 'white')
        // if (!specialCube && (index === allCube.length - 1)) {
        //     jumpToSpecialPoint([annotation1, annotation2, annotation3], true)
        // } else {
            jumpToSpecialPoint([annotation1, annotation2, annotation3], false)
        // }
    })
    if (targetPosition === 'deleted' || (!specialCube && !targetPosition)) {
        const centerPoint = fixNumber(getAnnotations('Crosshairs', e1)[0].data.handles.toolCenter, 2)
        jumpToSpecialPoint([], true, centerPoint)
    }
    if (specialCube) {
        let annotation1 = annotationFormatBuilder(specialCube, specialCube.annotationUID, 0, 'red')
        let annotation2 = annotationFormatBuilder(specialCube, specialCube.annotationUID, 1, 'red')
        let annotation3 = annotationFormatBuilder(specialCube, specialCube.annotationUID, 2, 'red')
        jumpToSpecialPoint([annotation1, annotation2, annotation3], true)
    }
}

const jumpToSpecialPoint = (annotations, isJump, nullPosition) => {
    enableTool('RectangleROI');

    const element1 = document.getElementsByClassName('viewport1')[0]
    const element2 = document.getElementsByClassName('viewport2')[0]
    const element3 = document.getElementsByClassName('viewport3')[0]
    const viewport1 = getEnabledElement(element1).viewport
    const viewport2 = getEnabledElement(element2).viewport
    const viewport3 = getEnabledElement(element3).viewport
    if (annotations.length === 0 && nullPosition) {
        nullPosition[0] = nullPosition[0] + 0.02 // fixed not display issue in SAGITTAL
        nullPosition[1] = nullPosition[1] + 0.02 // fixed not display issue in Cor
        nullPosition[2] = nullPosition[2] + 0.02 // fixed not display issue in Axi
        jumpToWorld(viewport1, nullPosition)
        jumpToWorld(viewport2, nullPosition)
        jumpToWorld(viewport3, nullPosition)
        const toolGroup = ToolGroupManager.getToolGroup(selectedToolGroupId);
        manualRender(toolGroup)
        return
    }
    addAnnotation(annotations[0], element1)
    addAnnotation(annotations[1], element2)
    addAnnotation(annotations[2], element3)
    if (isJump) {
        const centerPoint = getCenterPoint(annotations[0].eightPoints)
        // const centerPoint = annotations[0].eightPoints.point1
        centerPoint[0] = centerPoint[0] + 0.02 // fixed not display issue in SAGITTAL
        centerPoint[1] = centerPoint[1] + 0.02 // fixed not display issue in Cor
        centerPoint[2] = centerPoint[2] + 0.02 // fixed not display issue in Axi
        jumpToWorld(viewport1, centerPoint)
        jumpToWorld(viewport2, centerPoint)
        jumpToWorld(viewport3, centerPoint)
        const toolGroup = ToolGroupManager.getToolGroup('tt');
        manualRender(toolGroup)
    }
}

const getCenterPoint = (cube) => {
    const lowerBound = 0.04;
    const upperBound = 0.06;
    let randomNumber = Math.random() * (upperBound - lowerBound) + lowerBound;
    // randomNumber = 0
    const x = (cube.point1[0] + cube.point2[0] + randomNumber) / 2
    const y = (cube.point1[1] + cube.point3[1] + randomNumber) / 2
    const z = (cube.point1[2] + cube.point6[2] + randomNumber) / 2
    // const z = cube.point1[2]
    return [x,y,z]
}

const noduleDelete = (noduleList, item) => {
    const element1 = document.getElementsByClassName('viewport1')[0]
    const annotationList = getAnnotations('RectangleROI', element1)
    console.log(annotationList)
    for (let i = annotationList.length - 1; i >= 0; i--) {
        if (annotationList[i].eightPoints.annotationUID === item.annotationUID) {
            removeAnnotation(annotationList[i]['annotationUID'])
        }
    }
    console.log(annotationList)
    originalEightPoints.deleteCube(item)
    let nullPosition
    if (noduleList.length === 0) {
        nullPosition = objectCopy(item.point1)
        nullPosition[2] = nullPosition[2] + 0.01
        readAllCube(noduleList, null, nullPosition)
    } else {

        readAllCube(noduleList, null, 'deleted')
    }
}

const spaceMovementDetector = (event, eventType, specialId, allChecked) => {
    let targetViewPort
    let viewportBox
    let viewportId
    let centerPoint
    if (!notMPRSelected) {
        if (eventType === 'scrollWheel' &&  !specialId && allChecked) {
            enableTool('Crosshairs');
        }
    }
    if (eventType === 'createRectangle') {
        if (!isDraw) {
            rectangleToCross(false)
        }
        drawFinishSwitch(true)

        targetViewPort = event.target
        viewportBox = targetViewPort.parentElement
        viewportId = event.detail.viewportId

        centerPoint = fixNumber(getAnnotations('Crosshairs',viewportBox.children[0])[0].data.handles.toolCenter, 2)

    } else if (eventType === 'scrollWheel') {
        targetViewPort = event.srcElement
        viewportBox = event.currentTarget.parentElement
        const viewport = getEnabledElement(targetViewPort).viewport
        // console.log(viewport.getCamera().focalPoint)
        viewportId = event.detail.viewportId
        // centerPoint = fixNumber(getAnnotations('Crosshairs',viewportBox.children[0])[0].data.handles.toolCenter, 2)
        centerPoint = fixNumber(viewport.getCamera().focalPoint, 2)
    } else if (eventType === 'readData') {
        targetViewPort = event
        viewportBox = event.parentElement
        viewportId = specialId
        centerPoint = fixNumber(getAnnotations('Crosshairs',targetViewPort)[0].data.handles.toolCenter, 2)
    }

    const allRectangles = getAnnotations('RectangleROI', targetViewPort)
    // console.log('targetViewPort: ', targetViewPort.dataset.viewportUid, ', event: ', eventType)
    if (allRectangles && allRectangles.length > 0) {
        let eightPoints = []
        const rawData = originalPointStore.getCube('all')
        // only one
        let newSquare

        rawData.forEach( ele => {
            const tempPoints = {points: pointsObjectToArray(ele), annotationUID: ele.annotationUID}
            eightPoints.push(tempPoints)
        })
        allRectangles.forEach(ele => {
            if (!ele.isLocked) {
                newSquare = originalEightPoints.getCurrentAnnotation
            }
        })
        if (newSquare) {
            // console.log(newSquare)
            eightPoints = []
            originalEightPoints.setCube(newSquare)
            const allCubes = originalEightPoints.getCube('all')
            console.log(originalEightPoints.getCube('all'))
            allCubes.forEach(ele => {
                const tempPoints = {points: pointsObjectToArray(ele), annotationUID: ele.annotationUID}
                eightPoints.push(tempPoints)
            })
        }

        // console.log(eightPoints)
        const insideAllResult = checkPointInsideCube(centerPoint, eightPoints)
        insideAllResult.forEach(insideResult => {
            // console.log('insideResult: ',insideResult.data)
            if (insideResult.isInside) {
                // console.log("Inside!!!!!!!")
                let insideRectangles = []
                let insidePoints
                allRectangles.forEach(ele => {
                    if (ele.annotationUID.includes(insideResult.annotationUID)) {
                        insideRectangles.push(ele)
                        if (newSquare && ele.annotationUID.includes(newSquare.annotationUID)) {
                            insidePoints = newSquare
                        } else {
                            insidePoints = ele.eightPoints
                        }
                        // insidePoints = newSquare ? newSquare : ele.eightPoints
                    }
                })
                createFreshAnnotation(viewportBox, centerPoint, insideRectangles, insideResult.data, eventType, viewportId, insidePoints)
            } else {
                // console.log("no!!!!!!!")
            }
        })
    }
}

const createFreshAnnotation = (ele, centerPoint, allRectangles, insideInfo, eventType, viewportId, insidePoints) => {
    let ele1 = ele.children[0]
    let ele2 = ele.children[1]
    let ele3 = ele.children[2]

    let newData1
    let newData2
    let newData3
    allRectangles.forEach(item => {
        if (item.annotationUID.includes('index_1')) {
            newData1 = objectCopy(item)
        } else if (item.annotationUID.includes('index_2')) {
            newData2 = objectCopy(item)
        } else if (item.annotationUID.includes('index_3')) {
            newData3 = objectCopy(item)
        }
    })

    const eightPoints = insidePoints

    if ((insideInfo.isInsideZ && viewportId === 'CT_AXIAL' && eventType === 'scrollWheel') ||
        (insideInfo.isInsideZ && (eventType === 'createRectangle' || eventType === 'readData'))) {

        // Axial layer
        removeAnnotation(newData1.annotationUID)

        const square = objectCopy([eightPoints['point1'], eightPoints['point2'], eightPoints['point3'], eightPoints['point4']])

        square.forEach(point => {
            point[2] = centerPoint[2]
        })

        newData1.data.handles.points = square
        // console.log(newData1.data.handles.points)
        addAnnotation(newData1, ele1)
    }
    if ((insideInfo.isInsideX && viewportId === 'CT_SAGITTAL' && eventType === 'scrollWheel') ||
        (insideInfo.isInsideX && (eventType === 'createRectangle' || eventType === 'readData'))) {

        // SAGITTAL layer
        removeAnnotation(newData2.annotationUID)

        const square = objectCopy([eightPoints['point6'], eightPoints['point5'], eightPoints['point1'], eightPoints['point3']])

        square.forEach(point => {
            point[0] = centerPoint[0]
        })

        newData2.data.handles.points = square
        addAnnotation(newData2, ele2)
    }
    if ((insideInfo.isInsideY && viewportId === 'CT_CORONAL' && eventType === 'scrollWheel') ||
        (insideInfo.isInsideY && (eventType === 'createRectangle' || eventType === 'readData'))) {

        // CORONAL layer
        removeAnnotation(newData3.annotationUID)

        const square = objectCopy([eightPoints['point6'], eightPoints['point7'], eightPoints['point1'], eightPoints['point2']])

        square.forEach(point => {
            point[1] = centerPoint[1]
        })
        newData3.data.handles.points = square
        // console.log(newData3.data.handles.points)
        addAnnotation(newData3, ele3)
    }
}

const checkPointInsideCube = (pointToCheck, eightPoints) => {
    const possibilities = createAllPossiblePoints(pointToCheck)
    let result = []
    eightPoints.forEach(ele => {
        const thisInsideResult = arePointsInCube(possibilities, ele)
        if (thisInsideResult.isInside) {
            result.push(thisInsideResult)
        }
    })
    return result
}

function arePointsInCube(pointList, cubeVertices) {
    let insideData = {isInside: false, data: null, annotationUID: null}
    for (let i = 0; i < pointList.length; i ++) {
        insideData.data = isPointInCube(pointList[i], cubeVertices.points)
        insideData.annotationUID = cubeVertices.annotationUID
        if (insideData.data.isInsideX || insideData.data.isInsideY || insideData.data.isInsideZ) {
            insideData.isInside = true
        }
        break
    }
    return insideData;
}

function isPointInCube(point, cubeVertices) {
    const [x, y, z] = point;
    const EPSILON = 0.01;

    // Find min and max x, y, and z values of the cube vertices
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (const vertex of cubeVertices) {
        const [vx, vy, vz] = vertex;
        if (vx < minX) minX = vx;
        if (vx > maxX) maxX = vx;
        if (vy < minY) minY = vy;
        if (vy > maxY) maxY = vy;
        if (vz < minZ) minZ = vz;
        if (vz > maxZ) maxZ = vz;
    }
    // Check if point is inside cube
    const isInsideX = x + EPSILON >= minX && x - EPSILON <= maxX;
    const isInsideY = y + EPSILON >= minY && y - EPSILON <= maxY;
    const isInsideZ = z + EPSILON >= minZ && z - EPSILON <= maxZ;
    // if (!isInsideZ) {
    //     console.log('maxZ: ',maxZ,', minZ: ',minZ,', z: ',z)
    // }
    return  {isInsideX, isInsideY, isInsideZ}
    // return isInsideX || isInsideY || isInsideZ;
}

const createAllPossiblePoints = (point) => {
    let possibilities = [];
    let delta = 0.01;
    for (let i = 0; i < 3; i++) {
        let x = point[i];
        possibilities.push([x - delta, x, x + delta]);
    }
    let result = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            for (let k = 0; k < 3; k++) {
                let p = [possibilities[0][i], possibilities[1][j], possibilities[2][k]];
                result.push(p);
            }
        }
    }
    return result;
}

const removeUnSavedCube = (cube) => {
    if (cube === 'all') {
        originalEightPoints.deleteCube('all')
    } else {
        const element1 = document.getElementsByClassName('viewport1')[0]
        const allRectangles = getAnnotations('RectangleROI', element1)

        // console.log(allRectangles)
        if (allRectangles && allRectangles.length > 0) {
            for (let i = allRectangles.length - 1; i >= 0; i --) {
                if (!allRectangles[i].isLocked) {
                    allRectangles[i].annotationUID = allRectangles[i].annotationUID.substring(0, allRectangles[i].annotationUID.length-8)
                    originalEightPoints.deleteCube(allRectangles[i])
                    removeAnnotation(allRectangles[i].annotationUID)
                }
            }
        }
        const toolGroup = ToolGroupManager.getToolGroup('tt');
        manualRender(toolGroup)
        if (cube === 'manual') {
            drawFinishSwitch(false)
        }
    }
}

const saveCube = (volumeId) => {
    const element1 = document.getElementsByClassName('viewport1')[0]
    const allRectangles = getAnnotations('RectangleROI', element1)


    const newRectangles = []
    if (allRectangles && allRectangles.length > 0) {
        console.log(allRectangles)
        const eightPoints = originalPointStore.getCurrentAnnotation
        allRectangles.forEach(ele => {
            if (!ele.isLocked) {
                newRectangles.push(ele)
            }
        })
        if (newRectangles.length > 0) {
            let isInValidCube = false

            newRectangles.forEach(ele => {
                console.log(ele.data.cachedStats['volumeId:' + volumeId])
                if (!ele.data.cachedStats['volumeId:' + volumeId].area) {
                    isInValidCube = true
                }
            })
            if (isInValidCube) {
                for (let i = 1; i <= 3; i ++) {
                    removeAnnotation(eightPoints.annotationUID + '_index_' + i)
                }
                originalEightPoints.deleteCube(eightPoints)
                originalEightPoints.removeCurrentAnnotation()
                const newC = getAnnotations('RectangleROI', element1)
                console.log(newC)
                const nullPosition = objectCopy(eightPoints.point1)
                nullPosition[2] = nullPosition[2] + 0.01
                jumpToSpecialPoint([], null, nullPosition)
                return false
            } else {
                return eightPoints
            }
        } else {
            console.log('No new cube to save!!!!')
        }
    } else {
        console.log('No cube!!!!')
    }
}

const showAll = () => {
    showAllAnnotations()
}

const fixNumber = (numArray, length) => {
    return numArray.map(num => {
        return Number(num.toFixed(length))
    })
}

const baseAnnotationUID = (annotationUID) => {
    return annotationUID.indexOf('_index_') > 0 ?annotationUID.substring(0, annotationUID.indexOf('_index_')) : annotationUID
}

const objectCopy = (data) => {
    return (JSON.parse(JSON.stringify(data)))
}

const pointsObjectToArray = (points) => {
    let eightPoints = []
    if (!(points instanceof Array)) {
        for (let i = 1; i < 9; i ++ ) {
            eightPoints[i-1] = points['point' + i]
        }
    }
    return eightPoints
}

const cubeFormatBuilder = (cube, volumeId, seriesId) => {
    // console.log(cube)
    const layer1 = cube[0]
    const cachedStats = layer1.data.cachedStats

    const element1 = document.getElementsByClassName('viewport-element')[0].parentElement
    const viewport = getEnabledElement(element1).viewport
    const imageData = viewport.getImageData(volumeId).imageData
    const totalAmount = viewport.getImageData(volumeId).dimensions[2]

    let stats
    let frameIndex
    const middleZ = (layer1.eightPoints.point6[2] + layer1.eightPoints.point1[2]) / 2
    const pointMiddle = [layer1.eightPoints.point1[0], layer1.eightPoints.point1[1], middleZ]

    for (let key in cachedStats) {
        // the image order is reversed in MPR, so it should be minus by total amount
        frameIndex = totalAmount - transformWorldToIndex(imageData, pointMiddle)[2]
        stats = cachedStats[key]
    }
    const { worldWidth, worldHeight } = getWorldWidthAndHeightFromCorners(layer1.metadata.viewPlaneNormal, layer1.metadata.viewUp, layer1.eightPoints.point1, layer1.eightPoints.point4)
    const format ={
        "boxDTO": {
            "annotationUID": layer1.eightPoints.annotationUID,
            "point1": layer1.eightPoints.point1,
            "point2": layer1.eightPoints.point2,
            "point3": layer1.eightPoints.point3,
            "point4": layer1.eightPoints.point4,
            "point5": layer1.eightPoints.point5,
            "point6": layer1.eightPoints.point6,
            "point7": layer1.eightPoints.point7,
            "point8": layer1.eightPoints.point8
        },
        "centerFrame": frameIndex,
        "featuresType": "某种结节",
        "height": worldHeight.toFixed(2),
        "hu": stats.mean,
        "location": "某个位置",
        "seriesInstanceUid": seriesId,
        "checked": false,
        "size": (Math.pow(Math.sqrt(Math.abs(stats.area)) / 2, 3) * Math.PI).toFixed(1),
        "width": worldWidth.toFixed(2)
    }
    return format
}

const annotationFormatBuilder = (eightPointsData, annotationUID, axis, color) => {
    let eightPoints = pointsObjectToArray(eightPointsData)
    let singleUID

    // console.log(eightPoints)
    const cameraView = cameraViewDirection[axis]
    let squarePoints
    switch (axis){
        case (0) :
            squarePoints = [eightPoints[0], eightPoints[1], eightPoints[2], eightPoints[3]]
            singleUID = annotationUID + '_index_1'
            break;
        case (1) :
            squarePoints = [eightPoints[4], eightPoints[5], eightPoints[2], eightPoints[0]]
            singleUID = annotationUID + '_index_2'
            break;
        case (2) :
            squarePoints = [eightPoints[5], eightPoints[6], eightPoints[0], eightPoints[1]]
            singleUID = annotationUID + '_index_3'
            break;
    }

    const annotationFormat ={
        "invalidated": true,
        "highlighted": true,
        "metadata": {
        "toolName": "RectangleROI",
            "viewPlaneNormal": cameraView.viewPlaneNormal,
            "viewUp": cameraView.viewUp,
            "FrameOfReferenceUID": "",
            "referencedImageId": ""
    },
        "data": {
        "label": '',
            "handles": {
            "points": [
                squarePoints[0], squarePoints[1], squarePoints[2], squarePoints[3]
            ],
                "textBox": {
                "hasMoved": false,
                    "worldPosition": [

                ],
                    "worldBoundingBox": {
                    "topLeft": [

                    ],
                        "topRight": [

                    ],
                        "bottomLeft": [

                    ],
                        "bottomRight": [

                    ]
                }
            },
            "activeHandleIndex": null
        },
        "cachedStats": {
            "volumeId:cornerstoneStreamingImageVolume:CT_VOLUME_ID": {
                "Modality": "CT",
                    "area": 0,
                    "mean": 0,
                    "stdDev": 0,
                    "max": 0,
                    "areaUnit": "mm"
            }
        }
    },
        "annotationUID": singleUID,
        "isLocked": true,
        "isVisible": true,
        "lineColor": color === 'white' ? "rgb(239,233,233)": "rgb(255,252,222)",
        "eightPoints": {
            "point1": eightPoints[0],
            "point2": eightPoints[1],
            "point3":eightPoints[2],
            "point4": eightPoints[3],
            "point5": eightPoints[4],
            "point6": eightPoints[5],
            "point7": eightPoints[6],
            "point8": eightPoints[7],
            "annotationUID": annotationUID
        }
    }
    return annotationFormat
}

export {viewportId1, viewportId2 , viewportId3, toolsCornerstoneAddHandler, addToolsToGroup,
    toolActiveHandler, toolDisabledHandler, changeMPRTool,
    getMouseDownData, getMouseUpData, showAll, spaceMovementDetector,getCenterPoint,
    saveCube, readAllCube, noduleDelete, drawFinishSwitch, removeUnSavedCube, cubeFormatBuilder,
    displayAnnotationsHandler, setAllToolPassive, setToolGroupId
}
