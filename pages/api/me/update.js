import nc from 'next-connect'
import dbConnect from '../../../config/dbConnect';

import { updateProfile } from '../../../controllers/authControllers';

import {isAuthenticatedUser} from '../../../middlewares/auth'
import onError from '../../../middlewares/errors'

const handler = nc({ onError});

dbConnect();

handler
    .use(isAuthenticatedUser)  //only authenticated user can access this route
    .put(updateProfile)
 
export default handler;