/*
 *
 * Form reducer
 *
 */

import { fromJS, List, Map } from 'immutable';
import { findIndex, upperFirst } from 'lodash';
import {
  CHANGE_INPUT,
  CHANGE_INPUT_ATTRIBUTE,
  CONNECTIONS_FETCH_SUCCEEDED,
  CONTENT_TYPE_ACTION_SUCCEEDED,
  CONTENT_TYPE_CREATE,
  CONTENT_TYPE_FETCH_SUCCEEDED,
  REMOVE_CONTENT_TYPE_REQUIRED_ERROR,
  RESET_FORM_ERRORS,
  RESET_IS_FORM_SET,
  SET_ATTRIBUTE_FORM,
  SET_ATTRIBUTE_FORM_EDIT,
  SET_FORM,
  SET_FORM_ERRORS,
  SET_BUTTON_LOADING,
  UNSET_BUTTON_LOADING,
} from './constants';
import {
  MODELS_FETCH_SUCCEEDED  
} from 'containers/App/constants'

/* eslint-disable new-cap */

const initialState = fromJS({
  didCheckErrors: false,
  connectionsSelectOptions: List(),
  connectionOptionsFetchSucceeded: false,
  modelsSelectOptions: List(),
  form: List(),
  formValidations: List(),
  formErrors: List(),
  initialData: Map(),
  initialDataEdit: Map(),
  modifiedDataAttribute: Map(),
  modifiedData: Map(),
  modifiedDataEdit: Map(),
  isFormSet: false,
  shouldRefetchContentType: false,
  updatedContentType: false,
  showButtonLoading: false,
});

function formReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_INPUT:
      return state
        .updateIn([action.objectToModify, action.key], () => action.value);
    case CHANGE_INPUT_ATTRIBUTE:
      return state.updateIn(action.keys, () => action.value);
    case CONNECTIONS_FETCH_SUCCEEDED:
      return state
        .set('connectionsSelectOptions', List(action.connections))
        .set('connectionsOptionsFetchSucceeded', !state.get('connectionOptionsFetchSucceeded'));
    case MODELS_FETCH_SUCCEEDED:
      const inheritableModels = action.data.models
        // @TODO
        // .filter(({ name }) => name !== currentModelName)
        .map(({ name }) => ({
          name: upperFirst(name),
          value: name,
        }))
      return state
        .set('modelsSelectOptions', List([{name: '--Select--', value: ''}, ...inheritableModels]))
        // .set('modelOptionsFetchSucceeded', !state.get('modelOptionsFetchSucceeded'));
    case CONTENT_TYPE_ACTION_SUCCEEDED:
      return state
        .set('shouldRefetchContentType', !state.get('shouldRefetchContentType'))
        .set('initialDataEdit', state.get('modifiedDataEdit'))
        .set('updatedContentType', !state.get('updatedContentType'))
        .set('isFormSet', false);
    case CONTENT_TYPE_CREATE: {
      if (action.shouldSetUpdatedContentTypeProp) {
        return state
          .set('isFormSet', false)
          .set('updatedContentType', !state.get('updatedContentType'));
      }

      return state.set('isFormSet', false);
    }
    case CONTENT_TYPE_FETCH_SUCCEEDED:
      return state
        .set('initialDataEdit', action.data)
        .set('modifiedDataEdit', action.data);
    case REMOVE_CONTENT_TYPE_REQUIRED_ERROR:
      return state
        .update('formErrors', (list) => list.splice(findIndex(state.get('formErrors').toJS(), ['target', 'name']), 1))
        .set('didCheckErrors', !state.get('didCheckErrors'));
    case RESET_FORM_ERRORS:
      return state
        .update('didCheckErrors', v => v = !v)
        .set('formErrors', List());
    case RESET_IS_FORM_SET:
      return state
        .set('isFormSet', false)
        .update('modifiedData', () => Map({}));
    case SET_ATTRIBUTE_FORM: {
      if (state.get('isFormSet')) {
        return state
          .set('form', Map(action.form))
          .set('didCheckErrors', !state.get('didCheckErrors'));
      }

      return state
        .set('isFormSet', true)
        .set('form', Map(action.form))
        .set('formValidations', List(action.formValidations))
        .set('modifiedDataAttribute', action.attribute);
    }
    case SET_ATTRIBUTE_FORM_EDIT: {
      if (state.get('isFormSet')) {
        return state
          .set('form', Map(action.form))
          .set('didCheckErrors', !state.get('didCheckErrors'));
      }

      return state
        .set('isFormSet', true)
        .set('form', Map(action.form))
        .set('formValidations', List(action.formValidations))
        .set('modifiedDataAttribute', action.attribute);
    }
    case SET_BUTTON_LOADING:
      return state.set('showButtonLoading', true);
    case UNSET_BUTTON_LOADING:
      return state.set('showButtonLoading', false);
    case SET_FORM: {
      if (state.get('isFormSet')) {
        return state.set('form', Map(action.form));
      }

      return state
        .set('isFormSet', true)
        .set('form', Map(action.form))
        .set('formValidations', List(action.formValidations))
        .set('initialData', action.data)
        .set('modifiedData', action.data);
    }
    case SET_FORM_ERRORS:
      return state
        .set('formErrors', List(action.formErrors))
        .set('didCheckErrors', !state.get('didCheckErrors'));
    default:
      return state;
  }
}

export default formReducer;
