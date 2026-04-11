<template>
  <view class="container">
    <view class="header">
      <text class="back" @click="navigateBack">
        <uni-icons type="left" size="28" color="#1d1d1f"></uni-icons>
      </text>
      <text class="page-title">数据备份</text>
      <view class="placeholder"></view>
    </view>

    <view class="card card--paper">
      <text class="card-title">支出记录</text>
      <view class="table-head">
        <text class="th th-date">日期</text>
        <text class="th th-item">项目</text>
        <text class="th th-amt">金额</text>
      </view>

      <view v-if="records.length === 0" class="empty">
        <view class="plant">
          <view class="plant-leaves">
            <view class="leaf l1"></view>
            <view class="leaf l2"></view>
            <view class="leaf l3"></view>
          </view>
          <view class="pot"></view>
        </view>
        <text class="empty-text">还没有支出记录哦～</text>
      </view>

      <view v-else class="table">
        <view v-for="item in records" :key="item.id" class="tr">
          <text class="td td-date">{{ item.date }}</text>
          <text class="td td-item">{{ item.item }}</text>
          <text class="td td-amt">¥{{ item.amount }}</text>
        </view>
      </view>
    </view>

    <view class="card card--paper card--info">
      <view class="info-icon">
        <uni-icons type="paperclip" size="32" color="#4CAF87"></uni-icons>
      </view>
      <text class="info-text">
        包含初始金额 {{ totalAmount }} 及支出记录 {{ records.length }} 条
      </text>
    </view>

    <button
      class="export-btn"
      hover-class="export-btn--active"
      @click="exportJSON"
    >
      <uni-icons type="download" size="24" color="#ffffff"></uni-icons>
      导出JSON文件
    </button>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { exportJsonFile } from "@/utils/export.js";

// 支出记录列表
const records = ref([]);

// 初始金额
const totalAmount = ref("");

// 导出JSON文件
function exportJSON() {
  const data = {
    totalAmount: totalAmount.value,
    records: records.value,
    exportDate: new Date().toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };

  exportJsonFile(data, `支出记录-${new Date().getTime()}`);
}

// 返回上一页
function navigateBack() {
  uni.navigateBack();
}

// 页面加载时：
// - 读取初始金额与记录列表
// - 兼容历史结构（normalizeRecord）
onLoad(() => {
  const storedTotal = uni.getStorageSync("sbk_total_amount");
  const storedRecords = uni.getStorageSync("sbk_records");
  if (storedTotal !== undefined && storedTotal !== null && storedTotal !== "") {
    totalAmount.value = String(storedTotal);
  }
  if (Array.isArray(storedRecords)) {
    records.value = storedRecords;
  }
});
</script>

<style lang="scss" scoped>
.container {
  padding: 96rpx 44rpx 96rpx;
  /* #ifdef H5 */
  padding-top: 52rpx;
  /* #endif */

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .back {
      width: 40rpx;
      height: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .page-title {
      font-size: 52rpx;
      font-weight: 700;
      color: #1d1d1f;
      letter-spacing: 1rpx;
      display: block;
    }

    .placeholder {
      width: 40rpx;
    }
  }

  .card {
    margin-top: 28rpx;
    border-radius: 44rpx;
    padding: 30rpx 28rpx 28rpx;

    &--paper {
      background: rgba(255, 255, 255, 0.86);
      box-shadow: 0 24rpx 64rpx rgba(56, 142, 107, 0.1);
    }

    &--info {
      margin-top: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16rpx;
      padding: 32rpx 28rpx;

      .info-icon {
        width: 56rpx;
        height: 56rpx;
        border-radius: 16rpx;
        background: rgba(76, 175, 135, 0.16);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .info-text {
        font-size: 26rpx;
        color: rgba(56, 142, 107, 0.88);
      }
    }

    .card-title {
      position: relative;
      font-size: 30rpx;
      font-weight: 700;
      color: #1d1d1f;
    }
  }

  .table-head {
    margin-top: 22rpx;
    display: flex;
    align-items: center;
    padding: 16rpx 18rpx;
    border-radius: 22rpx;
    background: rgba(102, 194, 165, 0.16);

    .th {
      font-size: 26rpx;
      font-weight: 600;
      color: #388e6b;

      &-date {
        width: 34%;
      }

      &-item {
        width: 33%;
        text-align: center;
      }

      &-amt {
        width: 33%;
        text-align: right;
      }
    }
  }

  .table {
    margin-top: 8rpx;
    border-radius: 28rpx;
    overflow: hidden;

    .tr {
      background: rgba(255, 255, 255, 0.72);
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 22rpx 18rpx;
      border-bottom: 2rpx solid rgba(56, 142, 107, 0.08);

      &:last-child {
        border-bottom: none;
      }

      .td {
        font-size: 28rpx;
        color: #333333;

        &-date {
          width: 34%;
        }

        &-item {
          width: 33%;
          text-align: center;
          color: rgba(51, 51, 51, 0.92);
        }

        &-amt {
          width: 33%;
          font-weight: 700;
          text-align: right;
          color: #4caf87;
        }
      }
    }
  }

  .empty {
    margin-top: 12rpx;
    background: rgba(255, 255, 255, 0.72);
    border-radius: 28rpx;
    padding: 54rpx 24rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18rpx;

    .plant {
      width: 140rpx;
      height: 120rpx;
      position: relative;

      .plant-leaves {
        position: absolute;
        top: 4rpx;
        left: 50%;
        transform: translateX(-50%);
        width: 140rpx;
        height: 80rpx;

        .leaf {
          position: absolute;
          width: 46rpx;
          height: 60rpx;
          border-radius: 999rpx 999rpx 999rpx 0;
          background: linear-gradient(
            180deg,
            rgba(102, 194, 165, 0.95) 0%,
            rgba(76, 175, 135, 0.9) 100%
          );
          opacity: 0.92;

          &.l1 {
            left: 22rpx;
            top: 18rpx;
            transform: rotate(-24deg);
          }

          &.l2 {
            left: 56rpx;
            top: 6rpx;
            transform: rotate(4deg);
          }

          &.l3 {
            left: 88rpx;
            top: 20rpx;
            transform: rotate(26deg);
          }
        }
      }

      .pot {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 110rpx;
        height: 54rpx;
        border-radius: 0 0 26rpx 26rpx;
        background: rgba(56, 142, 107, 0.16);
      }
    }

    .empty-text {
      font-size: 26rpx;
      color: #888888;
    }
  }

  .export-btn {
    margin-top: 40rpx;
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 999rpx;
    background: linear-gradient(90deg, #66c2a5 0%, #4caf87 100%);
    color: #ffffff;
    font-size: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;

    &::after {
      border: none;
    }

    &--active {
      opacity: 0.88;
    }
  }
}
</style>
