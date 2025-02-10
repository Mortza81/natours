// const stripe = Stripe("pk_test_51PKdk9BX6GQqAP1BIw8nkSB0JIeeqQO3XQSirhbTtWcFzwyOXtXXWqMtzLlHrtwEyHlCZFuW25gI1WqeAFcwb10200Bdt7duEr");
import axios from 'axios'
import { showAlert } from './alerts'
export const bookTour = async (tourId, price) => {
  try {
    const res = await axios({
      method: 'post',
      url: `/api/v1/booking/`,
      data: {
        tour: tourId,
        price,
      },
    })
    if (res.data.status == 'success') {
      showAlert('success', 'Success')
      setTimeout(() => {
        location.assign('/')
      }, 1500)
    }
  } catch (err) {
    showAlert('error',err.response.data.message)
  }
}
export const cancelTour = async (bookingId)=>{
    try {
        const res = await axios({
          method: 'delete',
          url: `/api/v1/booking/${bookingId}`,
        })
        if (res.data.status == 'success') {
          showAlert('success', 'Cancelled')
          setTimeout(() => {
            location.assign('/my-tours')
          }, 1500)
        }
      } catch (err) {
        showAlert('error', err.message)
      }
}
