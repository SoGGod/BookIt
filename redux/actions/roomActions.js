import {useState} from 'react'
import axios from "axios";
import absoluteUrl from "next-absolute-url";


import {
    ALL_ROOMS_SUCCESS,
    ALL_ROOMS_FAIL,

    CLEAR_ERRORS

} from '../constants/roomConstants'

//get all rooms
export const getRooms = (req) => async(dispatch) => {
    try {
        const { origin } = absoluteUrl(req)
       const {data} = await axios.get(`${origin}/api/rooms`)
        
       dispatch({
           type: ALL_ROOMS_SUCCESS,
           payload : data
       })
    } catch (error) {
        dispatch({
            type: ALL_ROOMS_FAIL,
            //not similar to the tutorial and found on stackoverflow
            //the actual code was payload: error.response.data.message
            payload: ((error || {}).response || {}).data || 'Error Unxpected'  //here read propert 'data' of undefined was given so i manually give the data for error payload
        })
    }

}


//clear errors 
export const clearErrors = () => async (dispatch) =>{
    dispatch({
        type: CLEAR_ERRORS
    })
}