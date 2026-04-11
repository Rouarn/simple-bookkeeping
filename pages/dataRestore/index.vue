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
        <text v-if="selectedFile" class="file-name">
          {{ selectedFile.name }}
        </text>
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

  // 只保留安卓平台功能
  if (platform === "android") {
    if (typeof plus !== "undefined") {
      const main = plus.android.runtimeMainActivity();
      const Intent = plus.android.importClass("android.content.Intent");
      const Activity = plus.android.importClass("android.app.Activity");
      const intent = new Intent(Intent.ACTION_GET_CONTENT);
      intent.setType("application/json");
      intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, false);
      intent.addCategory(Intent.CATEGORY_OPENABLE);
      main.startActivityForResult(intent, 200);

      // 获取回调
      main.onActivityResult = (requestCode, resultCode, data) => {
        if (resultCode == Activity.RESULT_OK) {
          if (data.getData() != null) {
            const uri = data.getData();
            console.log("选择的文件URI：", uri);

            // 直接使用URI读取文件，不获取真实路径
            readFileFromUri(uri);
          }
        }
      };
    } else {
      uni.showToast({ title: "当前环境不支持文件选择", icon: "none" });
    }
  } else {
    uni.showToast({
      title: "仅支持安卓平台",
      icon: "none",
    });
  }
}

// 从URI读取文件
function readFileFromUri(uri) {
  console.log("从URI读取文件：", uri);
  if (typeof plus !== "undefined" && plus.android) {
    try {
      const main = plus.android.runtimeMainActivity();
      const contentResolver = main.getContentResolver();
      plus.android.importClass(contentResolver);

      // 获取文件名
      let fileName = "backup.json";
      try {
        const Cursor = plus.android.importClass("android.database.Cursor");
        const MediaStore = plus.android.importClass(
          "android.provider.MediaStore",
        );
        const cursor = plus.android.invoke(
          contentResolver,
          "query",
          uri,
          null,
          null,
          null,
          null,
        );
        if (cursor) {
          try {
            if (plus.android.invoke(cursor, "moveToFirst")) {
              const columnIndex = plus.android.invoke(
                cursor,
                "getColumnIndexOrThrow",
                MediaStore.MediaColumns.DISPLAY_NAME,
              );
              fileName = plus.android.invoke(cursor, "getString", columnIndex);
              console.log("获取到的文件名：", fileName);
            }
          } finally {
            plus.android.invoke(cursor, "close");
          }
        }
      } catch (e) {
        console.error("获取文件名失败：", e || "未知错误");
      }

      const BufferedReader = plus.android.importClass("java.io.BufferedReader");
      const InputStreamReader = plus.android.importClass(
        "java.io.InputStreamReader",
      );

      // 打开输入流
      console.log("尝试打开输入流");
      const inputStream = plus.android.invoke(
        contentResolver,
        "openInputStream",
        uri,
      );
      console.log("输入流：", inputStream);

      if (inputStream) {
        console.log("输入流打开成功");
        let reader = null;
        try {
          // 读取文件内容
          reader = new BufferedReader(
            new InputStreamReader(inputStream, "utf-8"),
          );

          let line;
          let jsonStr = "";
          while ((line = plus.android.invoke(reader, "readLine")) !== null) {
            jsonStr += line;
          }

          console.log("文件读取完成：", jsonStr);
          try {
            const data = JSON.parse(jsonStr);
            console.log("JSON解析成功：", data);
            if (validateData(data)) {
              console.log("数据验证成功，设置fileData");
              fileData.value = data;
              // 设置选中的文件信息
              selectedFile.value = {
                name: fileName,
                path: "uri://selected",
              };
              uni.showToast({ title: "JSON解析成功", icon: "success" });
            } else {
              console.log("数据验证失败");
              uni.showToast({ title: "文件格式不正确", icon: "none" });
            }
          } catch (err) {
            console.error("JSON格式错误：", err || "未知错误");
            uni.showToast({ title: "JSON格式无效", icon: "none" });
          }
        } finally {
          // 关闭资源
          if (reader) {
            try {
              plus.android.invoke(reader, "close");
            } catch (e) {
              console.error("关闭读取器失败：", e || "未知错误");
            }
          }
          if (inputStream) {
            try {
              plus.android.invoke(inputStream, "close");
            } catch (e) {
              console.error("关闭输入流失败：", e || "未知错误");
            }
          }
        }
      } else {
        console.error("无法打开文件输入流");
        uni.showToast({ title: "无法读取文件", icon: "none" });
      }
    } catch (e) {
      console.error("读取文件异常：", e || "未知错误");
      uni.showToast({ title: "读取文件失败", icon: "none" });
    }
  }
}

// 根据URI获取真实文件路径
function getRealPathFromURI(uri) {
  const main = plus.android.runtimeMainActivity();
  const ContentUris = plus.android.importClass("android.content.ContentUris");
  const Uri = plus.android.importClass("android.net.Uri");
  const Build = plus.android.importClass("android.os.Build");
  const DocumentsContract = plus.android.importClass(
    "android.provider.DocumentsContract",
  );
  const MediaStore = plus.android.importClass("android.provider.MediaStore");

  const contentResolver = main.getContentResolver();
  plus.android.importClass(contentResolver);

  let path = null;

  // 处理不同版本的Android
  if (
    Build.VERSION.SDK_INT >= 19 &&
    DocumentsContract.isDocumentUri(main, uri)
  ) {
    // 处理DocumentUri
    const docId = DocumentsContract.getDocumentId(uri);
    if (
      uri.toString().indexOf("com.android.providers.media.documents") !== -1
    ) {
      const id = docId.split(":")[1];
      const selection = MediaStore.Files.FileColumns._ID + "=?";
      path = getDataColumn(
        main,
        MediaStore.Files.getContentUri("external"),
        selection,
        [id],
      );
    } else if (
      uri.toString().indexOf("com.android.providers.downloads.documents") !== -1
    ) {
      const contentUri = ContentUris.withAppendedId(
        Uri.parse("content://downloads/public_downloads"),
        parseInt(docId),
      );
      path = getDataColumn(main, contentUri, null, null);
    }
  } else if (uri.toString().indexOf("content://") !== -1) {
    // 处理普通ContentUri
    path = getDataColumn(main, uri, null, null);
  } else if (uri.toString().indexOf("file://") !== -1) {
    // 处理文件URI
    path = uri.toString().replace("file://", "");
  }

  return path;
}

// 从ContentProvider获取数据列
function getDataColumn(context, uri, selection, selectionArgs) {
  const contentResolver = context.getContentResolver();
  plus.android.importClass(contentResolver);
  const cursor = contentResolver.query(
    uri,
    ["_data"],
    selection,
    selectionArgs,
    null,
  );

  if (cursor != null) {
    if (cursor.moveToFirst()) {
      const columnIndex = cursor.getColumnIndexOrThrow("_data");
      const path = cursor.getString(columnIndex);
      cursor.close();
      return path;
    }
    cursor.close();
  }
  return null;
}

// 读取并解析JSON文件
function parseJsonFile(filePath) {
  console.log("开始解析文件：", filePath);
  if (typeof plus !== "undefined" && plus.android) {
    console.log("使用Android ContentResolver API读取文件");
    try {
      const main = plus.android.runtimeMainActivity();
      const contentResolver = main.getContentResolver();
      plus.android.importClass(contentResolver);

      const Uri = plus.android.importClass("android.net.Uri");
      const BufferedReader = plus.android.importClass("java.io.BufferedReader");
      const InputStreamReader = plus.android.importClass(
        "java.io.InputStreamReader",
      );

      console.log("原始文件路径：", filePath);

      // 确保路径以file://开头
      let fileUri = filePath;
      if (!filePath.startsWith("file://")) {
        fileUri = "file://" + filePath;
      }
      console.log("处理后的文件URI：", fileUri);

      // 创建Uri对象
      const uri = Uri.parse(fileUri);
      console.log("创建的Uri对象：", uri);

      // 使用ContentResolver打开输入流
      console.log("尝试打开输入流");
      const inputStream = contentResolver.openInputStream(uri);
      console.log("输入流：", inputStream);

      if (inputStream) {
        console.log("输入流打开成功");
        try {
          // 读取文件内容
          const reader = new BufferedReader(
            new InputStreamReader(inputStream, "utf-8"),
          );

          let line;
          let jsonStr = "";
          while ((line = reader.readLine()) !== null) {
            jsonStr += line;
          }

          reader.close();
          inputStream.close();

          console.log("文件读取完成：", jsonStr);
          try {
            const data = JSON.parse(jsonStr);
            console.log("JSON解析成功：", data);
            if (validateData(data)) {
              console.log("数据验证成功，设置fileData");
              fileData.value = data;
              uni.showToast({ title: "JSON解析成功", icon: "success" });
            } else {
              console.log("数据验证失败");
              uni.showToast({ title: "文件格式不正确", icon: "none" });
            }
          } catch (err) {
            console.error("JSON格式错误：", err || "未知错误");
            uni.showToast({ title: "JSON格式无效", icon: "none" });
          }
        } finally {
          if (inputStream) {
            try {
              inputStream.close();
            } catch (e) {
              console.error("关闭输入流失败：", e || "未知错误");
            }
          }
        }
      } else {
        console.error("无法打开文件输入流");
        uni.showToast({ title: "无法读取文件", icon: "none" });
      }
    } catch (e) {
      console.error("读取文件异常：", e || "未知错误");
      uni.showToast({ title: "读取文件失败", icon: "none" });
    }
  } else if (typeof plus !== "undefined" && plus.io) {
    console.log("使用plus.io读取文件");
    // 处理文件路径格式，确保以file://开头
    let fileUrl = filePath;
    if (!filePath.startsWith("file://")) {
      fileUrl = "file://" + filePath;
    }
    console.log("处理后的文件路径：", fileUrl);
    readFileFromPath(fileUrl);
  } else {
    console.error("当前环境不支持文件读取");
    uni.showToast({ title: "当前环境不支持文件读取", icon: "none" });
  }
}

// 从指定路径读取文件
function readFileFromPath(filePath) {
  console.log("从路径读取文件：", filePath);

  // 对于Android 10+系统，使用ContentResolver API读取文件
  if (typeof plus !== "undefined" && plus.android) {
    console.log("使用ContentResolver API读取文件");
    try {
      const main = plus.android.runtimeMainActivity();
      const contentResolver = main.getContentResolver();
      plus.android.importClass(contentResolver);

      // 从文件路径创建Uri
      const Uri = plus.android.importClass("android.net.Uri");
      console.log("原始文件路径：", filePath);

      // 确保路径以file://开头
      let fileUri = filePath;
      if (!filePath.startsWith("file://")) {
        fileUri = "file://" + filePath;
      }
      console.log("处理后的文件URI：", fileUri);

      const uri = Uri.parse(fileUri);
      console.log("创建的Uri对象：", uri);

      // 打开输入流
      const inputStream = contentResolver.openInputStream(uri);
      console.log("输入流：", inputStream);

      if (inputStream) {
        console.log("输入流打开成功");
        try {
          plus.android.importClass(inputStream);
          // 读取文件内容
          const BufferedReader = plus.android.importClass(
            "java.io.BufferedReader",
          );
          const InputStreamReader = plus.android.importClass(
            "java.io.InputStreamReader",
          );
          const reader = new BufferedReader(
            new InputStreamReader(inputStream, "utf-8"),
          );

          let line;
          let jsonStr = "";
          while ((line = reader.readLine()) !== null) {
            jsonStr += line;
          }

          reader.close();
          inputStream.close();

          console.log("文件读取完成：", jsonStr);
          try {
            const data = JSON.parse(jsonStr);
            console.log("JSON解析成功：", data);
            if (validateData(data)) {
              console.log("数据验证成功，设置fileData");
              fileData.value = data;
              uni.showToast({ title: "JSON解析成功", icon: "success" });
            } else {
              console.log("数据验证失败");
              uni.showToast({ title: "文件格式不正确", icon: "none" });
            }
          } catch (err) {
            console.error("JSON格式错误：", err || "未知错误");
            uni.showToast({ title: "JSON格式无效", icon: "none" });
          }
        } finally {
          if (inputStream) {
            try {
              inputStream.close();
            } catch (e) {
              console.error("关闭输入流失败：", e || "未知错误");
            }
          }
        }
      } else {
        console.error("无法打开文件输入流");
        uni.showToast({ title: "无法读取文件", icon: "none" });
      }
    } catch (e) {
      console.error("读取文件异常：", e || "未知错误");
      uni.showToast({ title: "读取文件失败", icon: "none" });
    }
  } else {
    // 回退到原来的方式
    console.log("使用plus.io读取文件");
    plus.io.resolveLocalFileSystemURL(
      filePath,
      entry => {
        console.log("文件系统解析成功：", entry);
        entry.file(
          file => {
            console.log("获取文件对象成功：", file);
            const reader = new plus.io.FileReader();
            reader.onloadend = evt => {
              console.log("文件读取完成：", evt.target.result);
              try {
                const jsonStr = evt.target.result;
                const data = JSON.parse(jsonStr);
                console.log("JSON解析成功：", data);
                if (validateData(data)) {
                  console.log("数据验证成功，设置fileData");
                  fileData.value = data;
                  uni.showToast({ title: "JSON解析成功", icon: "success" });
                } else {
                  console.log("数据验证失败");
                  uni.showToast({ title: "文件格式不正确", icon: "none" });
                }
              } catch (err) {
                console.error("JSON格式错误：", err);
                uni.showToast({ title: "JSON格式无效", icon: "none" });
              }
            };
            reader.onerror = () => {
              console.error("文件读取失败");
              uni.showToast({ title: "读取文件失败", icon: "none" });
            };
            console.log("开始读取文件内容");
            reader.readAsText(file, "utf-8");
          },
          e => {
            console.error("获取文件对象失败：", e);
            uni.showToast({ title: "获取文件失败", icon: "none" });
          },
        );
      },
      e => {
        console.error("文件系统解析失败：", e);
        uni.showToast({ title: "文件路径无效", icon: "none" });
      },
    );
  }
}

// 验证数据格式
function validateData(data) {
  console.log("验证数据格式：", data);
  const isValid =
    data && typeof data.totalAmount === "string" && Array.isArray(data.records);
  console.log("数据验证结果：", isValid);
  return isValid;
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
