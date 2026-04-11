// 文件导入工具函数

/**
 * 选择JSON文件
 * @param {Function} successCallback 成功回调函数，接收fileData和fileName
 * @param {Function} errorCallback 错误回调函数
 */
export function selectJsonFile(successCallback, errorCallback) {
  const systemInfo = uni.getSystemInfoSync();
  const platform = systemInfo.platform;

  // 只支持安卓平台
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

            // 直接使用URI读取文件
            readFileFromUri(uri, successCallback, errorCallback);
          }
        }
      };
    } else {
      errorCallback("当前环境不支持文件选择");
    }
  } else {
    errorCallback("仅支持安卓平台");
  }
}

/**
 * 从URI读取文件
 * @param {Object} uri 文件URI
 * @param {Function} successCallback 成功回调函数，接收fileData和fileName
 * @param {Function} errorCallback 错误回调函数
 */
export function readFileFromUri(uri, successCallback, errorCallback) {
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
              console.log("数据验证成功");
              successCallback(data, fileName);
            } else {
              console.log("数据验证失败");
              errorCallback("文件格式不正确");
            }
          } catch (err) {
            console.error("JSON格式错误：", err || "未知错误");
            errorCallback("JSON格式无效");
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
        errorCallback("无法读取文件");
      }
    } catch (e) {
      console.error("读取文件异常：", e || "未知错误");
      errorCallback("读取文件失败");
    }
  } else {
    errorCallback("当前环境不支持文件读取");
  }
}

/**
 * 验证数据格式
 * @param {Object} data 要验证的数据
 * @returns {boolean} 是否有效
 */
export function validateData(data) {
  console.log("验证数据格式：", data);
  const isValid = data && typeof data.totalAmount === "string" && Array.isArray(data.records);
  console.log("数据验证结果：", isValid);
  return isValid;
}
