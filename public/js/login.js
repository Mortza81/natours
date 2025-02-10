import axios from 'axios'
import { showAlert } from './alerts'
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    })
    if (res.data.status == 'success') {
      showAlert('success', 'Logged In')
      setTimeout(() => {
        location.assign('/')
      }, 1500)
    }
  } catch (err) {
    showAlert('error', err.response.data.message)
  }
}
export const logout = async () => {
  try {
    const res = await axios({
      method: 'get',
      url: '/api/v1/users/logout',
    })
    if (res.data.status == 'success') {
      location.assign('/')
    }
  } catch (err) {
    showAlert('error','There is a problem with logging out')
  }
}
