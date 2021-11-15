import nc from 'next-connect'
import dbConnect from '../../config/dbConnect'

import { currentUserProfile } from '../../controllers/authControllers'

import { isAuthenticatedUser } from '../../middlewares/auth'
import onError from '../../middlewares/errors'

const handler = nc({ onError });

dbConnect();

handler.use(isAuthenticatedUser).get(currentUserProfile)  //here before running currentProfileUser we have to run isAutenicated user to get the session of the particular user

export default handler;