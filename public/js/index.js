import { login, logout } from './login'
import { updateData } from './updateSetting'
import { bookTour } from './stripe'
import { signup } from './signup'

const bookBtn = document.querySelector('.bookbtn')
const loginForm = document.querySelector('.form--login')
const signupForm = document.querySelector('.form--signup')
const updateForm = document.querySelector('.form-user-data')
const updatePasswordForm = document.querySelector('.form-user-password')
const logoutbtn = document.querySelector('.nav__el--logout')
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
    const tourId = e.target.dataset.tourId
    bookTour(tourId)
  })
}
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const name = document.getElementById('name').value
    const password = document.getElementById('password').value
    const email = document.getElementById('email').value
    const passwordConfirm = document.getElementById('passwordConfirm').value
    document.querySelector('btn--green').innerHTML='Processing...'
    const data = { name, password, passwordConfirm, email }
    signup(data)
  })
}
