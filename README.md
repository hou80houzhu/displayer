# displayer #

displayer.js是一个小型的html5 canvas图形处理的封装。它本是rocui插件系统的一部分（rocui还未发布，它是一个完整的web ui处理框架，但是它将在不久之后完整发布）但是它现在仍可以作为jquery插件而是用。

它参照flash显示对象（sprite）而设计，支持局部坐标系统，以及坐标系统间的转换，这样便可以进行精确的图形处理。同时支持局部图形数据的获取（同域条件下），以及本地保存。它支持事件系统，可以为任何displayer对象添加事件，而且保证事件触发的范围精确。

## 如何使用 ##

1. 创建画布
   
	displayer.js的画布是与dom进行绑定的，然后displayer.js会将canvas渲染到指定的dom内部。
    
	`var scene = jquery("").scene(option);`

2. 创建显示对象

	````$.sprite(option);
	````
3. 绘制显示对象

	````scene.appendChild(a).appendChild(b);
	````

## 显示对象option ##

	
	{
		name:"",
		x:0,
		y:0,
		width:100,
		height:100,
		alpha:10,
		background = {
            color: "none",//16进字颜色值
            image: null,//图片url
            imageType: "fit"//[repeat center fit fill]填充方式
        },
		border = {
            width: 0,
            color: "none"//16进字颜色值
        },
		shadow = {
            color: "none",//16进字颜色值
            offsetX: 0,//水平偏移
            offsetY: 0,//垂直偏移
            blur: 20//阴影范围
        },
		mousedown:function(e){},
		mousemove:function(e){},
		mouseup:function(e){},
		click:function(e){},
	}
	
	
## 显示对象方法 ##

### clean() ###
清除显示对象内容。

### draw() ###
重绘显示对象

### background(a) ###
设置或获取显示对象背景设置

### backgroundColor(a) ###
设置或获取显示对象背景颜色

### backgroundImage(a) ###
设置或获取显示对象背景图片

### backgroundImageType(a) ###
设置或获取显示对象背景填充方式

### border(a) ###
设置或获取显示对象边框

### borderWidth(a) ###
设置或获取显示对象边框宽度

### borderColor(a) ###
设置或获取显示对象边框颜色

### shadow(a) ###
设置或获取显示对象阴影

### shadowColor(a) ###
设置或获取显示对象阴影颜色

### shadowOffsetX(a) ###
设置或获取显示对象阴影水平偏移量

### shadowOffsetY(a) ###
设置或获取显示对象阴影垂直偏移量

### shadowBlur(a) ###
设置或获取显示对象阴影范围

### name(a) ###
设置或获取显示对象id

### x(a) ###
设置或获取显示对象x坐标

### y(a) ###
设置或获取显示对象y坐标。

### width(a) ###
设置或获取显示对象宽

### height(a) ###
设置或获取显示对象高

### alpha(a) ###
设置或获取显示对象透明度

### root() ###
scene对象

### parent() ###
父显示对象

### children() ###
所有子显示对象

### topDepth() ###
显示对象深度

### appendChild(a) ###
添加子显示对象

### rotate(a) ###
旋转（0-360）

### rotatePoint(x,y) ###
设置显示对象旋转点

### getImageDate(x,y,width,height) ###
获取显示指定范围的数据uri

### getImageBlob(x,y,width,height) ###
获取显示指定范围的数据二进制

### checkPointIn(x,y) ###
判断点是否在显示对象范围内


## 事件对象属性和方法 ##

### x ###
本地坐标系x坐标

### y ###
本地坐标系y坐标

### sceneX ###
全局坐标系x坐标

### sceneY ###
全局坐标系y坐标

### target ###
事件的目标对象

### currentTarget ###
事件执行的当前对象

### eventType ###
事件类型

### stopPropagation() ###
停止事件传播

### getSpriteLocal(sprite) ###
将坐标转为sprite坐标系本地坐标
