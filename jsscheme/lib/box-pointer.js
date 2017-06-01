var BoxAndPointer = (function(){
    const BOX_SIZE = 30;
    const GAP_X = BOX_SIZE * 2 + 20;
    const GAP_Y = BOX_SIZE + 20;
    
    /**
    @class 盒子
    @param content 基本对象类型或Pointer的实例
    */
    function Box(content, x, y) {
        this.content = content;
        Vector2.call(this, x, y);
    }
    Box.prototype.draw = function(ctx) {
        var content = this.content;
        if(content instanceof Pointer) {
            drawBox(ctx, this.x, this.y);
            // 画连接点
            ctx.beginPath();
            ctx.arc(this.x + BOX_SIZE / 2, this.y + BOX_SIZE / 2,
                Math.floor(BOX_SIZE / 2 * 0.2), 0, (Math.PI * 360) / 180, false);
            ctx.stroke();
            ctx.fill();
            content.draw(ctx);
        } else if(content instanceof scheme.Object) {
            drawBox(ctx, this.x, this.y);
            // 如果是空表，画空表表示
            if(scheme.isEmptyList(content)) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + BOX_SIZE);
                ctx.lineTo(this.x + BOX_SIZE, this.y);
                ctx.stroke();
            }
            // 画基本对象内容
            else {
                var text = scheme.writeToString(content).toString();
                var fontSize = Math.floor(BOX_SIZE / 2);
                var textWidth = fontSize * text.length - 10;
                ctx.font = "normal " + fontSize + "px 'Courier New'";
                ctx.fillText(text, this.x + (BOX_SIZE - textWidth) / 2, this.y + fontSize * 1.3);
            }
        }
    }
    
    function drawBox(ctx, x, y) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, BOX_SIZE, BOX_SIZE);
    }
    
    /**
    @class 指向盒子的指针
    */
    function Pointer(pointTo, startVector, endVector) {
        this.pointTo = pointTo;
        this.startVector = startVector;
        this.endVector = endVector;
    }
    Pointer.prototype.draw = function(ctx) {
        //画箭头 
        drawArrow(ctx,
            this.startVector.x, this.startVector.y,
            this.endVector.x, this.endVector.y,
            1, 1, 18, 6, "black", 1);
        
        this.pointTo.draw(ctx);
    }

    /**
    @class 序对表示为一对盒子的图形
    @param carBox 包含指向car的指针的盒子
    @param cdrBox 包含指向cdr的指针的盒子
    */
    function DrawablePair(carBox, cdrBox) {
        this.carBox = carBox;
        this.cdrBox = cdrBox;
    }
    DrawablePair.cons = function(carBox, cdrBox) {
        return new DrawablePair(carBox, cdrBox);
    }
    DrawablePair.prototype.draw = function(ctx) {
        this.carBox.draw(ctx);
        this.cdrBox.draw(ctx);
    }

    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }
    
    /**
    将scheme对象（基本对象/序对）转化为盒子-指针数据结构
    @param obj scheme对象
    */
    function toBoxAndPointer(obj) {
        var drawable = toBoxAndPointer(obj);
        var ptr = new Pointer(drawable);
        return ptr;
        
        function toBoxAndPointer(obj) {
            if(scheme.isPair(obj)) {
                var dpair = new DrawablePair();
                dpair.carBox = new Box(new Pointer(toBoxAndPointer(scheme.car(obj))));
                dpair.cdrBox = new Box(new Pointer(toBoxAndPointer(scheme.cdr(obj))));
                return dpair;
            } else {
                var box = new Box(obj);
                return box;
            }
        }
    }
    
    function calc(drawable) {
        var ptr = drawable;
        
        calc(ptr.pointTo, 50, 10, 0);
        
        if(ptr.pointTo instanceof DrawablePair) {
            var dpair = ptr.pointTo;
            ptr.startVector = new Vector2(0, dpair.carBox.y + BOX_SIZE / 2);
            ptr.endVector = new Vector2(dpair.carBox.x, dpair.carBox.y + BOX_SIZE / 2);
        } else {
            var box = ptr.pointTo;
            ptr.startVector = new Vector2(0, box.y + BOX_SIZE / 2);
            ptr.endVector = new Vector2(box.x, box.y + BOX_SIZE / 2);
        }
        
        return ptr;
        
        function calc(drawable, x, y, level) {
            var gapX = GAP_X;
            var gapY = GAP_Y;
            if(drawable instanceof DrawablePair) {
                var carBox = drawable.carBox;
                var cdrBox = drawable.cdrBox;
                carBox.x = x;
                carBox.y = y;
                cdrBox.x = carBox.x + BOX_SIZE;
                cdrBox.y = y;
                
                if(carBox.content instanceof Pointer) {
                    if(carBox.content.pointTo instanceof DrawablePair) {
                        calc(carBox.content.pointTo, x - BOX_SIZE / 2, y + gapY, level + 1);
                        var ptr = carBox.content;
                        ptr.startVector = new Vector2(carBox.x + BOX_SIZE / 2, carBox.y + BOX_SIZE / 2);
                        ptr.endVector = new Vector2(carBox.x + BOX_SIZE / 2, y + gapY);
                    } else {
                        calc(carBox.content.pointTo, x, y + gapY, level + 1);
                        var ptr = carBox.content;
                        ptr.startVector = new Vector2(carBox.x + BOX_SIZE / 2, carBox.y + BOX_SIZE / 2);
                        ptr.endVector = new Vector2(carBox.x + BOX_SIZE / 2, y + gapY);
                    }
                }
                if(cdrBox.content instanceof Pointer) {
                    calc(cdrBox.content.pointTo, x + gapX, y, level + 1);
                    var ptr = cdrBox.content;
                    ptr.startVector = new Vector2(cdrBox.x + BOX_SIZE / 2, cdrBox.y + BOX_SIZE / 2);
                    ptr.endVector = new Vector2(x + gapX, cdrBox.y + BOX_SIZE / 2);
                }
            } else {
                drawable.x = x;
                drawable.y = y;
            }
        }
    }
    
    return {
        from: toBoxAndPointer,
        calc: calc,
        Box: Box,
        Pointer: Pointer,
        DrawablePair: DrawablePair
    };

    function drawArrow(ctx, x1, y1, x2, y2, style, which, angle, d, color, width) {
        if (typeof(x1) == 'string') {
          x1 = parseInt(x1);
        }
        if (typeof(y1) == 'string') {
          y1 = parseInt(y1);
        }
        if (typeof(x2) == 'string') {
          x2 = parseInt(x2);
        }
        if (typeof(y2) == 'string') {
          y2 = parseInt(y2);
        }
        style = typeof(style) != 'undefined' ? style : 3;
        which = typeof(which) != 'undefined' ? which : 1;
        angle = typeof(angle) != 'undefined' ? angle : Math.PI / 9;
        d = typeof(d) != 'undefined' ? d : 10;
        color = typeof(color) != 'undefined' ? color : '#000';
        width = typeof(width) != 'undefined' ? width : 1;
        var toDrawHead = typeof(style) != 'function' ? drawHead : style;
        var dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        var ratio = (dist - d / 3) / dist;
        var tox, toy, fromx, fromy;
        if (which & 1) {
          tox = Math.round(x1 + (x2 - x1) * ratio);
          toy = Math.round(y1 + (y2 - y1) * ratio);
        } else {
          tox = x2;
          toy = y2;
        }
        
        if (which & 2) {
          fromx = x1 + (x2 - x1) * (1 - ratio);
          fromy = y1 + (y2 - y1) * (1 - ratio);
        } else {
          fromx = x1;
          fromy = y1;
        }
        
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.stroke();
        
        var lineangle = Math.atan2(y2 - y1, x2 - x1);
        var h = Math.abs(d / Math.cos(angle));
        if (which & 1) {
          var angle1 = lineangle + Math.PI + angle;
          var topx = x2 + Math.cos(angle1) * h;
          var topy = y2 + Math.sin(angle1) * h;
          var angle2 = lineangle + Math.PI - angle;
          var botx = x2 + Math.cos(angle2) * h;
          var boty = y2 + Math.sin(angle2) * h;
          toDrawHead(ctx, topx, topy, x2, y2, botx, boty, style, color, width);
        }
        
        if (which & 2) {
          var angle1 = lineangle + angle;
          var topx = x1 + Math.cos(angle1) * h;
          var topy = y1 + Math.sin(angle1) * h;
          var angle2 = lineangle - angle;
          var botx = x1 + Math.cos(angle2) * h;
          var boty = y1 + Math.sin(angle2) * h;
          toDrawHead(ctx, topx, topy, x1, y1, botx, boty, style, color, width);
        }
    }

    function drawHead (ctx, x0, y0, x1, y1, x2, y2, style, color, width) {
        if (typeof(x0) == 'string') {
          x0 = parseInt(x0);
        }
        if (typeof(y0) == 'string') {
          y0 = parseInt(y0);
        }
        if (typeof(x1) == 'string') {
          x1 = parseInt(x1);
        }
        if (typeof(y1) == 'string') {
          y1 = parseInt(y1);
        }
        if (typeof(x2) == 'string') {
          x2 = parseInt(x2);
        }
        if (typeof(y2) == 'string') {
          y2 = parseInt(y2);
        }
        
        var radius = 3,
            twoPI = 2 * Math.PI;
        
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = width;
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        
        switch (style) {
          case 0:
            var backdist = Math.sqrt(((x2 - x0) * (x2 - x0)) + ((y2 - y0) * (y2 - y0)));
            ctx.arcTo(x1, y1, x0, y0, .55 * backdist);
            ctx.fill();
            break;
          case 1:
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x0, y0);
            ctx.fill();
            break;
          case 2:
            ctx.stroke();
            break;
          case 3:
            var cpx = (x0 + x1 + x2) / 3;
            var cpy = (y0 + y1 + y2) / 3;
            ctx.quadraticCurveTo(cpx, cpy, x0, y0);
            ctx.fill();
            break;
          case 4:
            var cp1x, cp1y, cp2x, cp2y, backdist;
            var shiftamt = 5;
            if (x2 == x0) {
              backdist = y2 - y0;
              cp1x = (x1 + x0) / 2;
              cp2x = (x1 + x0) / 2;
              cp1y = y1 + backdist / shiftamt;
              cp2y = y1 - backdist / shiftamt;
            } else {
              backdist = Math.sqrt(((x2 - x0) * (x2 - x0)) + ((y2 - y0) * (y2 - y0)));
              var xback = (x0 + x2) / 2;
              var yback = (y0 + y2) / 2;
              var xmid = (xback + x1) / 2;
              var ymid = (yback + y1) / 2;
              var m = (y2 - y0) / (x2 - x0);
              var dx = (backdist / (2 * Math.sqrt(m * m + 1))) / shiftamt;
              var dy = m * dx;
              cp1x = xmid - dx;
              cp1y = ymid - dy;
              cp2x = xmid + dx;
              cp2y = ymid + dy;
            }
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x0, y0);
            ctx.fill();
            break;
        }
        ctx.restore();
    }
})( );

