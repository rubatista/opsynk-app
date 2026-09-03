export function useOpenDocumentPdf() {
  const opening = ref<number | null>(null)

  const open = async (id: number) => {
    opening.value = id
    try {
      const blob = await useAuthFetch<Blob>(`/api/documents/${id}/pdf`, { responseType: 'blob' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } finally {
      opening.value = null
    }
  }

  return { open, opening }
}
