<template>
  <!-- 初始金额设置页面 -->
  <view class="initialAmount">
    <!-- 页面标题 -->
    <text class="title">初始金额设置</text>

    <!-- 金额输入区域 -->
    <view class="init-field">
      <!-- 金额输入框（禁用状态，通过数字键盘输入） -->
      <input
        class="init-inputAmount"
        placeholder="请输入初始金额"
        type="text"
        v-model="initialAmount"
        disabled
      />
      <!-- 金额单位 -->
      <text class="init-unit">{{ unit }}</text>
    </view>
    <!-- 大写金额显示 -->
    <text v-if="capitalLetters" class="capital-letters">{{
      capitalLetters
    }}</text>

    <!-- 自定义数字键盘 -->
    <view class="keyboard">
      <!-- 数字键盘按键 -->
      <view
        v-for="item in keyboard"
        :key="item"
        class="keyboard-item"
        @click="handleKeyboardClick(item)"
      >
        {{ item }}
      </view>
      <!-- 保存按钮 -->
      <button class="save-btn" @click="handleSave">保存</button>
    </view>
  </view>
</template>

<script setup>
// 导入Vue核心API
import { ref, computed } from "vue";
// 导入uni-app页面生命周期
import { onLoad } from "@dcloudio/uni-app";
// 导入人民币大写转换工具
import { toRmbUppercase } from "@/utils/rmb";

// 初始金额（响应式数据）
const initialAmount = ref();

/**
 * 金额单位计算
 * @description 根据金额大小自动切换单位（元/千/万/亿/兆）
 * @returns {string} 金额单位
 */
const unit = computed(() => {
  const raw = initialAmount.value;
  // 提取纯数字和小数点
  const amount = Number(String(raw ?? "").replace(/[^\d.]/g, ""));
  // 非有效数字时返回默认单位"元"
  if (!Number.isFinite(amount) || amount <= 0) return "元";

  // 根据金额大小返回对应单位
  if (amount < 1_000) return "元";
  if (amount < 10_000) return "千";
  if (amount < 100_000_000) return "万";
  if (amount < 1_000_000_000_000) return "亿";
  return "兆";
});

/**
 * 大写金额计算
 * @description 将数字金额转换为人民币大写格式
 * @returns {string} 大写金额字符串
 */
const capitalLetters = computed(() => {
  const raw = initialAmount.value;
  const amount = Number(String(raw ?? "").replace(/[^\d.]/g, ""));
  // 非有效数字时不显示大写金额
  if (!Number.isFinite(amount) || amount <= 0) return "";
  // 使用工具函数转换为大写金额
  return toRmbUppercase(raw);
});

/**
 * 数字键盘按键配置
 * @type {Array} 包含数字键、小数点和删除键
 */
const keyboard = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"];

/**
 * 处理数字键盘点击事件
 * @param {string} item - 按键值
 */
const handleKeyboardClick = item => {
  // 处理小数点输入（限制只能输入一个小数点）
  if (item === ".") {
    if (initialAmount.value.includes(".")) return;
  }
  // 处理删除键（删除最后一个字符）
  if (item === "del") {
    if (initialAmount.value) {
      initialAmount.value = initialAmount.value.toString().slice(0, -1);
    }
  } else {
    // 处理数字输入（拼接字符）
    initialAmount.value = (initialAmount.value ?? "") + item;
  }
};

/**
 * 处理保存按钮点击事件
 */
const handleSave = () => {
  // 验证金额是否有效
  const amount = Number(
    String(initialAmount.value ?? "").replace(/[^\d.]/g, ""),
  );
  if (!Number.isFinite(amount) || amount <= 0) {
    uni.showToast({
      title: "请输入初始金额",
      icon: "none",
    });
    return;
  }

  // 保存初始金额到本地存储
  uni.setStorageSync("sbk_total_amount", initialAmount.value);

  // 跳转到支出记录页面
  uni.navigateTo({
    url: "/pages/index/index",
  });

  // 显示保存成功提示
  uni.showToast({
    title: "保存成功",
    icon: "success",
  });
};

/**
 * 页面加载生命周期
 * @description 检查是否已设置初始金额，已设置则直接跳转到主页
 */
onLoad(_options => {
  const storedTotal = uni.getStorageSync("sbk_total_amount");
  if (storedTotal) {
    initialAmount.value = storedTotal;
  }
});
</script>

<style lang="scss" scoped>
/* 初始金额设置页面样式 */
.initialAmount {
  position: relative;
  height: 100%;

  /* 页面标题样式 */
  .title {
    display: block;
    font-size: 56rpx;
    font-weight: 800;
    color: #1d1d1f;
    font-weight: bold;
    letter-spacing: 2rpx;
    padding: 40rpx 26rpx;
    margin-top: 40rpx;
  }

  /* 金额输入区域样式 */
  .init-field {
    position: relative;
    margin: 60rpx 26rpx 14rpx;
    padding: 40rpx 96rpx 40rpx 35rpx;
    border-radius: 40rpx;
    border: 1rpx solid rgba(76, 175, 135, 0.4); /* 绿色边框 */
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.86); /* 白色半透明背景 */
    box-shadow: 0 24rpx 64rpx rgba(56, 142, 107, 0.1); /* 绿色阴影 */
  }

  /* 金额输入框样式 */
  .init-inputAmount {
    width: 100%;
  }

  /* 金额单位样式 */
  .init-unit {
    position: absolute;
    right: 35rpx;
    top: 50%;
    transform: translateY(-50%);
    font-size: 30rpx;
    font-weight: 700;
    color: rgba(29, 29, 31, 0.72);
    pointer-events: none; /* 禁用点击事件 */
  }

  /* 大写金额样式 */
  .capital-letters {
    display: block;
    font-size: 24rpx;
    color: rgba(29, 29, 31, 0.6);
    padding: 0 26rpx;
  }

  /* 数字键盘容器样式 */
  .keyboard {
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.96); /* 白色半透明背景 */
    border-radius: 40rpx;
    padding: 40rpx 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    box-shadow: 0 -24rpx 64rpx rgba(56, 142, 107, 0.1); /* 绿色阴影 */

    /* 键盘按键样式 */
    .keyboard-item {
      width: 33.33%;
      text-align: center;
      padding: 40rpx 0;
      font-size: 48rpx;
      color: #1d1d1f;
      font-weight: bold;
      transition: all 0.2s;
    }

    /* 按键激活状态样式 */
    .keyboard-item:active {
      background-color: rgba(0, 0, 0, 0.1);
      transform: scale(0.95);
    }

    /* 保存按钮样式 */
    .save-btn {
      width: 80%;
      background: linear-gradient(
        90deg,
        #66c2a5 0%,
        #4caf87 100%
      ); /* 绿色渐变背景 */
      color: white;
      text-align: center;
      border-radius: 999rpx; /* 圆角按钮 */
      font-size: 36rpx;
      font-weight: bold;
      transition: all 0.2s;
      border: none;
    }

    /* 保存按钮激活状态样式 */
    .save-btn:active {
      background: #3f9d78; /* 加深绿色背景 */
      transform: scale(0.98);
    }
  }
}
</style>
