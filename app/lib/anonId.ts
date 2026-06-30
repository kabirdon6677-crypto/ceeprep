
export function getAnonId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('ceeprep_anon_id')
  if (!id) {
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    id = `Anonymous.${randomNum}`
    localStorage.setItem('ceeprep_anon_id', id)
  }
  return id
}

export const getAnonUser = getAnonId