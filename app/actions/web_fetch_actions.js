import { createActions } from 'redux-actions';

const TYPES = {
    SET_WEB_FETCH_STATUS : 'SET_WEB_FETCH_STATUS',
};

export const {
    setWebFetchStatus
} = createActions(
    TYPES.SET_WEB_FETCH_STATUS
);
