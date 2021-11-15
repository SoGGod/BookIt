import RoomDetails from '../../components/room/RoomDetails'
import Layout from '../../components/layouts/Layout'
 
import { getRoomDetails } from '../../redux/actions/roomActions'

import { wrapper } from '../../redux/store'
export default function RoomDetailsPage(){
  return(
    <Layout>
      <RoomDetails title="Room Details"/>
    </Layout>
  )
}


export const getServerSideProps = wrapper.getServerSideProps((store) => async ({ req , params}) => {
  /* cannot use params.id because in roomAction req and id are dispatched and by writing only params it would do the job */
  // await store.dispatch(getRoomDetails(req, params.id))
  await store.dispatch(getRoomDetails(req, params.id))

})
  
        /* after the version update of next-redux-wrapper this format cannot be used */
// export const getServerSideProps = wrapper.getServerSideProps(async({req, params,store}) =>{
//   await store.dispatch(getRoomDetails(req, params.id))
// })

