import cookie from 'js-cookie'

export const getLocalStorage = (key: string) => {
  if (window) {
    return localStorage.getItem(key)
  }
}
//set in localStorage
export const setLocalStorage = (key: string, value: string) => {
  if (window) {
    localStorage.setItem(key, JSON.stringify(value))
  }
}
//remove in localStorage
export const removeLocalStorage = (key: string) => {
  if (window) {
    localStorage.removeItem(key)
  }
}

//set in cookie
export const setcookie = (key: string, value: string) => {
  if (window) {
    cookie.set(key, value, {
      expires: 1,
    })
  }
}
//remove in cookie
export const removecookie = (key: string) => {
  if (window) {
    cookie.remove(key, {
      expires: 1,
    })
  }
}

//get cookie
export const getcookie = (key: string) => {
  if (window) {
    return cookie.get(key)
  }
}

//get data from localstorage
export const isAuth = () => {
  if (window) {
    try {
      const user = localStorage.getItem('user')
      return !!(user && JSON.parse(user))
    } catch (err) {
      return false
    }
  }
}

export const getLocalNotification = () => {
  if (window) {
    if (!localStorage.getItem('notification')) {
      return JSON.parse(localStorage.getItem('notification') ?? '')
    } else {
      return false
    }
  }
}
//store token and user data in storage
export const authenticate = (response: { data: string }) => {
  // response should include { user, token }
  if (response && (response as any).token) {
    setLocalStorage('jwt', (response as any).token)
  }
  if (response && (response as any).user) {
    setLocalStorage('user', JSON.stringify((response as any).user))
  }

  const expirationDate = new Date(new Date().getTime() + 60 * 60 * 24 * 10 * 1000)
  setLocalStorage('expirationDate', expirationDate.toDateString())
}

export const getToken = () => {
  try {
    return JSON.parse(localStorage.getItem('jwt') ?? 'null') ?? localStorage.getItem('jwt')
  } catch (err) {
    return localStorage.getItem('jwt')
  }
}

export const getUser = () => {
  try {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  } catch (err) {
    return null
  }
}
