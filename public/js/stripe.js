const stripe = Stripe("pk_test_51PKdk9BX6GQqAP1BIw8nkSB0JIeeqQO3XQSirhbTtWcFzwyOXtXXWqMtzLlHrtwEyHlCZFuW25gI1WqeAFcwb10200Bdt7duEr");
import axios from 'axios'
export const bookTour=async (tourId)=>{
    const session=await axios({
        method:'get',
        url:`/api/v1/booking/checkout-session/${tourId}`
    })
    await stripe.redirectToCheckout({
        sessionId:session.data.session.id
    })
}