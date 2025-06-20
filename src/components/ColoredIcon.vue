<script setup lang="ts">
import ColoredIconDetail from '@src/components/ColoredIconDetail.vue';

export type ColoredIconSize = 'large' | 'medium' | 'small' | 'inline' | 'inline-table' | 'inline-row' | 'broker-table';

const {
  background,
  color,
  label,
  size = 'large',
} = defineProps<{
  background?: string;
  color?: string;
  detail?: string;
  label: string;
  size?: ColoredIconSize;
  title: string;
}>();

const $style = useCssModule();

const classes = computed(() => ({
  [C.ColoredIcon.container]: true,
  [$style.large]: size === 'large',
  [$style.medium]: size === 'medium',
  [$style.small]: size === 'small',
  [$style.inline]: size === 'inline',
  [$style.inlineTable]: size === 'inline-table',
  [$style.inlineRow]: size === 'inline-row',
  [$style.brokerTable]: size === 'broker-table',
}));
</script>

<template>
  <div :class="classes" :style="{ background, color }" :title="title">
    <div :class="C.ColoredIcon.labelContainer">
      <span :class="C.ColoredIcon.label">{{ label }}</span>
      <ColoredIconDetail :detail="detail" />
    </div>
  </div>
</template>

<style module>
.large {
  height: 48px;
  width: 48px;
  font-size: 16px;
}

.medium {
  height: 32px;
  width: 32px;
  font-size: 11px;
}

.small {
  height: 24px;
  width: 24px;
  font-size: 9px;
}

.inline {
  height: 14px;
  width: 32px;
  font-size: 11px;
}

.inlineTable {
  height: 18px;
  width: 32px;
  font-size: 11px;
}
.inlineRow {
  height: 12px;
  width: 32px;
  font-size: 10px;
  display: inline-block;
}

.brokerTable {
  height: 28px;
  width: 28px;
  font-size: 9.24px;
}
</style>
