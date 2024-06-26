import {defineStore} from "pinia";
interface StoreButton {
    buttons: any,
    volumeIndex: any,
}

export const mprButtonStore = defineStore({
    id: 'app-button',
    state: (): StoreButton => ({
        buttons: [{
            id: 1,
            icon: "icon-shizixian",
            text: "十字针",
            active: true,
            disabled: false,
        },
        {
            id: 2,
            icon: "icon-xiankuang1",
            text: "勾选框",
            active: false,
            disabled: false,
        },
        {
            id: 3,
            icon: "icon-qingchu",
            text: "清除标记",
            active: false,
            disabled: true,
        },
        ],
        volumeIndex: 0,
    }),
    getters: {
        // getters with parameters
        getButtonsStatus:(state) => (id: any) =>{
            if (id === 'all') {
                return state.buttons
            } else {
                return state.buttons.find((button: any) =>
                    button.id === id
                )
            }
        },
        getVolumeIndex():  any{
            return this.volumeIndex
        }
    },
    actions: {
        setButtonsStatus(id, active, disabled) {
            this.buttons.forEach(ele => {
                if (ele.id === id) {
                    ele.active = active
                    ele.disabled = disabled
                }
            })
        },
        setVolumeIndex() {
            this.volumeIndex += 1
        }
    },
});
