/**
 * @自定义事件包装器,观察者设计模式，
 * 	用于降低程序的耦合性，减少回调函数的依赖。
 */
(function(global){
	"use strict";
	
	function EventEmitter(){
		//事件处理对象。
		this.evnetHandlers = {};
		this.typeLength = 1;
		this.setFlag = true;
	}
	
	/**
	 * 公共函数，数组的判断方法。
	 * @param {Object} value
	 */
	function isArray(value){	
		return toString.call(value) === '[object Array]';
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
	
	/**
	 * 事件注册处理程序，为对象绑定处理函数。
	 * @param {String} 		type		事件类型
	 * @param {Function} 	handler		事件处理函数
	 */
	function bind(type, handler){
		var handlerTypes, 
			handlerLength = 0,
			flag = true;
		
		//如果没有当前这个事件处理类型，就为实例的evnetHandlers数组。
		//这个数组的属性名是注册程序的类型，而数组用来添加处理程序。
		if(typeof this.evnetHandlers[type] == 'undefined'){
			this.evnetHandlers[type] = [];
		}
		
		//用一个变量临时获取这个数组。
		handlerTypes = this.evnetHandlers[type];
		
		//做个判断，如果该类型的处理程序已经存在，那么就记录这个处理程序有多少。
		for(var i = 0, len = handlerTypes.length; i < len; i++ ){
			handlerLength++;
		}
		
		//如果当前类型的处理程序的个数，小于配置的个数，就将函数加入数组
		//如果当前类型的处理函数的个数，超出了配置函数的个数，提示使用者，但超出的函数不再加入数组。
		if(handlerLength < this.typeLength){
			//做个判断，如果该处理程序已经存在，那么将屏蔽该事件处理程序。
			for(var i = 0, len = handlerTypes.length; i < len; i++ ){
				if(handlerTypes[i] === handler){
					flag = false;
				}
			}
			//如果没有改处理程序，就将该事件处理程序加入。
			if(flag){
				this.evnetHandlers[type].push(handler);
			}
		}else{
			console.error("你添加的处理程序已经超出了范围，当前事件配置的个数为：" + this.typeLength);
		}
	}
	
	/**
	 * 触发事件
	 * @param {Object} 	evnet
	 * event.type 	String	处理程序类型
	 * event.target	Object	目标对象
	 */
	function send(evnet){
		//如果没有触发目标对象，就用EvnetEmitter的实例对象来执行。
		//之所以使用对象，而不是使用字符串，是为了方便传递数据便于交互。
		if(!evnet.target){
			evnet.target = this;
		}
		
		//查看这个处理程序是否存在。
		if(isArray(this.evnetHandlers[evnet.type])){
			var handlers = this.evnetHandlers[evnet.type];
			//执行这个类型的处理程序
			for(var i = 0, len = handlers.length; i < len; i++){
				handlers[i](evnet);
			}
		}
	}
	
	/**
	 * 移除一个已经注册的处理程序
	 * @param {String} 	type		处理程序类型	
	 * @param {Object} 	handler		处理程序函数
	 */
	function remove(type, handler){
		if(isArray(this.evnetHandlers[type])){
			var handlers = this.evnetHandlers[type];
			for(var i = 0, len = handler.length; i < len; i++){
				if(handler[i] === handler){
					break;
				}
			}
			handlers.splice(i, 1);
		}
	}
	
	/**
	 * 清除同一类型的所有处理程序
	 * @param {Object} type
	 */
	function removeAll(type){
		if(isArray(this.evnetHandlers[type])){
			delete this.evnetHandlers[type];
		}
	}
	
	/**
	 * 清空所有的事件处理程序
	 */
	function clear(){
		this.evnetHandlers = [];
	}
	
	/**
	 * 设置同一类型的处理程序的个数。
	 * @param {Number} 	size
	 */
	function setSize(size){
		//配置数量只能执行一次，用一个变量来标记它。
		if(this.setFlag === true){
			if(typeof size === "number"){
				this.typeLength = size;
				this.setFlag = false;
			}else{
				console.error("你传入的才参数不对!");
			}
		}
	}
	
	//将公共的方法定义在原型对象上，让每个实例都可以使用
	EventEmitter.prototype = {
		constructor : EventEmitter,
		isArray : isArray,
		setSize : setSize,
		bind : bind,
		on : bind,
		fire : send,
		send : send,
		remove : remove,
		removeAll : removeAll,
		clear : clear,
		isMethod : isMethod
	};
	
	global.EventEmitter = EventEmitter;
	
	//冻结所有方法，让他人无法更改。
	//先检测浏览器是否拥有ES 5的freeze能力
	if(isMethod(Object, 'freeze')){
		Object.freeze(EventEmitter);
		Object.freeze(EventEmitter.prototype);
		Object.freeze(global.EventEmitter);
	}
	
})(window || global);
