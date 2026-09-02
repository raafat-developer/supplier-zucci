import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/axios'
import router from '@/router'
import { setCookie, getCookie, removeCookie } from '@/lib/cookies'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(
    JSON.parse(getCookie('zsc-user') || 'null') || {
      name: 'Supplier User',
      initials: 'SU',
      email: '',
      role: 'Supplier',
      phone: '',
      avatar: null
    }
  )

  const token = ref(getCookie('zsc-token') || null)
  const loginChallengeId = ref(getCookie('zsc-challenge') || null)
  const registrationSessionId = ref(
    localStorage.getItem('zsc-registration-session-id') || getCookie('zsc-reg-session') || null
  )
  const isAuthenticated = computed(() => !!token.value)
  const isPendingApproval = ref(false)
  const regData = ref(JSON.parse(getCookie('zsc-reg') || '{}'))

  const actor = ref(
    JSON.parse(localStorage.getItem('zsc-actor') || getCookie('zsc-actor') || 'null')
  )
  const me = ref(
    JSON.parse(localStorage.getItem('zsc-me') || 'null')
  )
  const permissions = ref(
    JSON.parse(localStorage.getItem('zsc-permissions') || getCookie('zsc-permissions') || '[]')
  )
  const markets = ref(
    JSON.parse(localStorage.getItem('zsc-markets') || getCookie('zsc-markets') || '[]')
  )
  const brands = ref(
    JSON.parse(localStorage.getItem('zsc-brands') || getCookie('zsc-brands') || '[]')
  )

  async function fetchMe() {
    if (!token.value) return null
    try {
      const response = await api.get('/auth/supplier/me')
      const resData = response.data?.data || response.data
      me.value = resData
      localStorage.setItem('zsc-me', JSON.stringify(resData))

      const actorData = resData?.actor || resData?.user || resData?.supplier || resData
      if (actorData && typeof actorData === 'object') {
        setActor(actorData)
        const fullName = `${actorData.first_name || ''} ${actorData.last_name || ''}`.trim() || actorData.name || actorData.email?.split('@')[0]
        setUser({
          name: fullName,
          email: actorData.email,
          actor: actorData
        })
      }
      if (resData?.permissions) setPermissions(resData.permissions)
      if (resData?.markets) setMarkets(resData.markets)
      if (resData?.brands) setBrands(resData.brands)

      return resData
    } catch (err) {
      console.error('Failed to fetch /auth/supplier/me:', err)
      return null
    }
  }

  function setToken(t, rememberDays = 7) {
    token.value = t
    if (t) setCookie('zsc-token', t, rememberDays)
    else removeCookie('zsc-token')
  }

  function setUser(u) {
    if (!u) {
      user.value = null
      removeCookie('zsc-user')
      return
    }
    const fullName = u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email?.split('@')[0] || 'Supplier User'
    const initials = fullName
      ? fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
      : 'SU'
    const updatedUser = {
      name: fullName,
      initials: u.initials || initials,
      email: u.email || '',
      role: u.role || 'Supplier',
      phone: u.phone || '',
      avatar: u.avatar || null,
      ...u
    }
    user.value = updatedUser
    setCookie('zsc-user', JSON.stringify(updatedUser), 7)
  }

  function setActor(a) {
    actor.value = a
    if (a) {
      localStorage.setItem('zsc-actor', JSON.stringify(a))
      setCookie('zsc-actor', JSON.stringify(a), 7)
    } else {
      localStorage.removeItem('zsc-actor')
      removeCookie('zsc-actor')
    }
  }

  function setPermissions(perms) {
    const list = Array.isArray(perms) ? perms : []
    permissions.value = list
    localStorage.setItem('zsc-permissions', JSON.stringify(list))
    setCookie('zsc-permissions', JSON.stringify(list), 7)
  }

  function setMarkets(m) {
    const list = Array.isArray(m) ? m : []
    markets.value = list
    localStorage.setItem('zsc-markets', JSON.stringify(list))
    setCookie('zsc-markets', JSON.stringify(list), 7)
  }

  function setBrands(b) {
    const list = Array.isArray(b) ? b : []
    brands.value = list
    localStorage.setItem('zsc-brands', JSON.stringify(list))
    setCookie('zsc-brands', JSON.stringify(list), 7)
  }

  function hasPermission(permissionName) {
    if (!permissionName) return true
    if (permissions.value.includes('*') || permissions.value.includes('admin')) return true
    return permissions.value.includes(permissionName)
  }

  function hasAnyPermission(permissionList) {
    if (!permissionList || permissionList.length === 0) return true
    return permissionList.some(p => hasPermission(p))
  }

  function setLoginChallengeId(id) {
    loginChallengeId.value = id
    if (id) setCookie('zsc-challenge', id, 1)
    else removeCookie('zsc-challenge')
  }

  function setRegistrationSessionId(id) {
    registrationSessionId.value = id
    if (id) {
      localStorage.setItem('zsc-registration-session-id', id)
      setCookie('zsc-reg-session', id, 7)
    } else {
      localStorage.removeItem('zsc-registration-session-id')
      removeCookie('zsc-reg-session')
    }
  }

  async function login(credentials) {
    // API: POST /auth/supplier/login
    // Body: { "email": credentials.email, "password": credentials.password }
    const response = await api.post('/auth/supplier/login', {
      email: credentials.email,
      password: credentials.password
    }, { skipSuccessToast: true })

    const resData = response.data
    const challengeId =
      resData?.loginChallengeId ||
      resData?.login_challenge_id ||
      resData?.data?.loginChallengeId ||
      resData?.data?.login_challenge_id

    if (challengeId) {
      setLoginChallengeId(challengeId)
    }

    return response.data
  }

  async function verifyOtp(code) {
    // API: POST /auth/supplier/login/verify-otp
    // Body: { "login_challenge_id": loginChallengeId, "code": code }
    const response = await api.post('/auth/supplier/login/verify-otp', {
      login_challenge_id: loginChallengeId.value,
      code: code
    }, { skipSuccessToast: true })

    const resData = response.data?.data || response.data
    const tokenVal = resData?.token || resData?.access_token || resData?.jwt

    if (tokenVal) {
      setToken(tokenVal)
      try {
        await fetchMe()
      } catch (e) {
        console.error('fetchMe error after login:', e)
      }
    }

    const actorData = resData?.actor || resData?.user || resData?.supplier
    if (actorData) {
      setActor(actorData)
      const fullName = `${actorData.first_name || ''} ${actorData.last_name || ''}`.trim() || actorData.name || actorData.email?.split('@')[0]
      setUser({
        name: fullName,
        email: actorData.email,
        actor: actorData
      })
    } else if (resData?.user || resData?.supplier) {
      setUser(resData.user || resData.supplier)
    }

    if (resData?.permissions) {
      setPermissions(resData.permissions)
    }

    if (resData?.markets) {
      setMarkets(resData.markets)
    }

    if (resData?.brands) {
      setBrands(resData.brands)
    }

    setLoginChallengeId(null)
    return response.data
  }

  async function resendOtp() {
    // API: POST /auth/supplier/login/resend-otp
    // Body: { "login_challenge_id": loginChallengeId }
    const response = await api.post('/auth/supplier/login/resend-otp', {
      login_challenge_id: loginChallengeId.value
    })
    return response.data
  }

  async function forgotPassword(emailVal) {
    // API: POST /auth/supplier/forgot-password
    // Body: { "email": emailVal }
    const response = await api.post('/auth/supplier/forgot-password', {
      email: emailVal
    })
    return response.data
  }

  function updateSessionIdFromResponse(response) {
    console.log("[updateSessionIdFromResponse] response:", response);
    if (!response) return;
    const resData = response.data?.data || response.data;
    console.log("[updateSessionIdFromResponse] resData:", resData);
    const sessionId =
      resData?.registration_session_id ||
      resData?.registrationSessionId ||
      resData?.session_id ||
      resData?.payload?.registration_session_id ||
      resData?.payload?.registrationSessionId ||
      resData?.payload?.session_id ||
      response.data?.registration_session_id ||
      response.data?.registrationSessionId ||
      response.data?.session_id;

    console.log("[updateSessionIdFromResponse] Extracted sessionId:", sessionId);
    if (sessionId) {
      setRegistrationSessionId(sessionId);
      console.log("[updateSessionIdFromResponse] Saved sessionId:", sessionId);
    }
  }

  async function registerLead(leadData) {
    // API: POST /auth/supplier/register/lead
    // Body: { "first_name": leadData.first_name, "last_name": leadData.last_name, "brand_name": leadData.brand_name, "instagram": leadData.instagram }
    const response = await api.post('/auth/supplier/register/lead', {
      first_name: leadData.first_name,
      last_name: leadData.last_name,
      phone: leadData.phone,
      email: leadData.email
    }, { skipToast: true })
    updateSessionIdFromResponse(response)
    return response.data
  }

  async function getRegistrationSession(sessionId) {
    // API: GET /auth/supplier/register/session/:sessionId
    const sid = sessionId || registrationSessionId.value
    if (!sid) return null

    const response = await api.get(`/auth/supplier/register/session/${sid}`)
    updateSessionIdFromResponse(response)
    return response.data
  }

  async function registerPhone(phoneNum) {
    // API: POST /auth/supplier/register/phone
    // Body: { "registration_session_id": registrationSessionId, "phone": phoneNum }
    const response = await api.post('/auth/supplier/register/phone', {
      registration_session_id: registrationSessionId.value,
      phone: phoneNum
    }, { skipToast: true })
    updateSessionIdFromResponse(response)
    return response.data
  }

  async function verifyPhoneOtp(code) {
    // API: POST /auth/supplier/register/phone/verify
    // Body: { "registration_session_id": registrationSessionId, "code": code }
    const response = await api.post('/auth/supplier/register/phone/verify', {
      registration_session_id: registrationSessionId.value,
      code: code
    }, { skipToast: true })
    console.log(response)
    updateSessionIdFromResponse(response)
    console.log("Session ID:", registrationSessionId.value);
    return response.data
  }

  async function registerEmail(emailVal) {
    // API: POST /auth/supplier/register/email
    // Body: { "registration_session_id": registrationSessionId, "email": emailVal }
    const response = await api.post('/auth/supplier/register/email', {
      registration_session_id: registrationSessionId.value,
      email: emailVal
    }, { skipToast: true })
    updateSessionIdFromResponse(response)
    return response.data
  }

  async function verifyEmailOtp(code) {
    // API: POST /auth/supplier/register/email/verify
    // Body: { "registration_session_id": registrationSessionId, "code": code }
    const response = await api.post('/auth/supplier/register/email/verify', {
      registration_session_id: registrationSessionId.value,
      code: code
    }, { skipToast: true })
    updateSessionIdFromResponse(response)
    return response.data
  }

  async function resendRegistrationOtp(channel) {
    // API: POST /auth/supplier/register/otp/resend
    // Body: { "registration_session_id": registrationSessionId, "channel": "phone" | "email" }
    const response = await api.post('/auth/supplier/register/otp/resend', {
      registration_session_id: registrationSessionId.value,
      channel: channel
    }, { skipToast: true })
    updateSessionIdFromResponse(response)
    return response.data
  }

  async function registerEntityType(entityTypeVal) {
    // API: POST /auth/supplier/register/entity-type
    // Body: { "registration_session_id": registrationSessionId, "entity_type": "business" | "individual" }
    const response = await api.post('/auth/supplier/register/entity-type', {
      registration_session_id: registrationSessionId.value,
      entity_type: entityTypeVal
    }, { skipToast: true })
    updateSessionIdFromResponse(response)
    return response.data
  }

  async function uploadRegistrationFile(purpose, file) {
    // API: POST /auth/supplier/register/uploads
    // Form Data: registration_session_id, purpose, file
    const formData = new FormData()
    formData.append('registration_session_id', registrationSessionId.value)
    formData.append('purpose', purpose)
    formData.append('file', file)

    const response = await api.post('/auth/supplier/register/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      skipToast: true
    })
    updateSessionIdFromResponse(response)
    return response.data
  }

  async function updateKyc(sectionName, kycDataObj) {
    // API: PATCH /auth/supplier/register/kyc
    // Body: { "registration_session_id": registrationSessionId, "kyc_section": sectionName, "kyc": kycDataObj }
    const response = await api.patch('/auth/supplier/register/kyc', {
      registration_session_id: registrationSessionId.value,
      kyc_section: sectionName,
      kyc: kycDataObj
    }, { skipToast: true })
    updateSessionIdFromResponse(response)
    return response.data
  }

  async function sendTeamInvites(invitesList) {
    // API: POST /auth/supplier/register/team
    // Body: { "registration_session_id": registrationSessionId, "invites": invitesList }
    const response = await api.post('/auth/supplier/register/team', {
      registration_session_id: registrationSessionId.value,
      invites: invitesList
    }, { skipToast: true })
    updateSessionIdFromResponse(response)
    return response.data
  }

  async function submitRegistration(passwordVal) {
    // API: POST /auth/supplier/register/submit
    // Body: { "registration_session_id": registrationSessionId, "password": passwordVal }
    const response = await api.post('/auth/supplier/register/submit', {
      registration_session_id: registrationSessionId.value,
      password: passwordVal
    }, { skipToast: true })

    const resData = response.data?.data || response.data
    const tokenVal = resData?.token || resData?.access_token
    if (tokenVal) {
      setToken(tokenVal)
    }

    const actorData = resData?.actor || resData?.user || resData?.supplier
    if (actorData) {
      setActor(actorData)
      const fullName = `${actorData.first_name || ''} ${actorData.last_name || ''}`.trim() || actorData.name || actorData.email?.split('@')[0]
      setUser({
        name: fullName,
        email: actorData.email,
        actor: actorData
      })
    }

    if (resData?.permissions) setPermissions(resData.permissions)
    if (resData?.markets) setMarkets(resData.markets)
    if (resData?.brands) setBrands(resData.brands)

    setRegistrationSessionId(null)
    return response.data
  }

  async function getOnboardingStatus() {
    // API: GET /supplier/onboarding/status
    const response = await api.get('/supplier/onboarding/status')
    return response.data?.data || response.data
  }

  async function uploadOnboardingDocument(documentCode, file, documentTypeId = null, notes = '') {
    // API: POST /supplier/onboarding/documents
    // Form Data: document_code, document_type_id, notes, file
    const formData = new FormData()
    if (documentCode) formData.append('document_code', documentCode)
    if (documentTypeId) formData.append('document_type_id', documentTypeId)
    if (notes) formData.append('notes', notes)
    formData.append('file', file)

    const response = await api.post('/supplier/onboarding/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  async function logout() {
    try {
      // API: POST /auth/supplier/logout without body
      await api.post('/auth/supplier/logout', {}, { skipSuccessToast: true })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setToken(null)
      setUser(null)
      setActor(null)
      setPermissions([])
      setMarkets([])
      setBrands([])
      setLoginChallengeId(null)
      setRegistrationSessionId(null)
      removeCookie('zsc-user')
      removeCookie('zsc-actor')
      removeCookie('zsc-permissions')
      removeCookie('zsc-markets')
      removeCookie('zsc-brands')
      removeCookie('zsc-reg')
      removeCookie('zsc-challenge')
      localStorage.removeItem('zsc-actor')
      localStorage.removeItem('zsc-permissions')
      localStorage.removeItem('zsc-markets')
      localStorage.removeItem('zsc-brands')
      router.push('/login')
    }
  }

  function saveReg(data) {
    regData.value = { ...regData.value, ...data }
    setCookie('zsc-reg', JSON.stringify(regData.value), 1)
  }

  async function getReferenceCountries() {
    // API: GET /reference/countries
    try {
      const response = await api.get('/reference/countries')
      const data = response.data
      return data?.items || data?.data?.items || (Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Error fetching reference countries:', e)
      return []
    }
  }

  async function getReferenceCities(countryId) {
    // API: GET /reference/cities?countryId={{countryId}}
    try {
      const params = countryId ? { countryId } : {}
      const response = await api.get('/reference/cities', { params })
      const data = response.data
      return data?.items || data?.data?.items || (Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Error fetching reference cities:', e)
      return []
    }
  }

  async function getReferenceStates(countryId) {
    // API: GET /reference/states?countryId={{countryId}}
    if (!countryId) return []
    try {
      const response = await api.get('/reference/states', { params: { countryId } })
      const data = response.data
      return data?.items || data?.data?.items || (Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Error fetching reference states:', e)
      return []
    }
  }

  async function getReferenceBanks(countryIso) {
    // API: GET /reference/banks?country={{countryIso}}
    if (!countryIso) return []
    try {
      const response = await api.get('/reference/banks', { params: { country: countryIso } })
      const data = response.data
      return data?.items || data?.data?.items || (Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Error fetching reference banks:', e)
      return []
    }
  }

  async function getReferenceCurrencies() {
    // API: GET /reference/currencies
    try {
      const response = await api.get('/reference/currencies')
      const data = response.data
      return data?.items || data?.data?.items || (Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Error fetching reference currencies:', e)
      return []
    }
  }

  async function fetchProfile() {
    try {
      const response = await api.get('/supplier/account')
      const resData = response.data?.data || response.data
      if (resData) {
        const updatedActor = { ...actor.value, ...resData }
        setActor(updatedActor)
        const fullName = `${resData.firstName || ''} ${resData.lastName || ''}`.trim() || user.value.name
        setUser({
          ...user.value,
          name: fullName,
          firstName: resData.firstName || user.value.firstName,
          lastName: resData.lastName || user.value.lastName,
          timezone: resData.timezone || user.value.timezone,
          localeId: resData.localeId || user.value.localeId,
          phone: resData.phone || user.value.phone,
          email: resData.email || user.value.email,
          actor: updatedActor
        })
      }
      return resData
    } catch (e) {
      console.error('Error fetching profile:', e)
      throw e
    }
  }

  async function updateProfile(payload) {
    const response = await api.patch('/supplier/account', payload)
    const resData = response.data?.data || response.data
    if (resData) {
      const updatedActor = { ...actor.value, ...resData }
      setActor(updatedActor)
      const fullName = `${resData.firstName || ''} ${resData.lastName || ''}`.trim() || user.value.name
      setUser({
        ...user.value,
        name: fullName,
        firstName: resData.firstName || user.value.firstName,
        lastName: resData.lastName || user.value.lastName,
        timezone: resData.timezone || user.value.timezone,
        localeId: resData.localeId || user.value.localeId,
        actor: updatedActor
      })
    }
    return response.data
  }

  async function changePassword(payload) {
    const response = await api.post('/supplier/account/password', payload)
    return response.data
  }

  async function sendContactOtp(field, value) {
    const response = await api.post('/supplier/account/contact/otp', { field, value })
    return response.data
  }

  async function verifyContactOtp(field, value, code) {
    const response = await api.post('/supplier/account/contact/verify', { field, value, code })
    const resData = response.data?.data || response.data
    if (resData) {
      const updatedActor = { ...actor.value }
      if (field === 'email') {
        updatedActor.email = value
        setUser({ ...user.value, email: value, actor: updatedActor })
      } else if (field === 'phone') {
        updatedActor.phone = value
        setUser({ ...user.value, phone: value, actor: updatedActor })
      }
      setActor(updatedActor)
    }
    return response.data
  }

  return {
    fetchProfile,
    updateProfile,
    changePassword,
    sendContactOtp,
    verifyContactOtp,
    user,
    token,
    actor,
    me,
    fetchMe,
    permissions,
    markets,
    brands,
    loginChallengeId,
    registrationSessionId,
    isAuthenticated,
    isPendingApproval,
    regData,
    setToken,
    setUser,
    setActor,
    setPermissions,
    setMarkets,
    setBrands,
    hasPermission,
    hasAnyPermission,
    setLoginChallengeId,
    setRegistrationSessionId,
    login,
    verifyOtp,
    resendOtp,
    forgotPassword,
    registerLead,
    getRegistrationSession,
    registerPhone,
    verifyPhoneOtp,
    registerEmail,
    verifyEmailOtp,
    resendRegistrationOtp,
    registerEntityType,
    uploadRegistrationFile,
    updateKyc,
    sendTeamInvites,
    submitRegistration,
    getOnboardingStatus,
    uploadOnboardingDocument,
    getReferenceCountries,
    getReferenceCities,
    getReferenceStates,
    getReferenceBanks,
    getReferenceCurrencies,
    logout,
    saveReg
  }
})
