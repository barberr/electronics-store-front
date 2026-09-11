import type { ProductPropertyValue } from '../types/product'

export function formatPropertyValue(value: unknown, unit?: string): string {
  if (value === null || value === undefined || value === '') return 'Не указано'
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет'
  if (Array.isArray(value)) return value.map(item => formatPropertyValue(item)).join('; ') || 'Не указано'
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([key, item]) => `${key}: ${formatPropertyValue(item)}`)
      .join('; ') || 'Не указано'
  }
  const text = typeof value === 'number'
    ? new Intl.NumberFormat('ru-RU', { useGrouping: false, maximumFractionDigits: 10 }).format(value)
    : String(value)
  return !unit || text.endsWith(unit) ? text : `${text} ${unit}`
}

export function groupSpecifications(specifications: ProductPropertyValue[]) {
  const groups = new Map<string, { slug: string, name: string, value: string }[]>()
  const sorted = [...specifications].sort((a, b) =>
    (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER))
  for (const specification of sorted) {
    const name = specification.group_name || 'Другие характеристики'
    const rows = groups.get(name) ?? []
    rows.push({
      slug: specification.slug,
      name: specification.name,
      value: formatPropertyValue(specification.value, specification.unit)
    })
    groups.set(name, rows)
  }
  return [...groups].map(([name, rows]) => ({ name, rows }))
}
