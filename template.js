/*
 * Apache License Version 2.0
 * template.js
 * version 1.2
 * 
 * by MK
 * email: mk31415926535@gmail.com
 * blog: mkjs.net
 *
 * */
(function (w) {
	/*
	 * 用于获取内部标记的正则表达式
	 * */
	var temp_regex = /\{([^\}\s]+)\}/g;
	var POSITION = '@POS';
	var ID = '@ID';

	function isFunction(v){ return typeof(v) == 'functinon'; }
	function isString(v){ return typeof(v) == 'string'; }
	function isType(v, s){ return Object.prototype.toString.call(v) == '[object ' + s + ']'; }
	function isObject(v){ return isType(v, 'Object'); }
	function isArray(v){ return isType(v, 'Array'); }

	/*
	 * 遍历所有文字节点和属性节点
	 * */
	function node_traversal(node, callback){
		if(node.nodeType == 3){
			callback(node);
		} else if(node.nodeType == 1){
			var attrs = node.attributes, i = 0, len = attrs.length;
			for(; i < len; i++){
				if(isString(attrs[i].nodeValue)){
					callback(attrs[i], node);
				}
			}
			var n = node.firstChild;
			while(n){
				node_traversal(n, callback);
				n = n.nextSibling;
			}
			n = null;
		}
	}

	/*
	 * 获取委托函数
	 * @ns 委托函数的 namespace
	 * @context 用于查找委托函数的上下文。当该项未定义时，context 为 window
	 * */
	function get_invoker(ns, context){
		var _w = context || w, _ns = ns.split('.'), _ = _ns.shift();
		while(_w && _ in _w){
			_w = _w[_];
			_ = _ns.shift();
		}
		return _w || null;
	}

	/*
	 * 替换所有文本节点和属性节点为数据标签值
	 * */
	function template_replace(node, data, invoker_context) {
		node_traversal(node, function (n, N) {
			if(n.nodeName == 'template-invoker'){
				try{
					var fn = get_invoker(n.nodeValue, invoker_context);
					if(isFunction(fn)){
						fn(data, N);
					}
				} catch (ex){}
			} else {
				var result =  n.nodeValue.replace(temp_regex, function (m, $1, $2) {
					return $1 in data ? data[$1] : '';
				});
				if(n.nodeType == 3){
					n.nodeValue = result;
				} else if(n.nodeType == 2){
					N.setAttribute(n.nodeName, result);
				}
			}
		});
	}

	/*
	 * 模板对象
	 * */
	function template(node) {
		//获取模板节点
		this.node = isString(node) ? document.getElementById(node) : node;
		//若模板不存在，则返回
		if (!this.node) {
			return;
		}
		//获取模板的下一个节点作为参考
		this.coordNode = this.node.nextSibling;
		//获取模板的父节点
		this.container = this.node.parentNode;
		//将模板从父节点中移除
		this.node.parentNode.removeChild(this.node);
		//确认定义模板显示
		this.node.style.display = '';

		//暂存节点数组
		this.fragments = [];
	}

	template.prototype = {
		/*
		 * 移除所有动态生成的模板
		 * */
		reset : function(){
			var n;
			while(this.fragments.length > 0){
				n = this.fragments.pop();
				n.parentNode.removeChild(n);
			}
			n = null;
		},

		/*
		 * 模板验证
		 * */
		valid : function(){
			return this.node && this.container && this.node.nodeType == 1 && this.container.nodeType == 1;
		},

		/*
		 * 转换数据
		 * @data 数据,数组或js对象
		 * @invoker_context 委托函数
		 * */
		fragment : function(data, invoker_context){
			//是否通过验证，及数据是否有效。
			if (!data || !this.valid()) {
				return null;
			}
			
			//创建碎片
			var frag = document.createDocumentFragment();
			//获取数据类型
			//当数据为Object时，使用当前数据直接替换模板。
			if (isObject(data)) {
				//深度复制一个模板节点
				var node = this.node.cloneNode(true);
				//当数据中不存在动态参数时，重置复制节点的ID和位置信息。
				if(!(POSITION in data)){
					data[POSITION] = this.container.childNodes.length + 1;
				}
				node.id = data[ID] = (this.node.id || '') + '$' + data[POSITION];
				//替换节点属性与文本节点
				template_replace(node, data, invoker_context);

				//将节点存储到当前对象的fragments对象中
				//供重置移除时使用
				this.fragments.push(node);
				//将复制节点加入到碎片中
				frag.appendChild(node);
				//清除数据中的位置信息
				delete data[POSITION];
			}
			//当数据为数组时
			else if (isArray(data)) {
				//遍历数组
				var i = 0, len = data.length, count = this.container.childNodes.length;
				//临时节点变量
				var tmp;
				for (; i < len; i++) {
					//将动态参数放置到数据中，供模板使用。
					if(!data[i]){
						data[i] = {};
					}
					data[i][POSITION] = i + 1 + count;
					tmp = this.fragment(data[i], invoker_context);
					if (tmp) {
						frag.appendChild(tmp);
					}
				}
			}
			//其他类型抛弃
			else {
				return null;
			}
			return frag;
		},
		/*
		 * 替换模板为数据
		 */
		replace: function (data, invoker_context) {
			if(!this.valid()) return;
			var frag = this.fragment(data, invoker_context);
			if(!frag) return
			//如果有参考节点 则插入到参考节点之前
			//否则追加到父节点尾部
			if(this.coordNode){
				this.container.insertBefore(frag, this.coordNode);
			} else {
				this.container.appendChild(frag);
			}
			frag = null;
		}
	}
	//对AMD模块加载器的支持
	if (typeof (w.define) == 'function') {
		w.define(template);
	}
	//没有AMD加载器调用，直接定义到window域名
	else {
		w.template = template;
	}

})(window);
