<template>
  <view class="initialAmount">
    <text class="title">初始金额设置</text>

    <view class="init-field">
      <input class="init-inputAmount" placeholder="请输入初始金额" type="text" v-model="initialAmount" disabled />
      <text class="init-unit">{{ unit }}</text>
    </view>
    <text v-if="capitalLetters" class="capital-letters">{{ capitalLetters }}</text>


    <!-- 数字键盘 -->
    <view class="keyboard">
      <view v-for="item in keyboard" :key="item" class="keyboard-item" @click="handleKeyboardClick(item)">
        {{ item }}
      </view>
      <button class="save-btn" @click="handleSave">保存</button>
    </view>

  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { toRmbUppercase } from '@/utils/rmb'

const initialAmount = ref() // 初始金额

/**
 * 单位
 * @description 单位根据初始金额显示元/千/万/...
 * @returns 单位
 */
const unit = computed(() => {
  const raw = initialAmount.value
  const amount = Number(String(raw ?? '').replace(/[^\d.]/g, ''))
  if (!Number.isFinite(amount) || amount <= 0) return '元'

  if (amount < 1_000) return '元'
  if (amount < 10_000) return '千'
  if (amount < 100_000_000) return '万'
  if (amount < 1_000_000_000_000) return '亿'
  return '兆'
})

/**
 * 大写金额
 * @description 将初始金额转换为大写金额
 * @returns 大写金额
 */
const capitalLetters = computed(() => {
  const raw = initialAmount.value
  const amount = Number(String(raw ?? '').replace(/[^\d.]/g, ''))
  if (!Number.isFinite(amount) || amount <= 0) return ''
  return toRmbUppercase(raw)
})


/**
 * 数字键盘
 */
const keyboard = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', 'del']

/**
 * 处理数字键盘点击
 */
const handleKeyboardClick = (item) => {
  if (item === '.') {
    if (initialAmount.value.includes('.')) return
  }
  if (item === 'del') {
    if (initialAmount.value) {
      initialAmount.value = initialAmount.value.toString().slice(0, -1)
    }
  } else {
    initialAmount.value = (initialAmount.value ?? '') + item
  }
}

/**
 * 处理保存按钮点击
 */
const handleSave = () => {
  uni.showToast({
    title: '保存成功',
    icon: 'success'
  })
}
</script>

<style lang="scss" scoped>
.initialAmount {
  position: relative;
  height: 100%;

  .title {
    display: block;
    font-size: 56rpx;
    font-weight: 800;
    color: #1d1d1f;
    font-weight: bold;
    letter-spacing: 2rpx;
    padding: 40rpx 26rpx;
  }

  .init-field {
    position: relative;
    margin: 60rpx 26rpx 14rpx;
    padding: 40rpx 96rpx 40rpx 35rpx;
    border-radius: 40rpx;
    border: 1rpx solid #849a73;
    box-sizing: border-box;
  }

  .init-inputAmount {
    width: 100%;
  }

  .init-unit {
    position: absolute;
    right: 35rpx;
    top: 50%;
    transform: translateY(-50%);
    font-size: 30rpx;
    font-weight: 700;
    color: rgba(29, 29, 31, 0.72);
    pointer-events: none;
  }

  .capital-letters {
    display: block;
    font-size: 24rpx;
    color: rgba(29, 29, 31, 0.6);
    padding: 0 16rpx;
  }

  .keyboard {
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: #fef9e3;
    border-radius: 40rpx;
    padding: 40rpx 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;

    .keyboard-item {
      width: 33.33%;
      text-align: center;
      padding: 40rpx 0;
      font-size: 48rpx;
      color: #1d1d1f;
      font-weight: bold;
      transition: all 0.2s;
    }

    .keyboard-item:active {
      background-color: rgba(0, 0, 0, 0.1);
      transform: scale(0.95);
    }

    .save-btn {
      width: 80%;
      background-color: #73b779;
      color: white;
      text-align: center;
      border-radius: 60rpx;
      font-size: 36rpx;
      font-weight: bold;
      transition: all 0.2s;
      border: none;
    }

    .save-btn:active {
      background-color: #5a9a5f;
      transform: scale(0.98);
    }
  }
}
</style>
