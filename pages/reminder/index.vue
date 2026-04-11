<template>
  <view class="reminder">
    <view class="header">
      <view class="back" @click="navigateBack">
        <uni-icons type="left" size="32" color="#1d1d1f"></uni-icons>
      </view>
      <text class="header-title">提醒设置</text>
      <view class="placeholder"></view>
    </view>

    <view class="content">
      <view class="reminder-item">
        <view class="reminder-item-left">
          <uni-icons
            type="notification-filled"
            size="28"
            color="#4CAF87"
          ></uni-icons>
          <text class="reminder-item-text">记账提醒</text>
        </view>
        <uni-segmented-control
          :current="reminderEnabled"
          :values="['关', '开']"
          :active-color="'#4CAF87'"
          :in-active-color="'#f0f0f0'"
          style-type="button"
          @clickItem="handleReminderChange"
          style="width: 140rpx; height: 45rpx; font-weight: 600"
        ></uni-segmented-control>
      </view>

      <view class="reminder-item">
        <view class="reminder-item-left">
          <uni-icons type="time" size="28" color="#4CAF87"></uni-icons>
          <text class="reminder-item-text">提醒时间</text>
        </view>
        <text class="reminder-item-time">每天 20:00</text>
      </view>

      <view class="reminder-item">
        <view class="reminder-item-left">
          <uni-icons type="bell" size="28" color="#4CAF87"></uni-icons>
          <text class="reminder-item-text">提醒方式</text>
        </view>
        <text class="reminder-item-mode">通知</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";

// 页面加载时的初始化
onLoad(() => {
  // 可以在这里添加初始化逻辑
});

// 返回上一页
function navigateBack() {
  uni.navigateBack({
    delta: 1,
  });
}

// 记账提醒状态
const reminderEnabled = ref(1);

// 处理开关变化
function handleReminderChange(e) {
  reminderEnabled.value = e.currentIndex;
}
</script>

<style lang="scss" scoped>
.reminder {
  padding-bottom: 80rpx;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 96rpx 44rpx 40rpx;
    /* #ifdef H5 */
    padding-top: 52rpx;
    /* #endif */

    .back {
      width: 32rpx;
      height: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-title {
      font-size: 36rpx;
      font-weight: 700;
      color: #1d1d1f;
      letter-spacing: 1rpx;
    }

    .placeholder {
      width: 32rpx;
      height: 32rpx;
    }
  }

  .content {
    padding: 0 44rpx;

    .reminder-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.86);
      border-radius: 32rpx;
      padding: 32rpx 30rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 8rpx 24rpx rgba(56, 142, 107, 0.08);

      .reminder-item-left {
        display: flex;
        align-items: center;
        gap: 20rpx;

        .reminder-item-text {
          font-size: 30rpx;
          color: #1d1d1f;
          letter-spacing: 1rpx;
        }
      }

      .reminder-item-time,
      .reminder-item-mode {
        font-size: 28rpx;
        color: #888888;
      }
    }
  }
}
</style>
