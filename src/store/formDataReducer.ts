import lodash from 'lodash';

const initialState = {
  formDatas: new Map(),
};

const formDataReducer = (
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: { type: string; id: number; formData: any } // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  switch (action.type) {
    case 'ADD': {
      const copyState = lodash.cloneDeep(state.formDatas);
      copyState.set(action.id, action.formData);
      return { formDatas: copyState };
    }
    default:{
      break;
    }
  }
  return state;
};

export default formDataReducer;