import axios from 'axios'
import { showAlert } from './alerts'

export const createTour = async (data) => {
  try {
    const res = await axios({
      method: 'post',
      data,
      url: '/api/v1/tours',
    })
    if (res.data.status == 'success') {
      showAlert('success', 'Success')
      setTimeout(() => {
        location.assign('/me/create-tour')
      }, 1500)
    }
  } catch (error) {
    showAlert('error', error.response.data.message)
  }
}
