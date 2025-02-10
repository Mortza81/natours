import { login, logout } from './login'
import { updateData } from './updateSetting'
import { bookTour, cancelTour } from './booking'
import { signup } from './signup'
import { createReview } from './review'
import {createTour} from "./tour"

const createTourForm = document.querySelector('.create-tour-form')
const reviewForm = document.querySelector('.review-form')
const cancelBookingBtn = document.querySelector('.cancel-tour')
const bookBtn = document.querySelector('.bookbtn')
const loginForm = document.querySelector('.form--login')
const signupForm = document.querySelector('.form--signup')
const updateForm = document.querySelector('.form-user-data')
const updatePasswordForm = document.querySelector('.form-user-password')
const logoutbtn = document.querySelector('.nav__el--logout')
if (createTourForm) {
  createTourForm.addEventListener('submit',async (event)=>{
      event.preventDefault();

      const formData = new FormData();

      formData.append('name', document.getElementById('name').value.trim());
      formData.append('duration', parseInt(document.getElementById('duration').value));
      formData.append('maxGroupSize', parseInt(document.getElementById('maxGroupSize').value));
      formData.append('difficulty', document.getElementById('difficulty').value);
      formData.append('price', parseFloat(document.getElementById('price').value));
      formData.append('summary', document.getElementById('summary').value.trim());
      formData.append('description', document.getElementById('description').value.trim());
      formData.append('startDate', document.getElementById('startDate').value);

      const coverImage = document.getElementById('imageCover').files[0];
      if (coverImage) {
        formData.append('imageCover', coverImage);
      }

      const additionalImages = document.getElementById('images').files;
      for (let i = 0; i < additionalImages.length; i++) {
        formData.append('images', additionalImages[i]);
      }

      const startLocationAddress = document.getElementById('startLocationAddress').value.trim();
      const startLocationCoordinates = document.getElementById('startLocationCoordinates').value.trim().split(',').map(coord => parseFloat(coord.trim()));
      const startLocationDescription = document.getElementById('startLocationDescription').value.trim();
      formData.append('startLocation', JSON.stringify({
        address: startLocationAddress,
        coordinates: startLocationCoordinates,
        description: startLocationDescription,
      }));

      const locations = [];
      const locationGroups = document.querySelectorAll('.location-group');
      locationGroups.forEach(group => {
        console.log(group);
        const address = group.querySelector('.location-address').value.trim();
        const coordinates = group.querySelector('.location-coordinates').value.trim().split(',').map(coord => parseFloat(coord.trim()));
        const description = group.querySelector('.location-description').value.trim();
        const day = parseInt(group.querySelector('.location-day').value);

        locations.push({
          address,
          coordinates,
          description,
          day,
        });
      });
      formData.append('locations', JSON.stringify(locations));
      formData.append('guide', document.getElementById('guide').value);
      await createTour(formData)
})}
if (cancelBookingBtn) {
  cancelBookingBtn.addEventListener('click', (event) => {
    event.preventDefault()
    const bookingId = event.target.dataset.bookingId
    cancelTour(bookingId)
  })
}
if (reviewForm) {
  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const review = document.querySelector('#review').value
    const rating = document.querySelector('#rating').value
    const tour = event.target.dataset.tourId
    const data = { rating, tour, review }
    await createReview(data)
  })
}
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    login(email, password)
  })
}
if (logoutbtn) {
  logoutbtn.addEventListener('click', logout)
}
if (updateForm) {
  updateForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const form = new FormData()
    form.append('email', document.getElementById('email').value)
    form.append('name', document.getElementById('name').value)
    form.append('photo', document.getElementById('photo').files[0])
    await updateData(form, 'data')
  })
}
if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    document.querySelector('.btn--save-password').innerHTML = 'Updating...'
    const passwordCurrent = document.getElementById('password-current').value
    const password = document.getElementById('password').value
    const passwordConfirm = document.getElementById('password-confirm').value
    const data = { password, passwordCurrent, passwordConfirm }
    await updateData(data, 'password')
    document.querySelector('.btn--save-password').innerHTML = 'Save password'
    document.getElementById('password-current').innerHTML = ''
    document.getElementById('password').innerHTML = ''
    document.getElementById('password-confirm').innerHTML = ''
  })
}
if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.innerHTML = 'Processing...'
    const price = document.querySelector('.price')
    const tourId = e.target.dataset.tourId
    bookTour(tourId, price.innerHTML)
  })
}
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const name = document.getElementById('name').value
    const password = document.getElementById('password').value
    const email = document.getElementById('email').value
    const passwordConfirm = document.getElementById('passwordConfirm').value
    const data = { name, password, passwordConfirm, email }
    signup(data)
  })
}
