// 通知工具函数

/**
 * 初始化通知功能
 */
export function initNotification() {
  console.log("初始化通知功能");
  const appAuthorizeSetting = uni.getAppAuthorizeSetting();
  if (appAuthorizeSetting.notificationAuthorized !== "authorized") {
    setTimeout(() => {
      uni.showModal({
        title: "通知权限",
        content: "请在设置中开启通知权限，以便接收记账提醒",
        confirmText: "去设置",
        cancelText: "取消",
        success: function (res) {
          if (res.confirm) {
            uni.openAppAuthorizeSetting({
              success: res => {
                console.log("success", res);
              },
            });
          }
        },
      });
    }, 1000);
  }
}

/**
 * 启动定时检查
 * @param {Function} checkReminder - 检查提醒的函数
 */
export function startReminderCheck(checkReminder) {
  // 每分钟检查一次
  setInterval(() => {
    checkReminder();
  }, 60000);
}

/**
 * 检查是否需要发送提醒
 */
export function checkReminder() {
  // 从本地存储获取设置
  const settings = uni.getStorageSync("reminderSettings");
  if (settings && settings.isNotificationEnabled) {
    // 提醒已开启
    const reminderTime = settings.reminderTime || "20:00";
    const currentTime = new Date();
    const currentHour = currentTime.getHours().toString().padStart(2, "0");
    const currentMinute = currentTime.getMinutes().toString().padStart(2, "0");
    const currentTimeStr = `${currentHour}:${currentMinute}`;

    // 检查是否到了提醒时间
    if (currentTimeStr === reminderTime) {
      sendNotification();
    }
  }
}

/**
 * 发送通知
 */
export function sendNotification() {
  try {
    // 检查平台
    const platform = uni.getSystemInfoSync().platform;

    if (platform === "android" || platform === "ios") {
      // App 平台
      if (uni.createPushMessage) {
        uni.createPushMessage({
          title: "记账提醒",
          content: "该记账了哦！",
          badge: 1,
          icon: "/static/01.png", // 设置通知图标
          success: res => {
            console.log("通知发送成功", res);
          },
          fail: err => {
            console.log("通知发送失败", err);
            // 检查是否是权限问题
            if (err.errCode === 10001 || err.errMsg.includes("permission")) {
              // 引导用户去设置页面授权
              uni.showModal({
                title: "通知权限",
                content: "请在设置中开启通知权限，以便接收记账提醒",
                confirmText: "去设置",
                cancelText: "取消",
                success: function (res) {
                  if (res.confirm) {
                    // 跳转到应用设置页面
                    openSettingsPage();
                  }
                },
              });
            }
          },
        });
      } else {
        console.log("当前环境不支持 uni.createPushMessage");
      }
    }
  } catch (error) {
    console.log("发送通知出错:", error);
  }
}
