import api from '@/lib/axios'

export function useApi() {
  async function get(url, params) {
    const { data } = await api.get(url, { params })
    return data
  }

  async function post(url, body) {
    const { data } = await api.post(url, body)
    return data
  }

  async function put(url, body) {
    const { data } = await api.put(url, body)
    return data
  }

  async function patch(url, body) {
    const { data } = await api.patch(url, body)
    return data
  }

  async function del(url) {
    const { data } = await api.delete(url)
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
