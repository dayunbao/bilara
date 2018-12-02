import {
    REQUEST_SEGMENT_DATA, RECEIVE_SEGMENT_DATA, FAIL_SEGMENT_DATA,
} from '../actions/segment-data.js';
import {
    UPDATE_SEGMENT,
} from '../actions/segment.js';


export const segmentData = (state = {}, action) => {
    const uid = action.uid;
    switch (action.type) {
        case REQUEST_SEGMENT_DATA:
            return {
                ...state,
                data: null,
                uid: uid,
                failure: false,
                isFetching: true
            }
        case RECEIVE_SEGMENT_DATA:
            return {
                ...state,
                data: action.data,
                uid: uid,
                failure: false,
                isFetching: false
            }
        case FAIL_SEGMENT_DATA:
            return {
                ...state,
                uid: uid,
                failure: true,
                isFetching: false
            }
        case UPDATE_SEGMENT:
            return {
                ...state,
                data: {
                    ...state.data,
                    [action.dataType]: {
                        ...state.data[action.dataType],
                        [action.segmentId]: action.value
                    }
                }
            }
        default:
            return state;
    }
}