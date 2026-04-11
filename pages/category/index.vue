<template>
  <view class="category">
    <view class="header">
      <view class="back" @click="navigateBack">
        <uni-icons type="left" size="32" color="#1d1d1f"></uni-icons>
      </view>
      <text class="header-title">分类管理</text>
      <view class="placeholder"></view>
    </view>

    <view class="content">
      <view class="category-tab">
        <view class="category-tab-item active">支出分类</view>
        <view class="category-tab-item">收入分类</view>
      </view>

      <view class="category-list">
        <view class="category-item">
          <view class="category-item-left">
            <view class="category-icon">
              <uni-icons type="shop" size="28" color="#FFFFFF"></uni-icons>
            </view>
            <text class="category-item-text">购物</text>
          </view>
          <uni-icons type="right" size="24" color="#CCCCCC"></uni-icons>
        </view>

        <view class="category-item">
          <view class="category-item-left">
            <view class="category-icon">
              <uni-icons
                type="gift-filled"
                size="28"
                color="#FFFFFF"
              ></uni-icons>
            </view>
            <text class="category-item-text">餐饮</text>
          </view>
          <uni-icons type="right" size="24" color="#CCCCCC"></uni-icons>
        </view>

        <view class="category-item">
          <view class="category-item-left">
            <view class="category-icon">
              <uni-icons
                type="navigate-filled"
                size="28"
                color="#FFFFFF"
              ></uni-icons>
            </view>
            <text class="category-item-text">交通</text>
          </view>
          <uni-icons type="right" size="24" color="#CCCCCC"></uni-icons>
        </view>
      </view>

      <view class="add-category">
        <uni-icons type="plus" size="28" color="#4CAF87"></uni-icons>
        <text class="add-category-text">添加分类</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from "@dcloudio/uni-app";

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
</script>

<style lang="scss" scoped>
.category {
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

    .category-tab {
      display: flex;
      gap: 20rpx;
      margin-bottom: 30rpx;

      .category-tab-item {
        flex: 1;
        text-align: center;
        padding: 16rpx 0;
        border-radius: 24rpx;
        font-size: 28rpx;
        color: #888888;

        &.active {
          background: #4caf87;
          color: #ffffff;
        }
      }
    }

    .category-list {
      margin-bottom: 40rpx;

      .category-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(255, 255, 255, 0.86);
        border-radius: 32rpx;
        padding: 32rpx 30rpx;
        margin-bottom: 20rpx;
        box-shadow: 0 8rpx 24rpx rgba(56, 142, 107, 0.08);

        .category-item-left {
          display: flex;
          align-items: center;
          gap: 20rpx;

          .category-icon {
            width: 56rpx;
            height: 56rpx;
            border-radius: 16rpx;
            background: #4caf87;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .category-item-text {
            font-size: 30rpx;
            color: #1d1d1f;
            letter-spacing: 1rpx;
          }
        }
      }
    }

    .add-category {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16rpx;
      background: rgba(255, 255, 255, 0.86);
      border-radius: 32rpx;
      padding: 32rpx 30rpx;
      box-shadow: 0 8rpx 24rpx rgba(56, 142, 107, 0.08);

      .add-category-text {
        font-size: 30rpx;
        color: #4caf87;
        letter-spacing: 1rpx;
      }
    }
  }
}
</style>
