<template>
  <view class="account">
    <view class="header">
      <view class="back" @click="navigateBack">
        <uni-icons type="left" size="32" color="#1d1d1f"></uni-icons>
      </view>
      <text class="header-title">账户管理</text>
      <view class="placeholder"></view>
    </view>

    <view class="content">
      <view class="account-list">
        <view class="account-item">
          <view class="account-item-left">
            <uni-icons
              type="wallet-filled"
              size="28"
              color="#4CAF87"
            ></uni-icons>
            <text class="account-item-text">默认账户</text>
          </view>
          <text class="account-item-amount">¥{{ defaultAccountAmount }}</text>
        </view>
      </view>

      <view class="add-account" @click="addAccount">
        <uni-icons type="plus" size="28" color="#4CAF87"></uni-icons>
        <text class="add-account-text">添加账户</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

// 默认账户金额
const defaultAccountAmount = ref(0);

// 页面加载时的初始化
onLoad(() => {
  const defaultAccount = uni.getStorageSync("sbk_total_amount");
  defaultAccountAmount.value = defaultAccount || 0;
});

// 返回上一页
function navigateBack() {
  uni.navigateBack({
    delta: 1,
  });
}

// 添加账户
function addAccount() {
  // 这里可以添加添加账户的逻辑
  // 例如：打开添加账户的弹窗或跳转到添加账户页面
  uni.showToast({
    title: "添加账户功能开发中",
    icon: "none",
  });
}
</script>

<style lang="scss" scoped>
.account {
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

    .account-list {
      margin-bottom: 40rpx;

      .account-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(255, 255, 255, 0.86);
        border-radius: 32rpx;
        padding: 32rpx 30rpx;
        margin-bottom: 20rpx;
        box-shadow: 0 8rpx 24rpx rgba(56, 142, 107, 0.08);

        .account-item-left {
          display: flex;
          align-items: center;
          gap: 20rpx;

          .account-item-text {
            font-size: 30rpx;
            color: #1d1d1f;
            letter-spacing: 1rpx;
          }
        }

        .account-item-amount {
          font-size: 28rpx;
          color: #4caf87;
          font-weight: 600;
        }
      }
    }

    .add-account {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16rpx;
      background: rgba(255, 255, 255, 0.86);
      border-radius: 32rpx;
      padding: 32rpx 30rpx;
      box-shadow: 0 8rpx 24rpx rgba(56, 142, 107, 0.08);

      .add-account-text {
        font-size: 30rpx;
        color: #4caf87;
        letter-spacing: 1rpx;
      }
    }
  }
}
</style>
