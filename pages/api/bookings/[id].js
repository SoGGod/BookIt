import nc from 'next-connect'
import dbConnect from '../../../config/dbConnect';

import { getBookingDetails } from '../../../controllers/bookingControllers';

import {isAuthenticatedUser} from '../../../middlewares/auth'
import onError from '../../../middlewares/errors'

const handler = nc({ onError});

dbConnect();

handler
    .use(isAuthenticatedUser)  //only authenticated user can access this route
    .get(getBookingDetails)
 
export default handler;