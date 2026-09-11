<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '../types/product'
import { groupSpecifications } from '../utils/productSpecifications'

const props = defineProps<{ product: Product }>()
const groups = computed(() => groupSpecifications(props.product.specifications ?? []))
const warranty = computed(() => {
  const months = props.product.warranty_months
  const form = new Intl.PluralRules('ru-RU').select(months)
  const unit = form === 'one' ? 'месяц' : form === 'few' ? 'месяца' : 'месяцев'
  return `${months} ${unit}`
})
</script>

<template>
  <UCard class="p-4 md:p-6 border border-surface-900 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface-900)_16%,transparent)_0%,transparent_100%)] rounded-[1.5rem]">
    <h3 class="text-lg md:text-xl font-semibold text-text-100 mb-4 md:mb-6">
      Характеристики
    </h3>
    <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
      <div>
        <dt class="font-medium text-text-400 mb-1">
          Категория
        </dt>
        <dd class="text-text-100">
          {{ product.category?.name || 'Не указано' }}
        </dd>
      </div>
      <div>
        <dt class="font-medium text-text-400 mb-1">
          Бренд
        </dt>
        <dd class="text-text-100">
          {{ product.brand?.name || 'Не указано' }}
        </dd>
      </div>
      <div>
        <dt class="font-medium text-text-400 mb-1">
          Гарантия
        </dt>
        <dd class="text-text-100">
          {{ warranty }}
        </dd>
      </div>
    </dl>
    <section
      v-for="group in groups"
      :key="group.name"
      class="mt-6 border-t border-surface-900 pt-4"
    >
      <h4 class="font-semibold text-text-100 mb-4">
        {{ group.name }}
      </h4>
      <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
        <div
          v-for="row in group.rows"
          :key="row.slug"
        >
          <dt class="font-medium text-text-400 mb-1">
            {{ row.name }}
          </dt>
          <dd class="text-text-100 break-words">
            {{ row.value }}
          </dd>
        </div>
      </dl>
    </section>
  </UCard>
</template>
