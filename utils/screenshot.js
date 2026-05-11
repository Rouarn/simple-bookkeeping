/**
 * 绘制支出记录卡片并保存为图片（支持 H5 / 微信小程序 / App）
 * @param {Array} records - 支出记录数组
 * @param {string} totalAmount - 初始金额
 * @param {string} filename - 保存的文件名（不含扩展名）
 */
export function drawRecordsCardAndSave(
  records,
  totalAmount,
  filename = "screenshot",
) {
  // ====== H5 平台 ======
  // #ifdef H5
  try {
    const canvas = document.createElement("canvas");
    const scale = 2;
    const width = 600;
    const height = calculateCanvasHeight(records);

    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    drawRecordsCard(ctx, width, height, records, totalAmount);

    const dataUrl = canvas.toDataURL("image/png");
    saveImageH5(dataUrl, `${filename}.png`);
  } catch (e) {
    console.error("H5 绘制失败:", e);
    uni.showToast({ title: "生成图片失败", icon: "none" });
  }
  // #endif

  // ====== 微信小程序 ======
  // #ifdef MP-WEIXIN
  try {
    uni.showLoading({ title: "生成图片中..." });

    const width = 600;
    const height = calculateCanvasHeight(records);

    const query = uni.createSelectorQuery();
    query
      .select("#share-canvas")
      .fields({ node: true, size: true })
      .exec(res => {
        if (!res[0]) {
          uni.hideLoading();
          uni.showToast({ title: "未找到 canvas", icon: "none" });
          return;
        }

        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");

        const dpr = uni.getSystemInfoSync().pixelRatio;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        drawRecordsCard(ctx, width, height, records, totalAmount);

        wx.canvasToTempFilePath({
          canvas: canvas,
          width: width,
          height: height,
          destWidth: width * 2,
          destHeight: height * 2,
          success: res => {
            uni.hideLoading();
            saveImageMP(res.tempFilePath, `${filename}.png`);
          },
          fail: e => {
            console.error("转换失败:", e);
            uni.hideLoading();
            uni.showToast({ title: "生成图片失败", icon: "none" });
          },
        });
      });
  } catch (e) {
    console.error("微信小程序绘制失败:", e);
    uni.hideLoading();
    uni.showToast({ title: "生成图片失败", icon: "none" });
  }
  // #endif

  // ====== App（Android / iOS） ======
  // #ifdef APP-PLUS
  try {
    uni.showLoading({ title: "生成图片中..." });

    const width = 600;
    const height = calculateCanvasHeight(records);
    const dpr = uni.getSystemInfoSync().pixelRatio || 2;

    const ctx = uni.createCanvasContext("share-canvas");

    drawRecordsCardUniApp(ctx, width, height, records, totalAmount);

    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasToTempFilePath({
          canvasId: "share-canvas",
          x: 0,
          y: 0,
          width: width,
          height: height,
          destWidth: width * dpr,
          destHeight: height * dpr,
          success: res => {
            uni.hideLoading();
            plus.gallery.save(
              res.tempFilePath,
              () => {
                uni.showToast({ title: "已保存到相册", icon: "success" });
              },
              e => {
                console.error("保存到相册失败:", e);
                uni.showToast({ title: "保存失败", icon: "none" });
              },
            );
          },
          fail: e => {
            console.error("转换失败:", e);
            uni.hideLoading();
            uni.showToast({ title: "生成图片失败", icon: "none" });
          },
        });
      }, 300);
    });
  } catch (e) {
    console.error("App 绘制失败:", e);
    uni.hideLoading();
    uni.showToast({ title: "生成图片失败", icon: "none" });
  }
  // #endif

  // ====== 其他平台 ======
  // #ifndef H5 || MP-WEIXIN || APP-PLUS
  uni.showToast({ title: "当前平台不支持", icon: "none" });
  // #endif
}

// 计算 canvas 高度
function calculateCanvasHeight(records) {
  const headerHeight = 160;
  const tableHeaderHeight = 80;
  const rowHeight = 80;
  const emptyHeight = 200;
  const footerHeight = 100;
  const padding = 40;

  if (records.length === 0) {
    return headerHeight + emptyHeight + footerHeight + padding * 2;
  }
  return (
    headerHeight +
    tableHeaderHeight +
    records.length * rowHeight +
    footerHeight +
    padding * 2
  );
}

// 绘制支出记录卡片（Canvas 2D API）
function drawRecordsCard(ctx, width, height, records, totalAmount) {
  const padding = 40;
  const contentWidth = width - padding * 2;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  drawRoundedRect(
    ctx,
    padding,
    padding,
    contentWidth,
    height - padding * 2,
    44,
    "rgba(255, 255, 255, 0.86)",
  );

  ctx.fillStyle = "#1d1d1f";
  ctx.font = "bold 30px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("支出记录", padding + 20, padding + 30);

  const tableHeaderY = padding + 90;
  drawRoundedRect(
    ctx,
    padding + 20,
    tableHeaderY,
    contentWidth - 40,
    70,
    22,
    "rgba(102, 194, 165, 0.16)",
  );

  ctx.fillStyle = "#388e6b";
  ctx.font = "bold 26px sans-serif";

  ctx.textAlign = "left";
  ctx.fillText("日期", padding + 38, tableHeaderY + 22);

  ctx.textAlign = "center";
  ctx.fillText(
    "项目",
    padding + 20 + (contentWidth - 40) / 2,
    tableHeaderY + 22,
  );

  ctx.textAlign = "right";
  ctx.fillText("金额", padding + contentWidth - 38, tableHeaderY + 22);

  let footerY;

  if (records.length === 0) {
    drawEmptyState(ctx, width, padding + 180);
    footerY = padding + 180 + 200;
  } else {
    let rowY = tableHeaderY + 78;
    records.forEach((record, index) => {
      if (index < records.length - 1) {
        ctx.strokeStyle = "rgba(56, 142, 107, 0.08)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding + 20, rowY + 78);
        ctx.lineTo(padding + contentWidth - 20, rowY + 78);
        ctx.stroke();
      }

      ctx.fillStyle = "#333333";
      ctx.font = "28px sans-serif";

      ctx.textAlign = "left";
      ctx.fillText(record.date || "", padding + 38, rowY + 25);

      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(51, 51, 51, 0.92)";
      ctx.fillText(
        record.item || "",
        padding + 20 + (contentWidth - 40) / 2,
        rowY + 25,
      );

      ctx.textAlign = "right";
      ctx.fillStyle = "#4caf87";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText(
        `¥${record.amount || 0}`,
        padding + contentWidth - 38,
        rowY + 25,
      );

      rowY += 80;
    });
    footerY = tableHeaderY + 78 + records.length * 80;
  }

  drawFooterInfo(ctx, width, footerY, totalAmount, records.length);
}

// uni-app canvas API 绘制（适配 uni.createCanvasContext）
function drawRecordsCardUniApp(ctx, width, height, records, totalAmount) {
  const padding = 40;
  const contentWidth = width - padding * 2;

  ctx.setFillStyle("#ffffff");
  ctx.fillRect(0, 0, width, height);

  drawRoundedRectUniApp(
    ctx,
    padding,
    padding,
    contentWidth,
    height - padding * 2,
    44,
    "rgba(255, 255, 255, 0.86)",
  );

  ctx.setFillStyle("#1d1d1f");
  ctx.setFontSize(30);
  ctx.setTextAlign("left");
  ctx.fillText("支出记录", padding + 20, padding + 30);

  const tableHeaderY = padding + 90;
  drawRoundedRectUniApp(
    ctx,
    padding + 20,
    tableHeaderY,
    contentWidth - 40,
    70,
    22,
    "rgba(102, 194, 165, 0.16)",
  );

  ctx.setFillStyle("#388e6b");
  ctx.setFontSize(26);

  ctx.setTextAlign("left");
  ctx.fillText("日期", padding + 38, tableHeaderY + 22);

  ctx.setTextAlign("center");
  ctx.fillText(
    "项目",
    padding + 20 + (contentWidth - 40) / 2,
    tableHeaderY + 22,
  );

  ctx.setTextAlign("right");
  ctx.fillText("金额", padding + contentWidth - 38, tableHeaderY + 22);

  let footerY;

  if (records.length === 0) {
    drawEmptyStateUniApp(ctx, width, padding + 180);
    footerY = padding + 180 + 200;
  } else {
    let rowY = tableHeaderY + 78;
    records.forEach((record, index) => {
      if (index < records.length - 1) {
        ctx.setStrokeStyle("rgba(56, 142, 107, 0.08)");
        ctx.setLineWidth(2);
        ctx.beginPath();
        ctx.moveTo(padding + 20, rowY + 78);
        ctx.lineTo(padding + contentWidth - 20, rowY + 78);
        ctx.stroke();
      }

      ctx.setFillStyle("#333333");
      ctx.setFontSize(28);

      ctx.setTextAlign("left");
      ctx.fillText(record.date || "", padding + 38, rowY + 25);

      ctx.setTextAlign("center");
      ctx.setFillStyle("rgba(51, 51, 51, 0.92)");
      ctx.fillText(
        record.item || "",
        padding + 20 + (contentWidth - 40) / 2,
        rowY + 25,
      );

      ctx.setTextAlign("right");
      ctx.setFillStyle("#4caf87");
      ctx.setFontSize(28);
      ctx.fillText(
        `¥${record.amount || 0}`,
        padding + contentWidth - 38,
        rowY + 25,
      );

      rowY += 80;
    });
    footerY = tableHeaderY + 78 + records.length * 80;
  }

  drawFooterInfoUniApp(ctx, width, footerY, totalAmount, records.length);
}

// 绘制底部信息
function drawFooterInfo(ctx, width, startY, totalAmount, recordCount) {
  const padding = 40;
  const contentWidth = width - padding * 2;
  const centerX = width / 2;

  const bgY = startY + 20;
  drawRoundedRect(
    ctx,
    padding + 20,
    bgY,
    contentWidth - 40,
    80,
    44,
    "rgba(255, 255, 255, 0.86)",
  );

  ctx.fillStyle = "rgba(56, 142, 107, 0.88)";
  ctx.font = "26px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `包含初始金额 ¥${totalAmount || 0} 及支出记录 ${recordCount} 条`,
    centerX,
    bgY + 40,
  );
}

// uni-app 绘制底部信息
function drawFooterInfoUniApp(ctx, width, startY, totalAmount, recordCount) {
  const padding = 40;
  const contentWidth = width - padding * 2;
  const centerX = width / 2;

  const bgY = startY + 20;
  drawRoundedRectUniApp(
    ctx,
    padding + 20,
    bgY,
    contentWidth - 40,
    80,
    44,
    "rgba(255, 255, 255, 0.86)",
  );

  ctx.setFillStyle("rgba(56, 142, 107, 0.88)");
  ctx.setFontSize(26);
  ctx.setTextAlign("center");
  ctx.fillText(
    `包含初始金额 ¥${totalAmount || 0} 及支出记录 ${recordCount} 条`,
    centerX,
    bgY + 40,
  );
}

// 绘制圆角矩形
function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle) {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

// uni-app 绘制圆角矩形
function drawRoundedRectUniApp(ctx, x, y, width, height, radius, fillStyle) {
  ctx.setFillStyle(fillStyle);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

// 绘制空状态
function drawEmptyState(ctx, width, startY) {
  const centerX = width / 2;

  drawRoundedRect(
    ctx,
    centerX - 55,
    startY + 100,
    110,
    54,
    26,
    "rgba(56, 142, 107, 0.16)",
  );

  drawLeaf(ctx, centerX - 56, startY + 40, -24);
  drawLeaf(ctx, centerX - 22, startY + 28, 4);
  drawLeaf(ctx, centerX + 10, startY + 42, 26);

  ctx.fillStyle = "#888888";
  ctx.font = "26px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("还没有支出记录哦～", centerX, startY + 180);
}

// uni-app 绘制空状态
function drawEmptyStateUniApp(ctx, width, startY) {
  const centerX = width / 2;

  drawRoundedRectUniApp(
    ctx,
    centerX - 55,
    startY + 100,
    110,
    54,
    26,
    "rgba(56, 142, 107, 0.16)",
  );

  drawLeafUniApp(ctx, centerX - 56, startY + 40, -24);
  drawLeafUniApp(ctx, centerX - 22, startY + 28, 4);
  drawLeafUniApp(ctx, centerX + 10, startY + 42, 26);

  ctx.setFillStyle("#888888");
  ctx.setFontSize(26);
  ctx.setTextAlign("center");
  ctx.fillText("还没有支出记录哦～", centerX, startY + 180);
}

// 绘制叶子
function drawLeaf(ctx, x, y, rotation) {
  ctx.save();
  ctx.translate(x + 23, y + 30);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-23, -30);

  const gradient = ctx.createLinearGradient(0, 0, 46, 60);
  gradient.addColorStop(0, "rgba(102, 194, 165, 0.95)");
  gradient.addColorStop(1, "rgba(76, 175, 135, 0.9)");
  ctx.fillStyle = gradient;
  ctx.globalAlpha = 0.92;

  ctx.beginPath();
  ctx.moveTo(0, 60);
  ctx.bezierCurveTo(0, 30, 23, 0, 46, 0);
  ctx.bezierCurveTo(46, 30, 23, 60, 0, 60);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// uni-app 绘制叶子
function drawLeafUniApp(ctx, x, y, rotation) {
  ctx.save();
  ctx.translate(x + 23, y + 30);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-23, -30);

  ctx.setFillStyle("#66c2a5");

  ctx.beginPath();
  ctx.moveTo(0, 60);
  ctx.bezierCurveTo(0, 30, 23, 0, 46, 0);
  ctx.bezierCurveTo(46, 30, 23, 60, 0, 60);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// H5 平台保存图片
function saveImageH5(dataUrl, filename) {
  try {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    uni.showToast({ title: "保存成功", icon: "success" });
  } catch (e) {
    console.error("保存失败:", e);
    uni.showToast({ title: "保存失败", icon: "none" });
  }
}

// 微信小程序保存图片
function saveImageMP(filePath, filename) {
  try {
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        uni.showToast({ title: "已保存到相册", icon: "success" });
      },
      fail: e => {
        console.error("保存到相册失败:", e);
        uni.showToast({ title: "保存失败", icon: "none" });
      },
    });
  } catch (e) {
    console.error("保存失败:", e);
    uni.showToast({ title: "保存失败", icon: "none" });
  }
}
