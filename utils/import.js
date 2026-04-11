/**
 * 文件导入工具函数模块
 * 提供JSON文件选择、读取和数据验证功能
 * 仅支持安卓平台，使用plus.android API实现
 */

/**
 * 选择JSON文件
 * @param {Function} successCallback 成功回调函数，接收两个参数：
 *   - fileData: 解析后的JSON数据对象
 *   - fileName: 文件名
 * @param {Function} errorCallback 错误回调函数，接收错误信息字符串
 * @description 打开系统文件选择器，让用户选择JSON文件，仅支持安卓平台
 */
export function selectJsonFile(successCallback, errorCallback) {
  // 获取系统信息，判断平台类型
  const systemInfo = uni.getSystemInfoSync();
  const platform = systemInfo.platform;

  // 只支持安卓平台
  if (platform === "android") {
    // 检查plus环境是否可用
    if (typeof plus !== "undefined") {
      // 获取安卓主活动
      const main = plus.android.runtimeMainActivity();
      // 导入安卓Intent和Activity类
      const Intent = plus.android.importClass("android.content.Intent");
      const Activity = plus.android.importClass("android.app.Activity");

      // 创建Intent，设置为获取内容模式
      const intent = new Intent(Intent.ACTION_GET_CONTENT);
      // 设置文件类型为JSON
      intent.setType("application/json");
      // 不允许多选
      intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, false);
      // 添加可打开文件的类别
      intent.addCategory(Intent.CATEGORY_OPENABLE);
      // 启动活动，请求码为200
      main.startActivityForResult(intent, 200);

      // 保存原始的onActivityResult回调
      const originalOnActivityResult = main.onActivityResult;

      // 设置活动结果回调
      main.onActivityResult = (requestCode, resultCode, data) => {
        // 检查是否是当前文件选择请求
        if (requestCode === 200 && resultCode == Activity.RESULT_OK) {
          // 检查是否选择了文件
          if (data.getData() != null) {
            // 获取文件URI
            const uri = data.getData();
            console.log("选择的文件URI：", uri);

            // 使用URI读取文件内容
            readFileFromUri(uri, successCallback, errorCallback);
          }
        } else if (originalOnActivityResult) {
          // 如果不是当前请求，调用原始回调
          originalOnActivityResult(requestCode, resultCode, data);
        }
      };
    } else {
      // plus环境不可用
      errorCallback("当前环境不支持文件选择");
    }
  } else {
    // 非安卓平台
    errorCallback("仅支持安卓平台");
  }
}

/**
 * 从URI读取文件
 * @param {Object} uri 文件URI，从系统文件选择器获取
 * @param {Function} successCallback 成功回调函数，接收两个参数：
 *   - fileData: 解析后的JSON数据对象
 *   - fileName: 文件名
 * @param {Function} errorCallback 错误回调函数，接收错误信息字符串
 * @description 从指定URI读取JSON文件内容，解析并验证数据格式
 */
export function readFileFromUri(uri, successCallback, errorCallback) {
  console.log("从URI读取文件：", uri);

  // 检查plus.android环境是否可用
  if (typeof plus !== "undefined" && plus.android) {
    try {
      // 获取安卓主活动
      const main = plus.android.runtimeMainActivity();
      // 获取内容解析器
      const contentResolver = main.getContentResolver();
      plus.android.importClass(contentResolver);

      // 初始化文件名为默认值
      let fileName = "backup.json";

      // 尝试从URI获取文件名
      try {
        // 导入Cursor和MediaStore类
        const Cursor = plus.android.importClass("android.database.Cursor");
        const MediaStore = plus.android.importClass(
          "android.provider.MediaStore",
        );

        // 查询URI获取文件信息
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
            // 移动到第一条记录
            if (plus.android.invoke(cursor, "moveToFirst")) {
              // 获取文件名列索引
              const columnIndex = plus.android.invoke(
                cursor,
                "getColumnIndexOrThrow",
                MediaStore.MediaColumns.DISPLAY_NAME,
              );
              // 获取文件名
              fileName = plus.android.invoke(cursor, "getString", columnIndex);
              console.log("获取到的文件名：", fileName);
            }
          } finally {
            // 关闭游标
            plus.android.invoke(cursor, "close");
          }
        }
      } catch (e) {
        // 获取文件名失败，使用默认文件名
        console.error("获取文件名失败：", e || "未知错误");
      }

      // 导入文件读取相关类
      const BufferedReader = plus.android.importClass("java.io.BufferedReader");
      const InputStreamReader = plus.android.importClass(
        "java.io.InputStreamReader",
      );

      // 尝试打开输入流
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
          // 创建缓冲读取器
          reader = new BufferedReader(
            new InputStreamReader(inputStream, "utf-8"),
          );

          // 读取文件内容
          let line;
          let jsonStr = "";
          while ((line = plus.android.invoke(reader, "readLine")) !== null) {
            jsonStr += line;
          }

          console.log("文件读取完成：", jsonStr);

          try {
            // 解析JSON
            const data = JSON.parse(jsonStr);
            console.log("JSON解析成功：", data);

            // 验证数据格式
            if (validateData(data)) {
              console.log("数据验证成功");
              // 调用成功回调
              successCallback(data, fileName);
            } else {
              console.log("数据验证失败");
              // 数据格式不正确
              errorCallback("文件格式不正确");
            }
          } catch (err) {
            // JSON解析失败
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
        // 无法打开输入流
        console.error("无法打开文件输入流");
        errorCallback("无法读取文件");
      }
    } catch (e) {
      // 读取文件异常
      console.error("读取文件异常：", e || "未知错误");
      errorCallback("读取文件失败");
    }
  } else {
    // 环境不支持文件读取
    errorCallback("当前环境不支持文件读取");
  }
}

/**
 * 验证数据格式
 * @param {Object} data 要验证的数据对象
 * @returns {boolean} 是否有效
 * @description 验证导入的JSON数据是否符合预期格式，
 *   要求包含totalAmount字符串字段和records数组字段
 */
export function validateData(data) {
  console.log("验证数据格式：", data);
  // 验证数据是否存在，且包含totalAmount字符串字段和records数组字段
  const isValid =
    data && typeof data.totalAmount === "string" && Array.isArray(data.records);
  console.log("数据验证结果：", isValid);
  return isValid;
}
