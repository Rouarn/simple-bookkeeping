<template>
	<view class="zmm-slider-verify" v-if="isShow" @touchmove.stop.prevent="stopMoveHandle">
		<view class="zmm-slider-verify-mask" :style="{ 'background-color': maskColor }"></view>
		<view class="zmm-slider-verify-wrap" :style="{ 'background-color': wrapColor }">
			<view class="zmm-slider-verify-top">
				<text class="zmm-slider-verify-title">{{ title }}</text>
				<text class="zmm-slider-verify-close" @click="closeHandle">关闭</text>
			</view>
			<view class="zmm-slider-verify-tips">
				<text class="zmm-slider-verify-tips-text">{{ tips }}</text>
			</view>
			<view class="zmm-slider-verify-box">
				<image class="zmm-slider-verify-img" v-if="verifyImg" :src="verifyImg" mode="scaleToFill"></image>
				<image class="zmm-slider-verify-img" v-else src="@/uni_modules/zmm-slider-verify/static/img/Verify.jpg"
					mode="scaleToFill"></image>
				<!-- 右侧用来验证的滑块 -->
				<view class="zmm-slider-verify-block-verify" :style="blockVerifyStyle"></view>
				<!-- 被css操控的滑块 -->
				<view class="zmm-slider-verify-block-move" :style="blockMoveStyle"></view>
				<!-- 手指触摸的滑块 -->
				<view class="zmm-slider-verify-block-touch" :style="blockTouchStyle" @touchstart="touchstartHandle"
					@touchmove="touchmoveHandle" @touchend="touchendHandle" @mousedown="mousedownHandle"
					@mousemove="mousemoveHandle" @mouseup="mouseupHandle">
				</view>
			</view>
			<view class="zmm-slider-verify-slider" v-if="showBottomSlider">
				<!-- 被css操控的滑块 -->
				<view class="zmm-slider-verify-slider-move" :style="sliderMoveStyle"></view>
				<!-- 手指触摸的滑块 -->
				<view class="zmm-slider-verify-slider-touch" :style="sliderTouchStyle" @touchstart="touchstartHandle"
					@touchmove="touchmoveHandle" @touchend="touchendHandle" @mousedown="mousedownHandle"
					@mousemove="mousemoveHandle" @mouseup="mouseupHandle">
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	/**
	 * zmm-slider-verify 滑动验证组件
	 * @description 滑动验证组件
	 * @tutorial https://ext.dcloud.net.cn/plugin?id=10513
	 * @property {String} title 弹窗标题
	 * @property {String} tips 弹窗提示
	 * @property {Number} slideSize 滑块大小
	 * @property {String} slideColor 滑块颜色
	 * @property {String} maskColor 遮罩层背景色
	 * @property {String} wrapColor 主题背景色
	 * @property {String} verifyImg 图片
	 * @property {Number} between 校验正负差值区间像素
	 * @property {Boolean} showBottomSlider 是否显示底部滑动条
	 * @property {String} bottomSlideSize 底部滑块大小
	 * @property {String} bottomSlideColor 底部滑块颜色
	 * @event {Function} success 验证通过事件
	 * @event {Function} error 验证失败事件
	 * @event {Function} close 组件关闭事件
	 */

	export default {
		name: 'zmmSliderVerify',
		emits: ['success', 'error', 'close'],
		props: {
			//标题
			title: {
				type: String,
				default: '滑动校验'
			},
			//提醒
			tips: {
				type: String,
				default: '请将左侧透明滑块拖进白色框内'
			},
			//滑块大小
			slideSize: {
				type: Number,
				default: 40
			},
			//滑块颜色
			slideColor: {
				type: String,
				default: 'rgba(0,0,0,0.4)'
			},
			//遮罩层背景色
			maskColor: {
				type: String,
				default: 'rgba(0,0,0,0.4)'
			},
			// 图片
			verifyImg: {
				type: String,
				default: ''
			},
			//主体背景色
			wrapColor: {
				type: String,
				default: '#ffffff'
			},
			//校验正负差值区间像素
			between: {
				type: Number,
				default: 10
			},
			// 是否显示底部滑动条
			showBottomSlider: {
				type: Boolean,
				default: true
			},
			//底部滑块大小
			bottomSlideSize: {
				type: Number,
				default: 40
			},
			//底部滑块颜色
			bottomSlideColor: {
				type: String,
				default: '#2b94e7'
			},
		},
		data() {
			return {
				startPageX: 0, //开始距离
				moveLeft: 0, //滑动距离
				done: false, //是否成功
				autoLeft: 80, //验证滑块随机的像素
				autoTop: 80, //验证滑块随机的top像素
				isShow: false,
				width: 280 //主体宽度
			};
		},
		computed: {
			blockVerifyStyle() {
				return `top:${this.autoTop}px;left:${this.autoLeft}px;height:${this.slideSize}px;width:${this.slideSize}px;background-color:${this.slideColor};`
			},
			blockMoveStyle() {
				return `top:${this.autoTop}px;left:${this.moveLeft}px;height:${this.slideSize}px;width:${this.slideSize}px;background-color: ${this.slideColor};`
			},
			blockTouchStyle() {
				return `top:${this.autoTop}px;height:${this.slideSize}px;width:${this.slideSize}px;`
			},
			sliderMoveStyle() {
				return `left:${this.moveLeft}px;height:${this.bottomSlideSize}px;width:${this.bottomSlideSize}px;background-color: ${this.bottomSlideColor};`
			},
			sliderTouchStyle() {
				return `height:${this.bottomSlideSize}px;width:${this.bottomSlideSize}px;`
			}
		},
		methods: {
			// 拦截其他触摸事件防止nvue下input等元素层级问题
			stopMoveHandle(e) {
				if (e.preventDefault) {
					// 阻止页面滚动
					e.preventDefault()
				}
			},
			// 随机数
			rMathfloor(min, max) {
				//返回包括最大/小值
				return Math.floor(Math.random() * (max - min + 1)) + min;
			},
			// 初始化
			init() {
				this.moveLeft = 0;
				this.done = false;
				this.autoTop = this.rMathfloor(0, 170 - this.slideSize);
				this.autoLeft = this.rMathfloor(this.slideSize + 20, this.width - this.slideSize);
			},
			// 显示
			show() {
				this.isShow = true;
				this.init()
			},
			// 关闭
			hide() {
				this.closeHandle()
			},
			//按下
			touchstartHandle(e) {
				if (this.done) {
					return;
				}
				this.startPageX = e.changedTouches[0].pageX;
			},
			// 滑动
			touchmoveHandle(e) {
				// 滑动分两个块来操作不然会有数据抖动
				if (this.done) {
					return;
				}
				var left = e.changedTouches[0].pageX - this.startPageX; //补偿起始位置
				// 限制边界
				if (left < 0) {
					left = 0;
				};
				const maxLeft = this.width - this.slideSize;
				if (left > maxLeft) {
					left = maxLeft;
				};
				this.moveLeft = left;
			},
			// 滑动离开（最终）
			touchendHandle(e) {
				var endLeft = e.changedTouches[0].pageX;
				var verifyLeft = this.autoLeft + this.startPageX; //补偿起始位置
				var chazhi = verifyLeft - endLeft; //最终差值
				// 判断是否在正负差值区间
				if (chazhi >= 0 - this.between && chazhi <= this.between) {
					this.done = true;
					// 通过会执行成功和关闭
					this.closeHandle()
					this.$emit('success', '验证通过');
					this.$emit('close', '关闭');
				} else {
					this.$emit('error', '验证失败');
					// 失败会执行失败并重新初始化
					this.init();
					uni.showToast({
						title: this.tips,
						icon: 'none'
					});
				}
			},
			// 关闭事件
			closeHandle() {
				this.isShow = false
				this.$emit('close', '关闭');
			},
			// pc端
			mousedownHandle(e) {
				if (this.done) return;
				this.startPageX = e.pageX;
				this.isDragging = true;
				document.addEventListener('mousemove', this.mousemoveHandle);
				document.addEventListener('mouseup', this.mouseupHandle);
			},
			mousemoveHandle(e) {
				if (!this.isDragging || this.done) return;
				let left = e.pageX - this.startPageX;
				const maxLeft = this.width - this.slideSize;
				if (left < 0) left = 0;
				if (left > maxLeft) left = maxLeft;
				this.moveLeft = left;
			},
			mouseupHandle(e) {
				if (!this.isDragging) return;
				this.isDragging = false;
				document.removeEventListener('mousemove', this.mousemoveHandle);
				document.removeEventListener('mouseup', this.mouseupHandle);
				if (this.done) return;
				var endLeft = e.pageX;
				var verifyLeft = this.autoLeft + this.startPageX;
				var chazhi = verifyLeft - endLeft;
				if (chazhi >= -this.between && chazhi <= this.between) {
					this.done = true;
					this.closeHandle();
					this.$emit('success', '验证通过');
					this.$emit('close', '关闭');
				} else {
					this.$emit('error', '验证失败');
					uni.showToast({
						title: this.tips,
						icon: 'none'
					});
					this.init();
				}
			},
		}
	};
</script>

<style lang="scss" scoped>
	$sliderVerifyWidth: 280px;

	.zmm-slider-verify {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;

		.zmm-slider-verify-mask {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
		}

		.zmm-slider-verify-wrap {
			display: flex;
			flex-direction: column;
			position: relative;
			padding: 34rpx;
			border-radius: 24rpx;
			background-color: #ffffff;

			.zmm-slider-verify-top {
				display: flex;
				flex-direction: row;
				align-items: center;

				.zmm-slider-verify-title {
					flex: 1;
					color: #333;
					font-size: 32rpx;
				}

				.zmm-slider-verify-close {
					font-size: 28rpx;
					color: #333;
				}
			}

			.zmm-slider-verify-tips {
				margin-top: 12rpx;
				margin-bottom: 12rpx;

				.zmm-slider-verify-tips-text {
					color: #999;
					font-size: 28rpx;
				}
			}

			.zmm-slider-verify-box {
				position: relative;
				width: $sliderVerifyWidth;
				height: 170px;
				overflow: hidden;

				.zmm-slider-verify-img {
					width: $sliderVerifyWidth;
					height: 170px;
					border-radius: 8rpx;
				}

				.zmm-slider-verify-block-verify,
				.zmm-slider-verify-block-move,
				.zmm-slider-verify-block-touch {
					position: absolute;
					left: 0px;
					top: 0;
					border-radius: 8rpx;
				}

				.zmm-slider-verify-block-verify {
					border: 1px #fff solid;
					/* #ifndef APP-NVUE */
					box-sizing: border-box;
					/* #endif */
				}
			}

			.zmm-slider-verify-slider {
				margin-top: 34rpx;
				width: $sliderVerifyWidth;
				background-color: rgba(0, 0, 0, 0.07);
				position: relative;
				overflow: hidden;
				border-radius: 8rpx;
				border-radius: 750rpx;

				.zmm-slider-verify-slider-move,
				.zmm-slider-verify-slider-touch {
					border-radius: 750rpx;
				}

				.zmm-slider-verify-slider-move {
					position: absolute;
					left: 0px;
					top: 0px;
					z-index: 1;
				}

				.zmm-slider-verify-slider-touch {
					position: relative;
					z-index: 2;
				}
			}
		}
	}
</style>