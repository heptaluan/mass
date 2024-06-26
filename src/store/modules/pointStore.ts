import {defineStore} from "pinia";
interface StoreData {
    point1: any,
    point2: any,
    point3: any,
    point4: any,
    point5: any,
    point6: any,
    point7: any,
    point8: any,
    annotationUID: any,
    cubeList: any,
    dicomThickness: any
}

export const pointStore = defineStore({
    id: 'app-data',
    state: (): StoreData => ({
        point1: null,
        point2: null,
        point3: null,
        point4: null,
        point5: null,
        point6: null,
        point7: null,
        point8: null,
        annotationUID: null,
        cubeList: [],
        dicomThickness: null
    }),
    getters: {
        getCurrentAnnotation(): any {
            return {
                point1: this.point1,
                point2: this.point2,
                point3: this.point3,
                point4: this.point4,
                point5: this.point5,
                point6: this.point6,
                point7: this.point7,
                point8: this.point8,
                annotationUID: this.annotationUID
            }
        },
        // getters with parameters
        getCube:(state) => (uid: any) =>{
            if (uid === 'all') {
                return state.cubeList
            } else {
                return state.cubeList.find((cube: any) =>
                    cube.annotationUID === uid
                )
            }
        },
        getDicomThickness(): any{
            return this.dicomThickness
        }
    },
    actions: {
        setCube(cube: any) {
            let isExisted = false
            let differentIndex = -1
            for (let i = 0; i <= this.cubeList.length; i++) {
                if (this.cubeList[i] && this.cubeList[i].annotationUID === cube.annotationUID) {
                    isExisted = true
                    for (const key in cube) {
                        if (JSON.stringify(cube[key]) !== JSON.stringify(this.cubeList[i][key])) {
                            differentIndex = i
                        }
                    }
                }
            }
            if (!isExisted) {
                this.cubeList.push( cube )
            } else if (isExisted && differentIndex >= 0) {
                this.cubeList[differentIndex] = cube
            }
        },
        deleteCube(cube: any) {
            if (cube === 'all') {
                this.cubeList = []
            } else {
                for (let i = 0; i <= this.cubeList.length; i++) {
                    if (this.cubeList[i] && this.cubeList[i].annotationUID === cube.annotationUID) {
                        this.cubeList.splice(i, 1)
                    }
                }
            }
        },
        setCurrentAnnotation(points: any, annotationUID: any) {

            this.point1 = points.point1;
            this.point2 = points.point2;
            this.point3 = points.point3;
            this.point4 = points.point4;
            this.point5 = points.point5;
            this.point6 = points.point6;
            this.point7 = points.point7;
            this.point8 = points.point8;
            this.annotationUID = annotationUID;
        },
        removeCurrentAnnotation() {
            this.point1 = null;
            this.point2 = null;
            this.point3 = null;
            this.point4 = null;
            this.point5 = null;
            this.point6 = null;
            this.point7 = null;
            this.point8 = null;
            this.annotationUID = null;
        },
        setOnePoint(changedValue: any, name: any, changedAxis: any) {
            for (let i = 0; i < changedAxis.length; i ++) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                // this[name][changedAxis[i]] = Number(changedValue[i].toFixed(4))
                this[name][changedAxis[i]] = changedValue[i]
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            // console.log(name, ': ',this[name])
        },
        setDicomThickness(thickness: any) {
            this.dicomThickness = thickness * 2
        }
    },
});
