import { createStore, applyMiddleware } from "redux";
import { HYDRATE, createWrapper } from "next-redux-wrapper";
import ThunkMiddleware from "redux-thunk";
import reducers from './reducers/reducers'

const bindMiddlware = (middlware) =>{
    if(process.env.NODE__ENV === 'production'){
        const {composeWithDevTools} = require('redux-devtools-extension')
        return composeWithDevTools(applyMiddleware( ...middlware))
    }

    return applyMiddleware( ...middlware)
}

const reducer = (state, action) =>{
    if(action.type === HYDRATE){
        const nextState ={
            ...state,
            ...action.payload
        }
        return nextState
    } else{
        return reducers(state, action)
    }
}

const initStore = () =>{
    return createStore(reducer, bindMiddlware([ThunkMiddleware]))
}

export const wrapper = createWrapper(initStore);