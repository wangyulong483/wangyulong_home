import { onUnmounted, ref, watch } from 'vue'

export function useShrineSearch(type, query) {
  const results = ref([])
  const searching = ref(false)
  const searchError = ref('')
  const generatedAt = ref(null)
  let timer = null
  let controller = null

  async function runSearch(value) {
    controller?.abort()
    controller = new AbortController()
    searching.value = true
    searchError.value = ''
    try {
      const params = new URLSearchParams({ type, q: value })
      const response = await fetch(`/api/shrine/search?${params}`, {
        cache: 'no-store',
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const payload = await response.json()
      results.value = Array.isArray(payload.results) ? payload.results : []
      generatedAt.value = payload.generatedAt || null
    } catch (error) {
      if (error.name === 'AbortError') return
      results.value = []
      searchError.value = '实时索引暂不可用，当前为本地检索结果'
    } finally {
      searching.value = false
    }
  }

  watch(query, value => {
    clearTimeout(timer)
    const normalized = value.trim()
    if (normalized.length < 2) {
      controller?.abort()
      results.value = []
      searchError.value = ''
      searching.value = false
      return
    }
    timer = setTimeout(() => runSearch(normalized), 320)
  })

  onUnmounted(() => {
    clearTimeout(timer)
    controller?.abort()
  })

  return { results, searching, searchError, generatedAt }
}
