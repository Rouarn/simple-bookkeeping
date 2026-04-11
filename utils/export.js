/**
 * 导出 JSON 文件（支持 H5 / 微信小程序 / App）
 * @param {Object} data - 要导出的 JSON 数据对象
 * @param {string} filename - 文件名（不含扩展名，会自动加 .json）
 */
export function exportJsonFile(data, filename = "export") {
  // 确保文件名以 .json 结尾
  if (!filename.endsWith(".json")) {
    filename += ".json";
  }

  const jsonString = JSON.stringify(data, null, 2);

  // ====== H5 平台 ======
  // #ifdef H5
  try {
    const blob = new Blob([jsonString], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // 释放内存
  } catch (e) {
    console.error("H5 导出失败:", e);
    uni.showToast({ title: "导出失败", icon: "none" });
  }
  // #endif

  // ====== 微信小程序 ======
  // #ifdef MP-WEIXIN
  try {
    const fsm = wx.getFileSystemManager();
    const tempFilePath = `${wx.env.USER_DATA_PATH}/${filename}`;

    fsm.writeFile({
      filePath: tempFilePath,
      data: jsonString,
      encoding: "utf8",
      success: () => {
        // 尝试保存到本地（用户可长期访问）
        wx.saveFile({
          tempFilePath: tempFilePath,
          success: res => {
            uni.showToast({ title: "已保存到手机", icon: "success" });
          },
          fail: () => {
            // 如果 saveFile 失败（如空间不足），至少提示用户文件已写入临时目录
            uni.showToast({ title: "已生成文件（未长期保存）", icon: "none" });
            // 可选：打开文件预览（仅限可读格式）
            wx.openDocument({
              filePath: tempFilePath,
              fileType: "txt", // json 会被当作文本
              success: () => {},
              fail: () => {},
            });
          },
        });
      },
      fail: err => {
        console.error("小程序写入失败:", err);
        uni.showToast({ title: "导出失败", icon: "none" });
      },
    });
  } catch (e) {
    console.error("小程序导出异常:", e);
    uni.showToast({ title: "导出失败", icon: "none" });
  }
  // #endif

  // ====== App（Android / iOS） ======
  // #ifdef APP-PLUS
  try {
    plus.io.requestFileSystem(
      plus.io.PRIVATE_DOC,
      fs => {
        fs.root.getFile(
          filename,
          { create: true },
          fileEntry => {
            fileEntry.createWriter(writer => {
              writer.onerror = () => {
                uni.showToast({ title: "保存失败", icon: "none" });
              };
              writer.onwriteend = () => {
                uni.showToast({
                  title: `已保存至应用私有目录\n${fileEntry.toURL()}`,
                  icon: "none",
                  duration: 3000,
                });
              };
              writer.write(jsonString);
            });
          },
          e => {
            console.error("获取文件失败:", e);
            uni.showToast({ title: "无法创建文件", icon: "none" });
          },
        );
      },
      e => {
        console.error("请求文件系统失败:", e);
        uni.showToast({ title: "文件系统错误", icon: "none" });
      },
    );
  } catch (e) {
    console.error("App 导出异常:", e);
    uni.showToast({ title: "导出失败", icon: "none" });
  }
  // #endif

  // ====== 其他平台（可选提示） ======
  // #ifndef H5 || MP-WEIXIN || APP-PLUS
  uni.showToast({ title: "当前平台不支持导出文件", icon: "none" });
  // #endif
}
