import {showAlert} from "./alerts"
import axios from "axios"
export const createReview=async (data)=>{
    try{
        const res=await axios({
            method:"post",
            url:"/api/v1/reviews",
            data
        })
        if(res.data.status=='success'){
            showAlert('success','Review created!')
            setTimeout(() => {
                location.reload()
              }, 1500)
        }
    }catch(error){
        showAlert('error',error.response.data.message)
    }
}