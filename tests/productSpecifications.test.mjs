import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import ts from 'typescript'
import { compileScript, parse } from '@vue/compiler-sfc'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'

const source = readFileSync(new URL('../app/utils/productSpecifications.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
})
const utilityUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
const { formatPropertyValue, groupSpecifications } = await import(utilityUrl)

test('formats booleans, zero, decimals, units and missing values', () => {
  assert.equal(formatPropertyValue(false), 'Нет')
  assert.equal(formatPropertyValue(true), 'Да')
  assert.equal(formatPropertyValue(0, 'г'), '0 г')
  assert.equal(formatPropertyValue(6.3, 'дюйм'), '6,3 дюйм')
  assert.equal(formatPropertyValue('120 Гц', 'Гц'), '120 Гц')
  assert.equal(formatPropertyValue(null), 'Не указано')
  assert.equal(formatPropertyValue(''), 'Не указано')
})

test('unexpected nested data never becomes object Object', () => {
  assert.equal(formatPropertyValue({ chip: { name: 'A19' }, enabled: false }), 'chip: name: A19; enabled: Нет')
  assert.equal(formatPropertyValue(['USB-C', false]), 'USB-C; Нет')
})

test('groups and sorts without mutating API data; nullable ids use slugs', () => {
  const specs = [
    { id: null, slug: 'unknown', name: 'Другое', value: 0 },
    { id: 2, slug: 'promotion', name: 'ProMotion', group_name: 'Экран', sort_order: 20, value: false },
    { id: 1, slug: 'screen-size', name: 'Диагональ', group_name: 'Экран', sort_order: 10, value: 6.3, unit: 'дюйм' }
  ]
  const before = structuredClone(specs)
  const groups = groupSpecifications(specs)
  assert.deepEqual(groups.map(group => group.name), ['Экран', 'Другие характеристики'])
  assert.deepEqual(groups[0].rows.map(row => row.slug), ['screen-size', 'promotion'])
  assert.equal(groups[0].rows[1].value, 'Нет')
  assert.equal(groups[1].rows[0].value, '0')
  assert.deepEqual(specs, before)
})

test('renders grouped specifications, localized values and warranty without creation date', async () => {
  const componentSource = readFileSync(new URL('../app/components/ProductSpecifications.vue', import.meta.url), 'utf8')
  const { descriptor } = parse(componentSource)
  const compiled = compileScript(descriptor, { id: 'specifications-test', inlineTemplate: true })
  const { outputText: componentJs } = ts.transpileModule(compiled.content, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
  })
  const resolved = componentJs
    .replaceAll(/(['"])vue\1/g, JSON.stringify(import.meta.resolve('vue')))
    .replaceAll(/(['"])\.\.\/utils\/productSpecifications\1/g, JSON.stringify(utilityUrl))
  const { default: component } = await import(`data:text/javascript;base64,${Buffer.from(resolved).toString('base64')}`)
  const app = createSSRApp(component, {
    product: {
      category: { name: 'iPhone' }, brand: { name: 'Apple' }, warranty_months: 12,
      created_at: '2026-02-06',
      specifications: [
        { id: null, slug: 'promotion', name: 'ProMotion', group_name: 'Экран', value: false },
        { id: null, slug: 'screen-size', name: 'Диагональ', group_name: 'Экран', value: 6.3, unit: 'дюйм' }
      ]
    }
  })
  app.component('UCard', { setup: (_, { slots }) => () => h('div', slots.default?.()) })
  const html = await renderToString(app)
  for (const text of ['Характеристики', 'Экран', 'ProMotion', 'Нет', '6,3 дюйм', '12 месяцев']) {
    assert.ok(html.includes(text), text)
  }
  assert.ok(!html.includes('Создан'))
  assert.ok(!html.includes('[object Object]'))
})
