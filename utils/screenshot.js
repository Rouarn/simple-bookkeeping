/**
 * 绘制支出记录卡片并保存为图片（支持 H5 / 微信小程序 / App）
 * @param {Array} records - 支出记录数组
 * @param {string} totalAmount - 初始金额
 * @param {string} filename - 保存的文件名（不含扩展名）
 */
export function drawRecordsCardAndSave(records, totalAmount, filename = "screenshot") {
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
    query.select('#share-canvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) {
          uni.hideLoading();
          uni.showToast({ title: "未找到 canvas", icon: "none" });
          return;
        }
        
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
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
          success: (res) => {
            uni.hideLoading();
            saveImageMP(res.tempFilePath, `${filename}.png`);
          },
          fail: (e) => {
            console.error('转换失败:', e);
            uni.hideLoading();
            uni.showToast({ title: '生成图片失败', icon: 'none' });
          }
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
    const width = 600;
    const height = calculateCanvasHeight(records);
    
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext("2d");
    drawRecordsCard(ctx, width, height, records, totalAmount);
    
    const dataUrl = canvas.toDataURL("image/png");
    saveImageAPP(dataUrl, `${filename}.png`);
  } catch (e) {
    console.error("App 绘制失败:", e);
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
  return headerHeight + tableHeaderHeight + records.length * rowHeight + footerHeight + padding * 2;
}

// 绘制支出记录卡片
function drawRecordsCard(ctx, width, height, records, totalAmount) {
  const padding = 40;
  const contentWidth = width - padding * 2;
  
  // 绘制背景
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  
  // 绘制白色卡片背景
  drawRoundedRect(ctx, padding, padding, contentWidth, height - padding * 2, 44, "rgba(255, 255, 255, 0.86)");
  
  // 绘制卡片标题
  ctx.fillStyle = "#1d1d1f";
  ctx.font = "bold 30px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("支出记录", padding + 20, padding + 30);
  
  // 绘制表格头
  const tableHeaderY = padding + 90;
  drawRoundedRect(ctx, padding + 20, tableHeaderY, contentWidth - 40, 70, 22, "rgba(102, 194, 165, 0.16)");
  
  ctx.fillStyle = "#388e6b";
  ctx.font = "bold 26px sans-serif";
  
  ctx.textAlign = "left";
  ctx.fillText("日期", padding + 38, tableHeaderY + 22);
  
  ctx.textAlign = "center";
  ctx.fillText("项目", padding + 20 + (contentWidth - 40) / 2, tableHeaderY + 22);
  
  ctx.textAlign = "right";
  ctx.fillText("金额", padding + contentWidth - 38, tableHeaderY + 22);
  
  let footerY;
  
  if (records.length === 0) {
    // 绘制空状态
    drawEmptyState(ctx, width, padding + 180);
    footerY = padding + 180 + 200;
  } else {
    // 绘制记录
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
      ctx.fillText(record.item || "", padding + 20 + (contentWidth - 40) / 2, rowY + 25);
      
      ctx.textAlign = "right";
      ctx.fillStyle = "#4caf87";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText(`¥${record.amount || 0}`, padding + contentWidth - 38, rowY + 25);
      
      rowY += 80;
    });
    footerY = tableHeaderY + 78 + records.length * 80;
  }
  
  // 绘制底部信息（总金额和记录条数）
  drawFooterInfo(ctx, width, footerY, totalAmount, records.length);
}

// 绘制底部信息
function drawFooterInfo(ctx, width, startY, totalAmount, recordCount) {
  const padding = 40;
  const contentWidth = width - padding * 2;
  const centerX = width / 2;
  
  // 绘制信息背景
  const bgY = startY + 20;
  drawRoundedRect(ctx, padding + 20, bgY, contentWidth - 40, 80, 44, "rgba(255, 255, 255, 0.86)");
  
  // 绘制文本
  ctx.fillStyle = "rgba(56, 142, 107, 0.88)";
  ctx.font = "26px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`包含初始金额 ¥${totalAmount || 0} 及支出记录 ${recordCount} 条`, centerX, bgY + 40);
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

// 绘制空状态
function drawEmptyState(ctx, width, startY) {
  const centerX = width / 2;
  
  // 绘制花盆
  drawRoundedRect(ctx, centerX - 55, startY + 100, 110, 54, 26, "rgba(56, 142, 107, 0.16)");
  
  // 绘制叶子
  drawLeaf(ctx, centerX - 56, startY + 40, -24);
  drawLeaf(ctx, centerX - 22, startY + 28, 4);
  drawLeaf(ctx, centerX + 10, startY + 42, 26);
  
  // 绘制文本
  ctx.fillStyle = "#888888";
  ctx.font = "26px sans-serif";
  ctx.textAlign = "center";
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
      fail: (e) => {
        console.error("保存到相册失败:", e);
        uni.showToast({ title: "保存失败", icon: "none" });
      }
    });
  } catch (e) {
    console.error("保存失败:", e);
    uni.showToast({ title: "保存失败", icon: "none" });
  }
}

// App 平台保存图片
function saveImageAPP(dataUrl, filename) {
  try {
    uni.showLoading({ title: "保存中..." });
    
    const bitmap = new plus.nativeObj.Bitmap();
    bitmap.loadBase64Data(dataUrl.replace(/^data:image\/\w+;base64,/, ""), () => {
      const tempPath = `${plus.io.convertLocalFileSystemURL('_doc')}/${filename}`;
      bitmap.save(tempPath, {
        overwrite: true,
        quality: 100,
        format: 'png'
      }, (file) => {
        bitmap.clear();
        uni.hideLoading();
        
        plus.gallery.save(file.target, () => {
          uni.showToast({ title: "已保存到相册", icon: "success" });
        }, (e) => {
          console.error("保存到相册失败:", e);
          uni.showToast({ title: "保存成功", icon: "success" });
        });
      }, (e) => {
        console.error("保存图片失败:", e);
        bitmap.clear();
        uni.hideLoading();
        uni.showToast({ title: "保存失败", icon: "none" });
      });
    }, (e) => {
      console.error("加载位图失败:", e);
      uni.hideLoading();
      uni.showToast({ title: "保存失败", icon: "none" });
    });
  } catch (e) {
    console.error("App 保存失败:", e);
    uni.hideLoading();
    uni.showToast({ title: "保存失败", icon: "none" });
  }
}
