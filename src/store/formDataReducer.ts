import lodash from 'lodash';

const initialState = {
    formDatas: new Map(),
}

export const formDataReducer =
    (state = initialState, action: { type: string, id: number, formData: any }) => {
        switch (action.type) {
            case "ADD": {
                const copyState = lodash.cloneDeep(state.formDatas);
                copyState.set(action.id, action.formData);
                console.log("formDataReducer ADD");
                return { formDatas: copyState };
            };
        }
        return state;
    };
