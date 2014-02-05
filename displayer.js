(function($) {
    $.sprite = function(option) {
        return new sprite(option ? option : {});
    };
    $.fn.scene = function(option) {
        option.dom = this;
        return new scene(option);
    };
    var math = {
        pi: Math.PI,
        angle: function(num) {
            return Math.PI * (num / 180);
        },
        rotatePoint: function(rotatepoint, rotate, x, y) {
            var _pp = math.angle(rotate);
            if (rotatepoint.y !== 0) {
                var R = Math.sqrt((rotatepoint.x - x) * (rotatepoint.x - x) + (rotatepoint.y - y) * (rotatepoint.y - y));
                var offset = math.pi - Math.atan((rotatepoint.y - y) / (rotatepoint.x - x)) - _pp;
                return {
                    x: rotatepoint.x + R * Math.cos(offset),
                    y: rotatepoint.y - R * Math.sin(offset)
                };
            } else {
                return {
                    x: x,
                    y: 0
                };
            }
        },
        reletivePoint: function(sprite, x, y) {
            var _pp = math.angle(sprite._rotate);
            var cos = Math.cos(_pp), sin = Math.sin(_pp);
            var ox = (x - sprite._x), oy = (y - sprite._y);
            return{
                x: ox * cos + oy * sin,
                y: oy * cos - ox * sin
            };
        }
    };
    var event = function() {
        this.x = 0;
        this.y = 0;
        this.sceneX = 0;
        this.sceneY = 0;
        this.target = null;
        this.currentTarget = null;
        this.eventType = null;
        this._isstop = false;
    };
    event.prototype.stopPropagation = function() {
        this._isstop = true;
    };
    event.prototype.getSpriteLocal = function(sprite) {
        var a = [], b = sprite.parent();
        while (b) {
            a.push(b);
            b = b.parent();
        }
        var ths = this;
        var mx = {
            x: ths.sceneX,
            y: ths.sceneY
        };
        for (var i = a.length - 1; i >= 0; --i) {
            mx = math.reletivePoint(a[i], mx.x, mx.y);
        }
        return mx;
    };

    var sprite = function(option) {
        this._name = option.name ? option.name : "";
        this._x = option.x ? option.x : 0;
        this._y = option.y ? option.y : 0;
        this._width = option.width ? option.width : 500;
        this._height = option.height ? option.height : 500;
        this._alpha = option.alpha ? option.alpha : 1;
        this._depth = 0;

        this._background = {
            color: "none",
            image: null,
            imageType: "fit"//repeat center fit fill
        };
        this._border = {
            width: 0,
            color: "none"
        };
        this._shadow = {
            color: "none",
            offsetX: 0,
            offsetY: 0,
            blur: 20
        };
        if (option.background) {
            this._background.color = option.background.color ? option.background.color : "none";
            this._background.image = option.background.image ? option.background.image : null;
            this._background.imageType = option.background.imageType ? option.background.imageType : "fit";
        }
        ;
        if (option.border) {
            this._border.width = option.border.width ? option.border.width : 0;
            this._border.color = option.border.color ? option.border.color : "none";
        }
        if (option.shadow) {
            this._shadow.color = option.shadow.color ? option.shadow.color : "none";
            this._shadow.offsetX = option.shadow.offsetX ? option.shadow.offsetX : 0;
            this._shadow.offsetY = option.shadow.offsetY ? option.shadow.offsetY : 0;
            this._shadow.blur = option.shadow.blur ? option.shadow.blur : 20;
        }
        this._rotate = 0;
        this._rotatepoint = {
            x: 0,
            y: 0,
            offsetx: 0,
            offsety: 0
        };
        this._root = null;
        this._children = [];
        this._parent = null;

        this.mousedown = option.mousedown ? option.mousedown : null;
        this.mousemove = option.mousemove ? option.mousemove : null;
        this.mouseup = option.mouseup ? option.mouseup : null;
        this.click = option.click ? option.click : null;

        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        //cache
        var ths = this;
        this._local = null;
        this.ops = {};
        this._framework = {
            rotatex: ths._x,
            rotatey: ths._y
        };
        if (typeof this._background.image === "string") {
            var _a = this._background.image;
            this._background.image = null;
            var _a = document.createElement("img");
            _a.src = url;
            _a.addEventListener("load", function(e) {
                ths._background.image = e.target;
                ths._root.draw();
            }, false);
        }
    };
    sprite.drawImage = function(sprite) {
        var image = sprite._background.image;
        var type = sprite._background.imageType ? sprite._background.imageType : "fit";
        if (image) {
            if (type === "fit") {
                var _w = 0, _h, _x = 0, _y = 0;
                if (image.width > sprite._width) {
                    _w = sprite._width;
                    _h = (image.height / image.width) * _w;
                    if (_h > sprite._height) {
                        _h = sprite._height;
                        _w = (image.width / image.height) * _h;
                    }
                } else {
                    _h = sprite._height;
                    _w = (image.width / image.height) * _h;
                    if (_w > sprite._width) {
                        _w = sprite._width;
                        _h = (image.height / image.width) * _w;
                    }
                }
                _x = (sprite._width - _w) / 2;
                _y = (sprite._height - _h) / 2;
                sprite.ctx.drawImage(image, _x, _y, _w, _h);
            } else if (type === "repeat") {
                var _w = sprite._width, _h = sprite._height, _x = 0, _y = 0;
                while (true) {
                    sprite.ctx.drawImage(image, _x, _y, image.width, image.height);
                    _x += image.width;
                    if (_x > _w) {
                        _y += image.height;
                        if (_y < _h) {
                            _x = 0;
                        } else {
                            break;
                        }
                    }
                }
            } else if (type === "fill") {
                sprite.ctx.drawImage(image, 0, 0, sprite._width, sprite._height);
            } else if (type === "center") {
                var _w = image.width, _h = image.height, _x = 0, _y = 0;
                _x = (sprite._width - _w) / 2;
                _y = (sprite._height - _h) / 2;
                sprite.ctx.drawImage(image, _x, _y, _w, _h);
            }
        }
        return this;
    };
    sprite.prototype.clean = function() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        return this;
    };
    sprite.prototype.draw = function() {
        this.clean();
        this.canvas.width = this._width;
        this.canvas.height = this._height;

        this.ctx.globalAlpha = this._alpha;
        if (this._background.color !== "none") {
            this.ctx.save();
            this.ctx.fillStyle = this._background.color;
            this.ctx.fillRect(0, 0, this._width, this._height);

            this.ctx.restore();
        }
        sprite.drawImage(this);

        for (var i = 0; i < this._children.length; i++) {
            var _c = this._children[i];
            _c.draw();
            this.ctx.save();

            this.ctx.translate(_c._x, _c._y);
            this.ctx.rotate(_c._rotate / 180 * Math.PI);

            if (_c._shadow.color !== "none") {
                this.ctx.save();
                this.ctx.fillStyle = 'rgba(0,0,0,0)';
                this.ctx.fillRect(0, 0, _c._width, _c._height);
                this.ctx.shadowColor = _c._shadow.color;
                this.ctx.shadowBlur = _c._shadow.blur;
                this.ctx.shadowOffsetX = _c._shadow.offsetX;
                this.ctx.shadowOffsetY = _c._shadow.offsetY;
                this.ctx.drawImage(_c.ctx.canvas, 0, 0, _c._width, _c._height);
                this.ctx.restore();
            } else {
                this.ctx.drawImage(_c.ctx.canvas, 0, 0, _c._width, _c._height);
            }

            if (_c._border.color !== "none") {
                this.ctx.lineWidth = _c._border.width;
                this.ctx.strokeStyle = _c._border.color;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(0, _c._height);
                this.ctx.lineTo(_c._width, _c._height);
                this.ctx.lineTo(_c._width, 0);
                this.ctx.closePath();
                this.ctx.stroke();
            }

            this.ctx.restore();
        }
        return this;
    };
    sprite.prototype.background = function(a) {
        if (arguments.length === 1) {
            this._background = a;
            return this;
        } else {
            return this._background;
        }
    };
    sprite.prototype.backgroundColor = function(a) {
        if (arguments.length === 1) {
            this._background.color = a;
            return this;
        } else {
            return this._background.color;
        }
    };
    sprite.prototype.backgroundImage = function(a) {
        if (arguments.length === 1) {
            this._background.image = a;
            return this;
        } else {
            return this._background.image;
        }
    };
    sprite.prototype.backgroundImageType = function(a) {
        if (arguments.length === 1) {
            this._background.imageType = a;
            return this;
        } else {
            return this._background.imageType;
        }
    };
    sprite.prototype.border = function(a) {
        if (arguments.length === 1) {
            this._border = a;
            return this;
        } else {
            return this._border;
        }
    };
    sprite.prototype.borderWidth = function(a) {
        if (arguments.length === 1) {
            this._border.width = a;
            return this;
        } else {
            return this._border.width;
        }
    };
    sprite.prototype.borderColor = function(a) {
        if (arguments.length === 1) {
            this._border.color = a;
            return this;
        } else {
            return this._border.color;
        }
    };
    sprite.prototype.shadow = function(a) {
        if (arguments.length === 1) {
            this._shadow = a;
            return this;
        } else {
            return this._shadow;
        }
    };
    sprite.prototype.shadowColor = function(a) {
        if (arguments.length === 1) {
            this._shadow.color = a;
            return this;
        } else {
            return this._shadow.color;
        }
    };
    sprite.prototype.shadowOffsetX = function(a) {
        if (arguments.length === 1) {
            this._shadow.offsetX = a;
            return this;
        } else {
            return this._shadow.offsetX;
        }
    };
    sprite.prototype.shadowOffsetY = function(a) {
        if (arguments.length === 1) {
            this._shadow.offsetY = a;
            return this;
        } else {
            return this._shadow.offsetY;
        }
    };
    sprite.prototype.shadowBlur = function(a) {
        if (arguments.length === 1) {
            this._shadow.blur = a;
            return this;
        } else {
            return this._shadow.blur;
        }
    };
    sprite.prototype.name = function(a) {
        if (arguments.length === 1) {
            this._name = a;
            return this;
        } else {
            return this._name;
        }
    };
    sprite.prototype.x = function(a) {
        if (arguments.length === 1) {
            this._framework.rotatex = this._x;
            this._x = a;
            return this;
        } else {
            return this._x;
        }
    };
    sprite.prototype.y = function(a) {
        if (arguments.length === 1) {
            this._framework.rotatey = this._y;
            this._y = a;
            return this;
        } else {
            return this._y;
        }
    };
    sprite.prototype.width = function(a) {
        if (arguments.length === 1) {
            var nw = (this._rotatepoint.offsetx / this._width) * a;
            this._x -= nw - this._rotatepoint.offsetx;
            this._framework.rotatex = this._x;
            this._rotatepoint.offsetx = this._rotatepoint.x - this._x;
            this._width = a;
            this.canvas.width = this._width;
            return this;
        } else {
            return this._width;
        }
    };
    sprite.prototype.height = function(a) {
        if (arguments.length === 1) {
            var nh = (this._rotatepoint.offsety / this._height) * a;
            this._y -= nh - this._rotatepoint.offsety;
            this._framework.rotatey = this._y;
            this._rotatepoint.offsety = this._rotatepoint.y - this._y;
            this._height = a;
            this.canvas.height = this._height;
            return this;
        } else {
            return this._height;
        }
    };
    sprite.prototype.alpha = function(a) {
        if (arguments.length === 1) {
            this._alpha = a;
            return this;
        } else {
            return this._alpha;
        }
    };
    sprite.prototype.root = function() {
        return this._root;
    };
    sprite.prototype.parent = function() {
        return this._parent;
    };
    sprite.prototype.children = function(a) {
        if (arguments.length === 1) {
            var _a = null;
            if (typeof a === "string") {
                for (var i = 0; i < this._children.length; i++) {
                    if (this._children[i]._name === a) {
                        _a = this._children[i];
                        break;
                    }
                }
            } else {
                if (a >= 0 && a < this._children.length) {
                    _a = this._children[a];
                }
            }
            return _a;
        } else {
            return this._children;
        }
    };
    sprite.prototype.topDepth = function() {
        var _a = this._parent._children;
        if (_a.length > 0 && this._depth <= _a.length) {
            var _ac = _a[_a.length - 1];
            this._parent._children[_a.length - 1] = this;
            this._parent._children[this._depth - 1] = _ac;
            this._depth = this._parent._children.length;
        }
        return this;
    };
    sprite.prototype.appendChild = function(sprite) {
        sprite._root = scene.rootsprite;
        sprite._parent = this;
        this._children.push(sprite);
        sprite._depth = this._children.length;
        return this;
    };
    sprite.prototype.rotate = function(rotate) {
        if (arguments.length === 1) {
            this._rotate = rotate;
            var _a = math.rotatePoint(this._rotatepoint, this._rotate, this._framework.rotatex, this._framework.rotatey);
            this._x = _a.x;
            this._y = _a.y;
            return this;
        } else {
            return this._rotate;
        }
    };
    sprite.prototype.rotatePoint = function(x, y) {
        if (arguments.length === 2) {
            this._rotatepoint.x = x;
            this._rotatepoint.y = y;
            this._rotatepoint.offsetx = x - this._x;
            this._rotatepoint.offsety = y - this._y;
            return this;
        } else {
            return this._rotatepoint;
        }
    };
    sprite.prototype._cast = function(type, e) {
        this._local = e;
        var _a = this._children;
        var ishas = false;
        for (var i = _a.length - 1; i >= 0; --i) {
            if (scene.checkPointIn(_a[i], e.x, e.y)) {
                var _cc = math.reletivePoint(_a[i], e.x, e.y);
                _a[i]._cast.call(_a[i], type, _cc);
                ishas = true;
                break;
            }
        }
        if (!ishas) {
            var ev = new event();
            ev.target = this;
            ev.sceneX = scene.point.x;
            ev.sceneY = scene.point.y;
            var _mc = this;
            while (_mc) {
                if (_mc[type]) {
                    ev.x = _mc._parent ? _mc._parent._local.x : _mc._local.x;
                    ev.y = _mc._parent ? _mc._parent._local.y : _mc._local.y;
                    ev.currentTarget = _mc;
                    _mc[type].call(_mc, ev);
                }
                if (ev._isstop) {
                    _mc = null;
                } else {
                    _mc = _mc._parent;
                }
            }
        }
    };
    sprite.prototype.getImageDate = function(x, y, width, height) {
        var xis = x || 0, yis = y || 0, widthis = width || this._width, heightis = height || this._height;
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        canvas.width = widthis;
        canvas.height = heightis;
        ctx.drawImage(this.ctx.canvas, xis, yis, widthis, heightis, 0, 0, widthis, heightis);
        return canvas.toDataURL("image/png");
    };
    sprite.prototype.getImageBlob = function(x, y, width, height) {
        return dataURItoBlob(this.getImageDate(x, y, width, height));
    };
    sprite.prototype.checkPointIn = function(x, y) {
        return (x >= this._x && x <= this._x + this._width && y >= this._y && y <= this._y + this._height);
    };
    var dataURItoBlob = function(dataURL) {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) === -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = parts[1];
            return new Blob([raw], {type: contentType});
        }
        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var byteString = atob(parts[1]);
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], {type: contentType});
    };
    var scene = function(option) {
        var ops = {dom: $("body"),
            background: {
                color: "#3C3830"
            }
        };
        $.extend(ops, option);
        scene.offsetx = parseInt(ops.dom.offset().left);
        scene.offsety = parseInt(ops.dom.offset().top);
        var a = new sprite({
            name: "root",
            width: ops.dom.width(),
            height: ops.dom.height(),
            background: ops.background
        });
        a._root = a;
        a._parent = null;
        a._local = scene.point;
        var canv = $(a.canvas).appendTo(ops.dom).css({
            "-webkit-user-select": "none",
            "-webkit-touch-callout": "none",
            "-webkit-user-drag": "none",
            "-webkit-tap-highlight-color": "rgba(0,0,0,0)"
        }).get(0);

        a.mousedown = ops.mousedown ? ops.mousedown : null;
        a.mousemove = ops.mousemove ? ops.mousemove : null;
        a.mouseup = ops.mouseup ? ops.mouseup : null;
        a.click = ops.click ? ops.click : null;

        var ths = this;
        canv.addEventListener("click", function(e) {
            ths._cast("click", e);
        });
        canv.addEventListener("mousedown", function(e) {
            scene.offsetx = parseInt(ops.dom.offset().left);
            scene.offsety = parseInt(ops.dom.offset().top);
            ths._cast("mousedown", e);
        });
        canv.addEventListener("mousemove", function(e) {
            ths._cast("mousemove", e);
        });
        canv.addEventListener("mouseup", function(e) {
            ths._cast("mouseup", e);
        });
        a.draw();
        this.sprite = a;
        scene.rootsprite = a;
        return a;
    };
    scene.rootsprite = null;
    scene.offsetx = 0;
    scene.offsety = 0;
    scene.point = {x: 0,
        y: 0
    };
    scene.checkPointIn = function(sprite, x, y) {
        var _xc = math.reletivePoint(sprite, x, y);
        x = _xc.x;
        y = _xc.y;
        return (x > 0 && x < sprite._width && y > 0 && y < sprite._height);
    };
    scene.prototype._cast = function(type, e) {
        e.preventDefault();
        e.stopPropagation();
        var _a = this.sprite._children;
        scene.point.x = e.pageX - scene.offsetx;
        scene.point.y = e.pageY - scene.offsety;
        for (var i = _a.length - 1; i >= 0; --i) {
            if (scene.checkPointIn(_a[i], scene.point.x, scene.point.y)) {
                var _cc = math.reletivePoint(_a[i], scene.point.x, scene.point.y);
                _a[i]._cast.call(_a[i], type, _cc);
                break;
            }
        }
    };
})(jQuery);
