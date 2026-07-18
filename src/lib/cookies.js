/**
 * Cookie utilities — secure, SameSite=Lax by default
 */
const DEFAULTS = { path: '/', sameSite: 'Lax', secure: location.protocol === 'https:' }

export function setCookie(name, value, days = 7, opts = {}) {
  const o = { ...DEFAULTS, ...opts }
  let str = encodeURIComponent(name) + '=' + encodeURIComponent(value)
  if (days) {
    const d = new Date()
    d.setTime(d.getTime() + days * 86400000)
    str += '; expires=' + d.toUTCString()
  }
  str += '; path=' + o.path
  str += '; SameSite=' + o.sameSite
  if (o.secure) str += '; Secure'
  document.cookie = str
}

export function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(name).replace(/[.*+?^${}()|[\]\\]/g, '\\\$&') + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

export function removeCookie(name, path = '/') {
  document.cookie = encodeURIComponent(name) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + path
}
