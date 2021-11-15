import React, {useState, useEffect} from 'react'
import { useRouter } from 'next/dist/client/router';
import Head from 'next/head'
import Image from 'next/image'

import NewReview from '../review/NewReview'
import ListReviews from '../review/ListReviews'
import RoomFeatures from './RoomFeatures';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import { Carousel } from 'react-bootstrap';

import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify';
import {clearErrors} from '../../redux/actions/roomActions'

import { checkBooking, getBookedDates} from '../../redux/actions/bookingActions'
import { CHECK_BOOKING_RESET} from '../../redux/constants/bookingConstants';

import axios from 'axios';

const RoomDetails = () => {

    const [checkInDate, setCheckInDate] = useState()
    const [checkOutDate, setCheckOutDate] = useState()
    const [daysOfStay, setDaysOfStay] = useState()


    const dispatch = useDispatch()
    const router = useRouter()

    //pulling out the dates from action in array
    const { dates } = useSelector(state => state.bookedDates);
    const { user } = useSelector(state => state.loadedUser);
    const { room, error } = useSelector(state => state.roomDetails);
    const { available, loading: bookingLoading} = useSelector(state => state.checkBooking)

    //we cannot pass the array of dates from the backend as they are in ISO form so we have to wrap each date inside a date object
    const excludedDates = []

    dates.forEach(date => {
        excludedDates.push(new Date(date))
    });


    const onChange = (dates) => {
        const [checkInDate, checkOutDate] = dates;

        setCheckInDate(checkInDate)
        setCheckOutDate(checkOutDate)

        if (checkInDate && checkOutDate) {

            // Calclate days of stay

            const days = Math.floor(((new Date(checkOutDate) - new Date(checkInDate)) / 86400000) + 1)

            setDaysOfStay(days)

            dispatch(checkBooking(id, checkInDate.toISOString(), checkOutDate.toISOString()))
        }
    }

    const {id} = router.query;

    const newBookingHandler = async () =>{

        const bookingData = {
            room: router.query.id,
            checkInDate,
            checkOutDate,
            daysOfStay,
            amountPaid: 0,
            paymentInfo:{
                id:'Id of Payment',
                status: 'Status of Payment'
            }
        }
        try{

            const config = {
                headers:{
                    'Content-Type':'application/json'
                }
            }

            const {data} = await axios.post('/api/bookings', bookingData, config)
            console.log(data)

        } catch(error){
            console.log(error.response)
        }
    }

    useEffect(() => {

     dispatch(getBookedDates(id))

     if (error) {
        toast.error(error);
        dispatch(clearErrors())
    }


     return () =>{
         dispatch({ type: CHECK_BOOKING_RESET})
     }
    },[dispatch, id, error])

    return (
        <>
            <Head>
                    <title>{room.name} - Asian Hotel</title>
            </Head>
           
    <div className="container container-fluid">
        <h2 className='mt-5'>{room.name}</h2>
        <p>{room.address}</p>

        <div className="ratings mt-auto mb-3">
            <div className="rating-outer">
              <div className="rating-inner" style={{width: `${(room.ratings /5) *100}%`}}></div>
            </div>
            <span id="no_of_reviews">({room.numOfReviews})</span>
          </div>

            <Carousel hover='pause'>
                {room.images && room.images.map(image =>(
                    <Carousel.Item key={image.public_id}>
                        <div style={{width:'100%', height:'440px', textAlign:'center'}}>
                           <Image
                               className='d-block m-auto'
                               src={image.url} 
                               alt={room.name}
                               layout='fill'
                           />
                        </div>
                    </Carousel.Item>
                ))}
            </Carousel>

          <div className="row my-5">
              <div className="col-12 col-md-6 col-lg-8">
                  <h3>Description</h3>
                  <p>{room.description}</p>

                        <RoomFeatures room={room}/>

              </div>

              <div className="col-12 col-md-6 col-lg-4">
                  <div className="booking-card shadow-lg p-4">
                    <p className='price-per-night'><b>${room.pricePerNight}</b> / night</p>

                    <hr />

                            <p className="mt-5 mb-3">
                                Pick Check In & Check Out Date
                            </p>

                            <DatePicker
                                className='w-100'
                                selected={checkInDate}
                                onChange={onChange}
                                startDate={checkInDate}
                                endDate={checkOutDate}
                                minDate={new Date()}
                                excludeDates={excludedDates}
                                selectsRange 
                                inline
                            />

                        {available === true && 
                            <div className="alert alert-success my-3 font-weight-bold">
                                Room is available. Book Now.
                            </div>
                        }

                        {available === false && 
                            <div className="alert alert-danger my-3 font-weight-bold">
                                Room is not available. Try different Dates or another Room.
                            </div>
                        }

                        {available && !user && 
                            <div className="alert alert-danger my-3 font-weight-bold">
                                Please Login to book room.
                            </div>
                        }

                        {available && user && 
                            <button className="btn btn-block py-3 booking-btn" onClick={newBookingHandler}>Pay</button>
                        }
                    

                  </div>
              </div>
          </div>

            <NewReview/>
              {room.reviews && room.reviews.length > 0 ?
                    <ListReviews reviews={room.reviews} />
                    :
                    <p><b>No Reviews on this room</b></p>
                }

    </div>
 

        </>
    )
}

export default RoomDetails
