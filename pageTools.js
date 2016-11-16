/**
 * 自定义分页按钮工具，适用于富Ajax交互。
 * @param {Object} global
 */
(function(global){
	"use strict";
	
	//检测是否存在EventEmitter对象
	if(typeof global.EventEmitter !== "function"){
		throw new Error("该组件依赖于EventEmitter工具，请加载EventEmitter.js");
	}
	
	/**
	 * 分页器基类
	 * @param {Object} superElement
	 */
	function PageTools(superElement){
		
		//判断构造器函数是否传入了元素对象，如果没有传入，默认为document对象。
		if(typeof superElement !== "object"){
			superElement = document;
		}
		
		//创建一个事件包装器对象，用于操作功能。
		var pagetools = new EventEmitter(),
			btnElement = "li",
			counter = 0,
			myEvent = {
				type : "start",
				old : 1
			}
		
		//绑定事件，当点击按钮的时候触发自定义事件。
		function handlerEvent(event){
			//获取事件和目标
			var evt = getEvent(event),
				target = getTarget(event);
				myEvent.target = target;
			//判断目标元素是否包含pageBtn 类名，如果包含就为其触发自定义事件。
			//start	表示首页按钮点击事件
			//end	表示尾页按钮点击事件
			//next	表示下一页按钮点击事件
			//prev	表示上一页按钮点击事件
			//other	表示其他数字按钮点击事件
			if(target.className.indexOf("pageBtn") > -1){
				switch(target.className){
					case "pageBtn startBtn":
						myEvent.type = "start";
						myEvent.value = getText(target);
						pagetools.send(myEvent);
						break;
					case "pageBtn endBtn":
						myEvent.type = "end";
						myEvent.value = getText(target);
						pagetools.send(myEvent);
						break;
					case "pageBtn prevBtn":
						myEvent.type = "prev";
						myEvent.value = getText(target);
						pagetools.send(myEvent);
						break;
					case "pageBtn nextBtn":
						myEvent.type = "next";
						myEvent.value = getText(target);
						pagetools.send(myEvent);
						break;
					case "pageBtn":
						myEvent.type = "other";
						myEvent.value = getText(target);
						pagetools.send(myEvent);
						break;
				}
				//设置上一次点击的值。
				myEvent.old = setOldValue(myEvent.value, parseInt(myEvent.old), parseInt(counter));
			}
		}
		
		/**
		 * 设置标签内容元素。
		 * @param {String} tagName	标签名
		 */
		pagetools.setBtnElement = function(tagName){
			if(typeof tagName === "string"){
				btnElement = tagName;
			}
		}
		
		
		/**
		 * 重新渲染按钮
		 * @param {Number} startIndex	头部按钮数字
		 * @param {Number} sum			总按钮数字
		 * @param {Number} size			按钮显示长度
		 */
		pagetools.renderBtn = function(startIndex, sum, size){
			var renderElem = "";
			startIndex = parseInt(startIndex);
			sum = parseInt(sum);
			size = parseInt(size);
			counter = sum;
			
			console.log(startIndex);
			console.log(sum);
			console.log(size);
			
			if(typeof size === "undefined"){
				size = 7;
			}else{
				size = size - 2;
			}
			
			if(sum <= 1){
				renderElem = ["<", btnElement, "class='pageBtn'>","1", "</", btnElement, ">"];
			}else{
				
				if(startIndex == 1){
					renderElem += renderContent(startIndex, startIndex + size, sum + 1);
					renderElem += renderBottom();
				}else if(startIndex + size >= sum){
					renderElem += renderTop();
					renderElem += renderContent(startIndex, startIndex + size, sum + 1);
				}else{
					size = size - 2;
					renderElem += renderTop();
					renderElem += renderContent(startIndex, startIndex + size, sum + 1);
					renderElem += renderBottom();
				}
			}
			superElement.innerHTML = renderElem;
		}
		
		//渲染中部按钮
		function renderContent(i, len, sum){
			if(len > sum){
				len = sum;
			}
			var ele = [];
			for(i; i < len; i++){
				
				
				ele.push("<" + btnElement + " class='pageBtn'>" + i + "</" + btnElement + ">");
			}
			return ele.join("");
		}
		
		/**
		 * 设置上一次点击的值，如果是其他按钮需要进行转换。
		 * @param {String} val	值
		 */
		function setOldValue(val, old, sum){
			switch(val){
				case ">>":
					return sum;
				case ">":
					return old > sum ? sum : old + 1 ;
				case "<<":
					return 1;
				case "<":
					return old > 1 ? old - 1 : old ;
				default:
					return parseInt(val);
			}
		}
		
		//渲染头部
		function renderTop(){
			return ["<" + btnElement + " class='pageBtn startBtn'><<</" + btnElement + ">",
				"<" + btnElement + " class='pageBtn prevBtn'><</" + btnElement + ">"].join("");
		}
		
		//渲染头部
		function renderBottom(){
			return ["<" + btnElement + " class='pageBtn nextBtn'>></" + btnElement + ">",
				"<" + btnElement + " class='pageBtn endBtn'>>></" + btnElement + ">"].join("");
		}
		
		//公共接口,开始执行绑定点击事件。
		pagetools.enable = function(){
			addEventHandler(superElement, "mouseup", handlerEvent);
		};
		//公共接口,移除绑定点击事件。
		pagetools.disable = function(){
			removeEventHandler(superElement, "mouseup", handlerEvent);
		}
		
		//默认执行绑定事件。
		pagetools.enable();
		
		return pagetools;
	}
	
	/**
	 * 获取文本值。
	 * @param {Object} ele	元素对象
	 */
	function getText(ele){
		if(ele.firstChild.nodeType === 3 || 
			ele.firstChild.nodeName.toLocaleLowerCase() === "li"){
			return ele.firstChild.nodeValue;
		}
	}
	
	/*****************************************************
	 * @跨浏览器兼容的添加事件处理程序。
	 * @param {Object} ele		元素
	 * @param {Object} type		事件类型
	 * @param {Object} handler	处理函数
	 */
	function addEventHandler(ele, type, handler){
		//是否支持DOM2级的事件处理程序
		if(ele.addEventListener){
			ele.addEventListener(type, handler, false);
		}else if(ele.attachEvent){
			//IE8及以下的事件处理程序
			ele.attachEvent("on" + type, handler);
		}else{
			ele["on" + type] = handler;
		}
	}
	
	/*****************************************************
	 * @跨浏览器兼容的移除事件处理程序
	 * @param {Object} ele		元素
	 * @param {Object} type		事件类型
	 * @param {Object} handler	处理程序
	 */
	function removeEventHandler(ele, type, handler){
		//是否支持DOM2级的事件处理程序
		if(ele.removeEventListener){
			ele.removeEventListener(type, handler);
		}else if(ele.detachEvent){
			//IE8及以下的事件处理程序
			ele.detachEvent("on" + type, handler);
		}else{
			ele["on" + type] = null;
		}
	}
	
	/*****************************************************
	 * 跨浏览器检测一个属性是否是方法
	 * @param {Object} obj			检测对象
	 * @param {String} property		检测方法
	 */
	function isMethod(obj, property){
		var t = typeof obj[property];
		return t === "function" || 
				(!!(t === "object" && obj[property])) ||
				t === "unknown";
	}
	
	/*****************************************************
	 * @跨浏览器兼容获取事件对象
	 * @param {Object} event	事件对象
	 */
	function getEvent(event){
		return event ? event : window.event;
	}
	
	/*****************************************************
	 * @跨浏览器兼容获取事件目标 
	 * @param {Object} event	事件对象
	 */
	function getTarget(event){
		var e = getEvent(event);
		return e.target  || e.srcElement;
	}
	
	global.PageTools = PageTools;
	//冻结所有方法，让他人无法更改。
	//先检测浏览器是否拥有ES 5的freeze能力
	if(isMethod(Object, 'freeze')){
		Object.freeze(PageTools);
		Object.freeze(PageTools.prototype);
		Object.freeze(global.PageTools);
	}
	
})(window);
