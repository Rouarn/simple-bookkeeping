<template>
  <view class="setting">
    <view class="header">
      <view class="back" @click="navigateBack">
        <uni-icons type="left" size="32" color="#1d1d1f"></uni-icons>
      </view>
      <text class="header-title">记账助手</text>
      <view class="placeholder"></view>
    </view>

    <view class="setting-list">
      <view class="setting-item" @click="navigateToPage('initialAmount')">
        <view class="setting-item-left">
          <uni-icons type="wallet-filled" size="28" color="#4CAF87"></uni-icons>
          <text class="setting-item-text">修改初始总金额</text>
        </view>
        <uni-icons type="right" size="24" color="#CCCCCC"></uni-icons>
      </view>

      <view class="setting-item" @click="navigateToPage('account')">
        <view class="setting-item-left">
          <uni-icons type="person-filled" size="28" color="#4CAF87"></uni-icons>
          <text class="setting-item-text">账户管理</text>
        </view>
        <uni-icons type="right" size="24" color="#CCCCCC"></uni-icons>
      </view>

      <view class="setting-item" @click="navigateToPage('reminder')">
        <view class="setting-item-left">
          <uni-icons
            type="notification-filled"
            size="28"
            color="#4CAF87"
          ></uni-icons>
          <text class="setting-item-text">提醒设置</text>
        </view>
        <uni-icons type="right" size="24" color="#CCCCCC"></uni-icons>
      </view>

      <view class="setting-item" @click="navigateToPage('category')">
        <view class="setting-item-left">
          <uni-icons type="list" size="28" color="#4CAF87"></uni-icons>
          <text class="setting-item-text">分类管理</text>
        </view>
        <uni-icons type="right" size="24" color="#CCCCCC"></uni-icons>
      </view>

      <view class="setting-item" @click="navigateToPage('dataBackup')">
        <view class="setting-item-left">
          <uni-icons
            type="cloud-upload-filled"
            size="28"
            color="#4CAF87"
          ></uni-icons>
          <text class="setting-item-text">数据备份</text>
        </view>
        <uni-icons type="right" size="24" color="#CCCCCC"></uni-icons>
      </view>

      <view class="setting-item" @click="navigateToPage('dataRestore')">
        <view class="setting-item-left">
          <uni-icons
            type="cloud-download-filled"
            size="28"
            color="#4CAF87"
          ></uni-icons>
          <text class="setting-item-text">数据恢复</text>
        </view>
        <uni-icons type="right" size="24" color="#CCCCCC"></uni-icons>
      </view>
    </view>

    <view class="footer">
      <text class="version">V{{ systemInfo.appVersion }}</text>
      <text class="copyright">
        ©{{ new Date().getFullYear() }} {{ systemInfo.appName }}
      </text>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from "@dcloudio/uni-app";

const systemInfo = uni.getSystemInfoSync();

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

// 导航到指定页面
function navigateToPage(page) {
  uni.navigateTo({
    url: "/pages/" + page + "/index",
  });
}
</script>

<style lang="scss" scoped>
.setting {
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

  .setting-list {
    padding: 0 44rpx;

    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.86);
      border-radius: 32rpx;
      padding: 32rpx 30rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 8rpx 24rpx rgba(56, 142, 107, 0.08);

      .setting-item-left {
        display: flex;
        align-items: center;
        gap: 20rpx;

        .setting-item-text {
          font-size: 30rpx;
          color: #1d1d1f;
          letter-spacing: 1rpx;
        }
      }
    }
  }

  .footer {
    position: fixed;
    bottom: 40rpx;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;

    .version {
      font-size: 24rpx;
      color: #888888;
    }

    .copyright {
      font-size: 22rpx;
      color: #aaaaaa;
    }
  }
}
</style>
