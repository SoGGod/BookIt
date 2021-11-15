import { combineReducers } from "redux";

import { allRoomsReducer, roomDetailsReducer, newReviewReducer, checkReviewReducer, newRoomReducer, roomReducer, roomReviewsReducer,reviewReducer  } from "./roomReducers";

import { authReducer, userReducer, forgotPasswordReducer, loadedUserReducer, allUsersReducer, userDetailsReducer } from "./userReducers";

import {checkBookingReducer, bookedDatesReducer, bookingsReducer, bookingDetailsReducer, bookingReducer} from './bookingReducers'


const reducer = combineReducers({
        allRooms: allRoomsReducer,
        roomDetails: roomDetailsReducer,
        auth: authReducer,
        user: userReducer,
        loadedUser: loadedUserReducer,
        forgotPassword: forgotPasswordReducer,
        checkBooking: checkBookingReducer,
        bookedDates: bookedDatesReducer,
        bookings: bookingsReducer,
        bookingDetails: bookingDetailsReducer,
        newReview: newReviewReducer,
        checkReview: checkReviewReducer,
        newRoom: newRoomReducer,
        room: roomReducer,
        booking: bookingReducer,
        allUsers: allUsersReducer,
        userDetails: userDetailsReducer,
        roomReviews: roomReviewsReducer,
        review: reviewReducer


})

export default reducer