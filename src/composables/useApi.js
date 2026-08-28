import api from '@/lib/axios'

export function useApi() {
  async function get(url, params, config) {
    const { data } = await api.get(url, { params, ...config })
    return data
  }

  async function post(url, body, config) {
    const { data } = await api.post(url, body, config)
    return data
  }

  async function put(url, body, config) {
    const { data } = await api.put(url, body, config)
    return data
  }

  async function patch(url, body, config) {
    const { data } = await api.patch(url, body, config)
    return data
  }

  async function del(url, config) {
    const { data } = await api.delete(url, config)
    return data
  }

  // Upload with progress
  async function upload(url, formData, onProgress) {
    const { data } = await api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total))
        }
      }
    })
    return data
  }

  return { api, get, post, put, patch, del, upload }
}
