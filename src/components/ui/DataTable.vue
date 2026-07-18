<template>
  <div class="overflow-x-auto">
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" :class="col.class">{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="row.id || i" @click="$emit('row-click', row)">
          <td v-for="col in columns" :key="col.key" :class="col.tdClass">
            <slot :name="col.key" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td :colspan="columns.length" class="text-center py-8 text-muted-foreground">No data</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
defineProps({ columns: Array, rows: Array })
defineEmits(['row-click'])
</script>
