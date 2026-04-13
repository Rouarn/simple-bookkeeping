<script>
import {
  initNotification,
  startReminderCheck,
  checkReminder,
} from "./utils/notification";

export default {
  onLaunch: function () {
    console.log("App Launch");
    // #ifdef APP-PLUS
    // 初始化通知功能
    initNotification();
    // 启动定时检查
    startReminderCheck(checkReminder);
    // #endif
  },
  onShow: function () {
    console.log("App Show");
    // #ifdef APP-PLUS
    // 每次应用显示时检查是否需要发送通知
    checkReminder();
    // #endif
  },
  onHide: function () {
    console.log("App Hide");
  },
};
</script>

<style lang="scss">
/*每个页面公共css */
@import "@/uni_modules/uni-scss/index.scss";
/* #ifndef APP-NVUE */
@import "@/static/customicons.css";

// 设置整个项目的背景色
page {
  background-color: #f2f9e7;
  height: 100%;
}

/* #endif */
</style>
