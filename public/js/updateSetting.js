import axios from 'axios'
import { showAlert } from './alerts'
export const updateData = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:7000/api/v1/users/updatePassword'
        : 'http://localhost:7000/api/v1/users/updateMe'

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    })

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`)
      setTimeout(()=>{
        location.reload()
      },1500)
    }
  } catch (err) {
    showAlert('error', err.response.data.message)
  }
}