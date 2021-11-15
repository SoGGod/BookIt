import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

import User from '../../../models/user'
import dbConnect from '../../../config/dbConnect'

export default NextAuth({
    session:{
        jwt: true
    },
    providers: [   
            Providers.Credentials({        //here there are many options in Providers. but we have used our own Credentials
                async authorize(credentials){

                    dbConnect();
                     const {email, password} = credentials

                     //Check if Email and password is entered
                     if(!email || !password){
                         throw new Error('Please Enter the Email or Password')
                     }

                     //find user in the database
                     const user = await User.findOne({email}).select('+password')

                     //check if user exists or not
                     if(!user){
                         throw new Error('Invalid Email or Password')
                     }

                     //check if password is correct or not
                     const isPasswordMatched = await user.comparePassword(password)

                     //check if password is matched or not to the user
                     if(!isPasswordMatched){
                         throw new Error('Invalid Email or Password')
                     }

                     return Promise.resolve(user)
                }
            })
    ],
    callbacks:{
        jwt: async (token, user) =>{

            user && (token.user = user)
            return Promise.resolve(token)

        },
        session: async (session, user) =>{

            session.user = user.user
            return Promise.resolve(session)
        }
    }
})