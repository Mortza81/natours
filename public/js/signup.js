import axios from "axios";
import { showAlert } from "./alerts";
export const signup=async (data)=>{
    try{
    const res=await axios({
        url:'http://localhost:7000/api/v1/users/signup',
        data,
        method:'post'
    })
    if(res.data.status=='success'){
        showAlert('success','welcome to natours')
        setTimeout(() => {
            location.assign('/me')
          }, 1500)
    }
    }catch(err){
        showAlert('error',err.response.data.message)
    }

}