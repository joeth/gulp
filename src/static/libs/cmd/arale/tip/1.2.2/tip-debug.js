define("arale/tip/1.2.2/tip-debug", [ "$-debug", "./basic-tip-debug", "arale/popup/1.1.6/popup-debug", "arale/overlay/1.1.4/overlay-debug", "arale/position/1.0.1/position-debug", "arale/iframe-shim/1.0.2/iframe-shim-debug", "arale/widget/1.1.1/widget-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug", "./tip-debug.css", "./tip-debug.tpl" ], function(require, exports, module) {
    var $ = require("$-debug");
    var BasicTip = require("./basic-tip-debug");
    // 依赖样式 alice/poptip@1.1.1
    require("./tip-debug.css");
    // 气泡提示弹出组件
    // ---
    var Tip = BasicTip.extend({
        attrs: {
            template: require("./tip-debug.tpl"),
            // 提示内容
            content: "A TIP BOX",
            // 箭头位置
            // 按钟表点位置，目前支持1、2、5、7、10、11点位置
            // https://i.alipayobjects.com/e/201307/jBty06lQT.png
            arrowPosition: 7,
            align: {
                setter: function(val) {
                    // 用户初始化时主动设置了 align
                    // 且并非来自 arrowPosition 的设置
                    if (val && !val.comeFromArrowPosition) {
                        this._specifiedAlign = true;
                    }
                    return val;
                }
            },
            // 颜色 [orange|blue|white]
            theme: "orange",
            // 当弹出层显示在屏幕外时，是否自动转换浮层位置
            inViewport: false
        },
        setup: function() {
            BasicTip.superclass.setup.call(this);
            this._originArrowPosition = this.get("arrowPosition");
            this.after("show", function() {
                this._makesureInViewport();
            });
        },
        _makesureInViewport: function() {
            if (!this.get("inViewport")) {
                return;
            }
            var ap = this._originArrowPosition, scrollTop = $(window).scrollTop(), viewportHeight = $(window).outerHeight(), elemHeight = this.element.height() + this.get("distance"), triggerTop = this.get("trigger").offset().top, triggerHeight = this.get("trigger").height(), arrowMap = {
                "1": 5,
                "5": 1,
                "7": 11,
                "11": 7
            };
            if ((ap == 11 || ap == 1) && triggerTop + triggerHeight > scrollTop + viewportHeight - elemHeight) {
                // tip 溢出屏幕下方
                this.set("arrowPosition", arrowMap[ap]);
            } else if ((ap == 7 || ap == 5) && triggerTop < scrollTop + elemHeight) {
                // tip 溢出屏幕上方
                this.set("arrowPosition", arrowMap[ap]);
            } else {
                // 复原
                this.set("arrowPosition", this._originArrowPosition);
            }
        },
        // 用于 set 属性后的界面更新
        _onRenderArrowPosition: function(val, prev) {
            val = parseInt(val, 10);
            var arrow = this.$(".poptip-arrow");
            arrow.removeClass("poptip-arrow-" + prev).addClass("poptip-arrow-" + val);
            // 用户设置了 align
            // 则直接使用 align 表示的位置信息，忽略 arrowPosition
            if (this._specifiedAlign) {
                return;
            }
            var direction = "", arrowShift = 0;
            if (val === 10) {
                direction = "right";
                arrowShift = 20;
            } else if (val === 11) {
                direction = "down";
                arrowShift = 22;
            } else if (val === 1) {
                direction = "down";
                arrowShift = -22;
            } else if (val === 2) {
                direction = "left";
                arrowShift = 20;
            } else if (val === 5) {
                direction = "up";
                arrowShift = -22;
            } else if (val === 7) {
                direction = "up";
                arrowShift = 22;
            }
            this.set("direction", direction);
            this.set("arrowShift", arrowShift);
            this._setAlign();
        },
        _onRenderWidth: function(val) {
            this.$('[data-role="content"]').css("width", val);
        },
        _onRenderHeight: function(val) {
            this.$('[data-role="content"]').css("height", val);
        },
        _onRenderTheme: function(val, prev) {
            this.element.removeClass("poptip-" + prev);
            this.element.addClass("poptip-" + val);
        }
    });
    module.exports = Tip;
    module.exports.outerBoxClass = "arale-tip-1_2_2";
});

define("arale/tip/1.2.2/basic-tip-debug", [ "arale/popup/1.1.6/popup-debug", "$-debug", "arale/overlay/1.1.4/overlay-debug", "arale/position/1.0.1/position-debug", "arale/iframe-shim/1.0.2/iframe-shim-debug", "arale/widget/1.1.1/widget-debug", "arale/base/1.1.1/base-debug", "arale/class/1.1.0/class-debug", "arale/events/1.1.0/events-debug" ], function(require, exports, module) {
    var Popup = require("arale/popup/1.1.6/popup-debug");
    // 通用提示组件
    // 兼容站内各类样式
    module.exports = Popup.extend({
        attrs: {
            // 提示内容
            content: null,
            // 提示框在目标的位置方向 [up|down|left|right]
            direction: "up",
            // 提示框离目标距离(px)
            distance: 8,
            // 箭头偏移位置(px)，负数表示箭头位置从最右边或最下边开始算
            arrowShift: 22,
            // 箭头指向 trigger 的水平或垂直的位置
            pointPos: "50%"
        },
        _setAlign: function() {
            var alignObject = {}, arrowShift = this.get("arrowShift"), distance = this.get("distance"), pointPos = this.get("pointPos"), direction = this.get("direction");
            if (arrowShift < 0) {
                arrowShift = "100%" + arrowShift;
            }
            if (direction === "up") {
                alignObject.baseXY = [ pointPos, 0 ];
                alignObject.selfXY = [ arrowShift, "100%+" + distance ];
            } else if (direction === "down") {
                alignObject.baseXY = [ pointPos, "100%+" + distance ];
                alignObject.selfXY = [ arrowShift, 0 ];
            } else if (direction === "left") {
                alignObject.baseXY = [ 0, pointPos ];
                alignObject.selfXY = [ "100%+" + distance, arrowShift ];
            } else if (direction === "right") {
                alignObject.baseXY = [ "100%+" + distance, pointPos ];
                alignObject.selfXY = [ 0, arrowShift ];
            }
            alignObject.comeFromArrowPosition = true;
            this.set("align", alignObject);
        },
        // 用于 set 属性后的界面更新
        _onRenderContent: function(val) {
            var ctn = this.$('[data-role="content"]');
            if (typeof val !== "string") {
                val = val.call(this);
            }
            ctn && ctn.html(val);
        }
    });
    module.exports.outerBoxClass = "arale-tip-1_2_2";
});
