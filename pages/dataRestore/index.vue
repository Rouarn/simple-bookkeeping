<template>
  <view class="container">
    <view class="header">
      <text class="back" @click="navigateBack">
        <uni-icons type="left" size="28" color="#1d1d1f"></uni-icons>
      </text>
      <text class="page-title">数据恢复</text>
      <view class="placeholder"></view>
    </view>

    <view class="card card--paper card--info">
      <view class="info-icon">
        <uni-icons
          type="cloud-download-filled"
          size="32"
          color="#4CAF87"
        ></uni-icons>
      </view>
      <text class="info-text"> 选择之前导出的JSON文件进行数据恢复 </text>
    </view>

    <view class="card card--paper">
      <text class="card-title">恢复选项</text>
      <view class="import-section">
        <button
          class="import-btn"
          hover-class="import-btn--active"
          @click="selectFile"
        >
          <uni-icons type="upload" size="24" color="#4CAF87"></uni-icons>
          选择JSON文件
        </button>
        <text v-if="selectedFile" class="file-name">{{
          selectedFile.name
        }}</text>
      </view>

      <view v-if="fileData" class="data-preview">
        <text class="preview-title">文件内容预览</text>
        <view class="preview-item">
          <text class="preview-label">初始金额:</text>
          <text class="preview-value">¥{{ fileData.totalAmount }}</text>
        </view>
        <view class="preview-item">
          <text class="preview-label">支出记录:</text>
          <text class="preview-value">{{ fileData.records.length }} 条</text>
        </view>
        <view class="preview-item">
          <text class="preview-label">导出日期:</text>
          <text class="preview-value">{{ fileData.exportDate }}</text>
        </view>
      </view>
    </view>

    <button
      v-if="fileData"
      class="restore-btn"
      hover-class="restore-btn--active"
      @click="restoreData"
    >
      <uni-icons type="refresh" size="24" color="#ffffff"></uni-icons>
      恢复数据
    </button>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

// 选中的文件
const selectedFile = ref(null);
// 文件数据
const fileData = ref(null);

// 选择文件
function selectFile() {
  const systemInfo = uni.getSystemInfoSync();
  const platform = systemInfo.platform;

  // App端使用plus.io.chooseFile
  if (platform === "android" || platform === "ios") {
    if (typeof plus !== "undefined" && plus.io && plus.io.chooseFile) {
      plus.io.chooseFile({
        filter: "all",
        onsuccess: function (e) {
          const filePath = e.files[0];
          console.log("选中的JSON文件路径：", filePath);

          // 检查文件类型是否为JSON
          if (!filePath.endsWith(".json")) {
            uni.showToast({ title: "请选择.json文件", icon: "none" });
            return;
          }

          selectedFile.value = {
            name: filePath.split("/").pop(),
            path: filePath,
          };
          parseJsonFile(filePath);
        },
        onerror: function (e) {
          console.log("选择文件失败：", e);
          uni.showToast({ title: "选择文件失败", icon: "none" });
        },
      });
    } else {
      uni.showToast({ title: "当前环境不支持文件选择", icon: "none" });
    }
  }
  // H5平台使用uni.chooseFile
  else if (typeof uni.chooseFile === "function") {
    uni.chooseFile({
      count: 1,
      accept: ".json",
      success: function (res) {
        selectedFile.value = res.tempFiles[0];
        readFile(res.tempFiles[0].path);
      },
      fail: function (err) {
        console.log("chooseFile失败:", err);
        uni.showToast({
          title: "选择文件失败",
          icon: "none",
        });
      },
    });
  }
  // 其他平台
  else {
    uni.showToast({
      title: "当前平台不支持文件选择",
      icon: "none",
    });
  }
}

// App端读取并解析JSON文件
function parseJsonFile(filePath) {
  if (typeof plus !== "undefined" && plus.io) {
    plus.io.resolveLocalFileSystemURL(
      filePath,
      entry => {
        entry.file(file => {
          const reader = new plus.io.FileReader();
          reader.onloadend = evt => {
            try {
              const jsonStr = evt.target.result;
              const data = JSON.parse(jsonStr);
              if (validateData(data)) {
                fileData.value = data;
                uni.showToast({ title: "JSON解析成功", icon: "success" });
              } else {
                uni.showToast({ title: "文件格式不正确", icon: "none" });
              }
            } catch (err) {
              console.error("JSON格式错误：", err);
              uni.showToast({ title: "JSON格式无效", icon: "none" });
            }
          };
          reader.onerror = () => {
            uni.showToast({ title: "读取文件失败", icon: "none" });
          };
          reader.readAsText(file, "utf-8");
        });
      },
      e => {
        console.error("文件系统解析失败：", e);
        uni.showToast({ title: "文件路径无效", icon: "none" });
      },
    );
  }
}

// H5端读取文件内容
function readFile(filePath) {
  uni.readFile({
    filePath: filePath,
    success: function (res) {
      try {
        const data = JSON.parse(res.data);
        if (validateData(data)) {
          fileData.value = data;
        } else {
          uni.showToast({
            title: "文件格式不正确",
            icon: "none",
          });
        }
      } catch (e) {
        uni.showToast({
          title: "文件解析失败",
          icon: "none",
        });
      }
    },
    fail: function (err) {
      uni.showToast({
        title: "读取文件失败",
        icon: "none",
      });
    },
  });
}

// 验证数据格式
function validateData(data) {
  return (
    data && typeof data.totalAmount === "string" && Array.isArray(data.records)
  );
}

// 恢复数据
function restoreData() {
  if (!fileData.value) return;

  try {
    // 保存数据到本地存储
    uni.setStorageSync("sbk_total_amount", fileData.value.totalAmount);
    uni.setStorageSync("sbk_records", fileData.value.records);

    uni.showToast({
      title: "数据恢复成功",
      icon: "success",
    });

    // 延迟返回上一页
    setTimeout(() => {
      navigateBack();
    }, 1500);
  } catch (e) {
    uni.showToast({
      title: "数据恢复失败",
      icon: "none",
    });
  }
}

// 返回上一页
function navigateBack() {
  uni.navigateBack();
}

onLoad(() => {
  // 页面加载时的初始化操作
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

  .import-section {
    margin-top: 22rpx;

    .import-btn {
      width: 100%;
      height: 80rpx;
      line-height: 80rpx;
      border-radius: 999rpx;
      border: 2rpx solid #4caf87;
      background: rgba(76, 175, 135, 0.08);
      color: #4caf87;
      font-size: 30rpx;
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

    .file-name {
      display: block;
      margin-top: 16rpx;
      font-size: 26rpx;
      color: #666666;
      text-align: center;
      word-break: break-all;
    }
  }

  .data-preview {
    margin-top: 24rpx;
    padding: 24rpx;
    background: rgba(255, 255, 255, 0.72);
    border-radius: 28rpx;

    .preview-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #333333;
      margin-bottom: 16rpx;
    }

    .preview-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12rpx 0;
      border-bottom: 2rpx solid rgba(56, 142, 107, 0.08);

      &:last-child {
        border-bottom: none;
      }

      .preview-label {
        font-size: 26rpx;
        color: #666666;
      }

      .preview-value {
        font-size: 26rpx;
        color: #333333;
        font-weight: 500;
      }
    }
  }

  .restore-btn {
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
