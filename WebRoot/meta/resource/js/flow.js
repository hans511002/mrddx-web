/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        flow.js
 *Description：
 *        流程组件接口js文件
 *Dependent：
 *        Flow.swf
 *Author:
 *        谭红涛
 *Finished：
 *       2011-11-08
 */

/**
 * 修正flash在部分浏览器下无法回收回调函数的官方bug
 * @param {HTMLObjectElement} instance flash实例对象
 * @param {String} name 要被回收的函数名
 */
window["__flash__removeCallback"] = function(instance, name) {
    try {
        if (instance) {
            instance[name] = null;
        }
    } catch (flashEx) {

    }
};

/**
 * 工具函数,获取flash实例对象
 * @param {String} movieName flash实例对象名称
 * @return {HTMLObjectElement} flash实例对象
 */
var getFlashMovieObject = function (movieName){
	if(window.document[movieName]){
		return window.document[movieName];
	}else if(navigator.appName.indexOf("Microsoft")==-1){
		if(document.embeds && document.embeds[movieName])
		return document.embeds[movieName];
	}else{
		return document.getElementById(movieName);
	}
};

/**
 * 流程组件js接口类
 * @class Flow 流程组件js接口类
 * @param {Object} config 初始化配置信息
 */
var Flow = function(config){
	
	var flowComp;//flash实例对象
	var id = 0;//公共id变量
	var handlers = new Object();//事件处理器
	var isReady = false;//是否已经加载完成
	var isArrowEvent = true;
	
	/**
	 * 工具函数,生成一个正整数id号
	 * @return {Number} 正整数id 
	 */
	function generateId(){ 
		id++;
		return id; 
	};
	
	(function(config,flow){
		var div = config['div'];
		//判断传入的是元素对象还是string，如果是string就当作id获取元素
		div = (typeof div == 'string') ? document.getElementById(div) : div;
		//虚拟一个组件id
		var compId = div.id+"_comp";
		//将对象本身添加到window对象中，供给flex调用
		window[compId] = flow;
		
		//拼装一个字符串，添加到目标div中显示
		var objHtml = "<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' type='application/x-shockwave-flash'"+
							"codebase='http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0' "+
							"width='100%' height='100%' id='"+compId+"' >"+
							"<param name='movie' value='"+config['swf']+"?object="+compId+"' />"+
							"<param name='quality' value='high' />"+
							"<param name='bgcolor' value='#ffffff' />"+
							"<param name='allowScriptAccess' value='always' />"+
							"<param name='allowFullScreen' value='true' />"+
							"<param name='wmode' value='opaque'>"+
							"<embed src='"+config['swf']+"?object="+compId+"' quality='high' wmode='opaque' "+
							"width='100%' height='100%' id='"+compId+"' name='"+compId+"' allowScriptAccess='always' "+
							"type='application/x-shockwave-flash' pluginspage='http://www.macromedia.com/go/getflashplayer' />"+
						"</object>";
		div.innerHTML = objHtml;
		
		//内存回收
		objHtml=null;
		delete objHtml;
		
		//获取flash实例对象
		flowComp = getFlashMovieObject(compId);
		var isIE = document.all?true:false;
		if(isIE){
			div.attachEvent("onmousedown",function(event){
				if(event.button==2&&isReady){
					//阻止事件冒泡,用于屏蔽flash右键菜单
					stopEvent(event);
					div.setCapture();
					//通知flex显示右键菜单
					flowComp.showcontextmenu();
					return false;
				}
			});
			div.attachEvent("onmouseup",function(){
				div.releaseCapture();
			});
			div.oncontextmenu=function(){
				return false;
			}
			div.attachEvent("onmousewheel",function(event){
				stopEvent(event);
				flowComp.scroll(event.wheelDelta/120);
			});
		}else{
			div.addEventListener("mousedown",function(event){
				if(event.button==2&&isReady){
					//阻止事件冒泡,用于屏蔽flash右键菜单
					stopEvent(event);
					
					//通知flex显示右键菜单
					flowComp.showcontextmenu();
				}
			});
			div.addEventListener("mousewheel",function(event){
				stopEvent(event);
				flowComp.scroll(event.wheelDelta/120);
			},false);
		}
		
		
		//添加onmousedown事件处理
		
		
	})(config,this);//虚拟构造函数，并执行
	
	/**
	 * 此函数用来阻止事件的冒泡
	 */
	function stopEvent(event){
		var isIE = document.all?true:false;
		if(isIE){
			event.cancelBubble = true;
			event.returnValue = false;
		}else{
			if(event.preventDefault){
				event.preventDefault();
			}
			if(event.stopPropagation){
				event.stopPropagation();
			}
		}
	}
	
	/**
	 * 当flash完成加载并完成初始化时被Flex调用的回调函数
	 * @memberOf {Flow} 
	 */
	this.onReady=function(){
		flowComp.blur();
		if(config['onReady']){
			config['onReady'](this);
		}
		isReady = true;
	};
	
	/**
	 * 当用户在画布上点击右键时被Flex调用的回调函数
	 * @memberOf {Flow} 
	 * @return {Boolean} 如果返回值为flase,则不展示右键
	 */
	this.onCanvasContextMenu = function(){
		flowComp.blur();
		handlers.menu=new Object();
		if(isArrowEvent&&config['onCanvasContextMenu']){
			var rtn = [];
			var temp = config['onCanvasContextMenu']();
			for(var i=0;i<temp.length;i++){
				var obj = temp[i];
				!obj.mid&&(obj.mid=generateId());
				if(obj.handler){
					handlers.menu[obj.mid]=obj.handler;
				}
				rtn.push(obj);
			}
			return rtn;
		}else {
			return false;
		}
	};
	
	/**
	 * 当用户在节点上点击右键时被Flex调用的回调函数
	 * @memberOf {Flow} 
	 * @param {String} nodeId 被点击的节点id
	 * @return {Boolean} 如果返回值为flase,则不展示右键
	 */
	this.onNodeContextMenu = function(nodeId){
		flowComp.blur();
		handlers.menu=new Object();
		if(isArrowEvent&&config['onNodeContextMenu']){
			var rtn = [];
			var temp = config['onNodeContextMenu'](nodeId);
			for(var i=0;i<temp.length;i++){
				var obj = temp[i];
				!obj.mid&&(obj.mid=generateId());
				if(obj.handler){
					handlers.menu[obj.mid]=obj.handler;
				}
				rtn.push(obj);
			}
			return rtn;
		}else {
			return false;
		}
	};
	
	/**
	 * 当用户在连接线上点击右键时被Flex调用的回调函数
	 * @memberOf {Flow} 
	 * @param {String} fromNodeId 被点击的连接线from节点id
	 * @param {String} toNodeId 被点击的连接线to节点id
	 * @return {Boolean} 如果返回值为flase,则不展示右键
	 */
	this.onLinkContextMenu = function(fromNodeId,toNodeId){
		flowComp.blur();
		handlers.menu=new Object();
		if(isArrowEvent&&config['onLinkContextMenu']){
			var rtn = [];
			var temp = config['onLinkContextMenu'](fromNodeId,toNodeId);
			for(var i=0;i<temp.length;i++){
				var obj = temp[i];
				!obj.mid&&(obj.mid=generateId());
				if(obj.handler){
					handlers.menu[obj.mid]=obj.handler;
				}
				rtn.push(obj);
			}
			return rtn;
		}else {
			return false;
		}
	};
	
	/**
	 * 当用户点击右键菜单项时被Flex调用的回调函数
	 * @memberOf {Flow} 
	 */
	this.onContextMenuClick = function(mid){
		flowComp.blur();
		isArrowEvent&&handlers.menu[mid](mid);
	};
	
	/**
	 * 当用户在节点上双击左键时被Flex调用的回调函数
	 * @memberOf {Flow} 
	 * @param {String} nodeId 被点击的节点id
	 */
	this.onNodeDblClick = function(nodeId){
		if(isArrowEvent&&config['onNodeDblClick']){
			flowComp.blur();
			config['onNodeDblClick'](nodeId);
		}
	};
	
	/**
	 * 当用户在连接线上双击左键时被Flex调用的回调函数
	 * @memberOf {Flow} 
	 * @param {String} fromUID 被点击的连接线from节点id
	 * @param {String} toUID 被点击的连接线to节点id
	 */
	this.onLinkDblClick = function(fromUID,toUID){
		if(isArrowEvent&&config['onLinkDblClick']){
			flowComp.blur();
			config['onLinkDblClick'](fromUID,toUID);
		}
	};
	
	/**
	 * 当某个节点被用户执行删除操作前被Flex调用的回调函数
	 * @memberOf {Flow} 
	 * @param {String} nodeId 被用户执行删除操作的节点id
	 * @return {Boolean} true：删除,false：不删除
	 */
	this.onBeforeDeleteNode = function(nodeId){
		if(isArrowEvent&&config['onBeforeDeleteNode']){
			flowComp.blur();
			return config['onBeforeDeleteNode'](nodeId);
		}else{
			return true;
		}
	}
	
	/**
	 * 当某个节点被用户执行删除操作后被Flex调用的回调函数
	 * @memberOf {Flow} 
	 * @param {String} nodeId 被用户执行删除操作的节点id
	 * @return {Boolean} true：删除,false：不删除
	 */
	this.onAfterDeleteNode = function(nodeId){
		if(isArrowEvent&&config['onAfterDeleteNode']){
			flowComp.blur();
			config['onAfterDeleteNode'](nodeId);
		}
	}
	
	
	/**
	 * 当用户操作连接节点确定前被Flex调用的回调函数
	 * @memberOf {Flow} 
	 * @param {String} fromUID 连接线的起始节点id
	 * @param {String} toUID   连接线的结束节点id
	 * @return {Boolean} true：确定连接,false：不连接
	 */
	this.onBeforeLink = function(fromUID,toUID){
		if(isArrowEvent&&config['onBeforeLink']){
			flowComp.blur();
			return config['onBeforeLink'](fromUID,toUID);
		}else{
			return true;
		}
	}
	
	/**
	 * 当用户操作连接节点确定后被Flex调用的回调函数
	 * @memberOf {Flow} 
	 * @param {String} fromUID 连接线的起始节点id
	 * @param {String} toUID   连接线的结束节点id
	 */
	this.onAfterLink = function(fromUID,toUID){
		if(isArrowEvent&&config['onAfterLink']){
			flowComp.blur();
			config['onAfterLink'](fromUID,toUID);
		}
	}
	
	/**
	 * 当用户操作删除连接线前被Flex调用的回调函数
	 * @memberOf {Flow} 
	 * @param {String} fromUID 连接线的起始节点id
	 * @param {String} toUID   连接线的结束节点id
	 * @return {Boolean} true：确定删除,false：不删除
	 */
	this.onBeforeDeleteLink = function(fromUID,toUID){
		if(isArrowEvent&&config['onBeforeDeleteLink']){
			flowComp.blur();
			return config['onBeforeDeleteLink'](fromUID,toUID);
		}else{
			return true;
		}
	}
	
	/**
	 * 当用户操作删除连接线后被Flex调用的回调函数
	 * @memberOf {Flow} 
	 * @param {String} fromUID 连接线的起始节点id
	 * @param {String} toUID   连接线的结束节点id
	 */
	this.onAfterDeleteLink = function(fromUID,toUID){
		if(isArrowEvent&&config['onAfterDeleteLink']){
			flowComp.blur();
			config['onAfterDeleteLink'](fromUID,toUID);
		}
	}
	
	/**
	 * 加载节点数据
	 * @memberOf {Flow} 
	 * @param {Object} data 要加载的节点数据
	 */
	this.loadNodes = function(data){
		var div = config['div'];
		div = (typeof div == 'string') ? document.getElementById(div) : div;
		this.removeAllNode();
		var figureWidth = this.getFigureWidth();
		var figureHeight = this.getFigureHeight();
		var canvasWidth = this.getCanvasWidth();
		var canvasHeight = this.getCanvasHeight();
		if(config['layout']=='random'){//随机布局
			for(var i=0;i<data.nodes.length;i++){
				var node = data.nodes[i];
				node.x=(canvasWidth-figureWidth)*Math.random()+figureWidth;
				node.y=(canvasHeight-figureHeight)*Math.random()+figureHeight;
			}
		}else if(config['layout']=='queue'){//队列型布局
			var temp = new Array();
			var countArray = new Array();
			var levelCount = 0;
			var vMaxCount = 0;
			var minLevel = 0;
			for(var i=0;i<data.nodes.length;i++){
				var node = data.nodes[i];
				if(!temp[Math.abs(node.level)]){
					temp[Math.abs(node.level)]=new Array();
				}
				if(node.level<0){
					if(!temp[Math.abs(node.level)].negativeCount){
						temp[Math.abs(node.level)].negativeCount=0;
						if(node.level<minLevel){
							minLevel = node.level;
						}
						levelCount++;
					}
					temp[Math.abs(node.level)].negativeCount++;
					if(temp[Math.abs(node.level)].negativeCount>vMaxCount){
						vMaxCount = temp[Math.abs(node.level)].negativeCount;
					}
				}else{
					if(!temp[Math.abs(node.level)].positiveCount){
						temp[Math.abs(node.level)].positiveCount = 0;
						levelCount++;
					}
					temp[Math.abs(node.level)].positiveCount++;
					if(temp[Math.abs(node.level)].positiveCount>vMaxCount){
						vMaxCount = temp[Math.abs(node.level)].positiveCount;
					}
				}
				temp[Math.abs(node.level)].push(node);
			}
			for(var i=0;i<temp.length;i++){
				var nodes = temp[i];
				var negativeIndex = 0;//负数序号
				var positiveIndex = 0;//正数序号
				for(var j=0;j<nodes.length;j++){
					var node = nodes[j];
					var levelIndex= node.level-minLevel;
					node.x = (levelIndex+1)*figureWidth+figureWidth*levelIndex/2;
					if(node.level<0){
						node.y = (figureHeight+30)*vMaxCount/(nodes.negativeCount+1)*(negativeIndex+1);
						negativeIndex++;
					}else{
						node.y = (figureHeight+30)*vMaxCount/(nodes.positiveCount+1)*(positiveIndex+1);
						positiveIndex++;
					}
				}
			}
		}else{
			
		}
		
		flowComp.loadNodes(data);//加载到flash组件
	};
	
	/**
	 * 获取所有节点数据
	 * @memberOf {Flow} 
	 * @return {Object} data 节点数据
	 */
	this.getAllNodes = function (){
		return flowComp.getAllNodes();
	};
	
	/**
	 * 删除所有节点数据
	 * @memberOf {Flow} 
	 */
	this.removeAllNode = function(){
		flowComp.removeAllNode();
	};
	
	/**
	 * 添加一个节点到流程组件中
	 * @memberOf {Flow} 
	 * @param {Object} data
	 */
	this.addNode = function(data){
		flowComp.addNode(data);
	};
	
	/**
	 * 设置节点位置
	 * @memberOf {Flow} 
	 * @param {Object} data 格式 ：{uid,x,y} 或者 [{uid,x,y},{uid,x,y},{uid,x,y},……]
	 */
	this.setNodePos = function(data){
		flowComp.setNodePos(data);
	};
	
	/**
	 * 设置节点位置
	 * @memberOf {Flow} 
	 * @param {String} uid 节点id  
	 * 返回值 格式 ：{x:0,y:0}
	 */
	this.getNodePos = function(uid){
		return flowComp.getNodePos(uid);
	};
	
	/**
	 * 添加一个连接到流程组件中
	 * @memberOf {Flow} 
	 * @param {String} fromUID 起始节点id
	 * @param {String} toUID 结束节点id
	 */
	this.addLink = function(fromUID,toUID,data){
		flowComp.addLink(fromUID,toUID,data||null);
	};
	
	/**
	 * 根据节点id选中节点
	 * @memberOf {Flow} 
	 * @param {String} uid 目标节点id
	 */
	this.selectNode = function(uid){
		flowComp.selectNode(uid);
	};
	
	/**
	 * 设置节点默认背景色
	 * @memberOf {Flow} 
	 * @param {Number} color 16进制的颜色值
	 */
	this.setNodeDefaultColor = function(color){
		flowComp.setNodeDefaultColor(color);
	};
	
	/**
	 * 设置指定的节点背景色
	 * @memberOf {Flow} 
	 * @param {String} nodeId 目标节点的id
	 * @param {Number} color 16进制的颜色值
	 */
	this.setNodeColor = function(nodeId,color){
		flowComp.setNodeColor(nodeId,color);
	};
	
	/**
	 * 根据节点id,获取节点数据
	 * @memberOf {Flow} 
	 * @param {String} uid 目标节点的id
	 * @return {Object} 节点数据
	 */
	this.getNode=function(uid){
		return flowComp.getNode(uid);
	};
	
	/**
	 * 根据起始节点id和结束节点id,获取连接线数据
	 * @memberOf {Flow} 
	 * @param {String} fromUID 起始节点的id
	 * @param {String} toUID 结束节点的id
	 * @return {Object} 连接线数据
	 */
	this.getLink=function(fromUID,toUID){
		return flowComp.getLink(fromUID,toUID);
	};
	
	/**
	 * 根据节点id设置闪动颜色
	 * @memberOf {Flow} 
	 * @param {String} uid 目标节点的id
	 * @param {Number} color 16进制颜色值
	 */
	this.setNodeGlowColor=function(uid,color){
		flowComp.setNodeGlowColor(uid,color);
	};
	
	/**
	 * 使目标节点开始闪动
	 * @memberOf {Flow} 
	 * @param {String} uid 目标节点的id
	 */
	this.nodeGlowPlay=function(uid){
		flowComp.nodeGlowPlay(uid);
	};
	
	/**
	 * 使目标节点停止闪动
	 * @memberOf {Flow} 
	 * @param {String} uid 目标节点的id
	 */
	this.nodeGlowStop=function(uid){
		flowComp.nodeGlowStop(uid);
	};
	
	/**
	 * 根据起始节点id和结束节点id设置连接线的闪动颜色
	 * @memberOf {Flow} 
	 * @param {String} fromUID 起始节点的id
	 * @param {String} toUID 结束节点的id
	 * @param {Number} color 16进制颜色值
	 */
	this.setLinkGlowColor=function(fromUID,toUID,color){
		flowComp.setLinkGlowColor(fromUID,toUID,color);
	};
	
	/**
	 * 使起始节点id和结束节点id表示的连接线开始闪动
	 * @memberOf {Flow} 
	 * @param {String} fromUID 起始节点的id
	 * @param {String} toUID 结束节点的id
	 */
	this.linkGlowPlay=function(fromUID,toUID){
		flowComp.linkGlowPlay(fromUID,toUID);
	};
	
	/**
	 * 使起始节点id和结束节点id表示的连接线停止闪动
	 * @memberOf {Flow} 
	 * @param {String} fromUID 起始节点的id
	 * @param {String} toUID 结束节点的id
	 */
	this.linkGlowStop=function(fromUID,toUID){
		flowComp.linkGlowStop(fromUID,toUID);
	};
	
	/**
	 * 隐藏左侧的Palette
	 * @memberOf {Flow} 
	 */
	this.hidePalette=function(){
		flowComp.hidePalette();
	}
	
	/**
	 * 展示左侧的Palette
	 * @memberOf {Flow} 
	 */
	this.showPalette=function(){
		flowComp.showPalette();
	}
	
	/**
	 * 隐藏左侧的ControlBar
	 * @memberOf {Flow} 
	 */
	this.hideControlBar=function(){
		flowComp.hideControlBar();
	}
	
	/**
	 * 展示左侧的ControlBar
	 * @memberOf {Flow} 
	 */
	this.showControlBar=function(){
		flowComp.showControlBar();
	}
	
	/**
	 * 获取流程组件中的画布宽度
	 * @memberOf {Flow} 
	 * @return {Number} 流程组件中的画布宽度
	 */
	this.getCanvasWidth = function(){
	    return flowComp.getCanvasWidth();
	}
	
	/**
	 * 获取流程组件中的画布高度
	 * @memberOf {Flow} 
	 * @return {Number} 流程组件中的画布高度
	 */
	this.getCanvasHeight = function(){
		return flowComp.getCanvasHeight();
	}
	
	/**
	 * 获取流程组件中的节点图的宽度
	 * @memberOf {Flow} 
	 * @return {Number} 流程组件中的节点图的宽度
	 */
	this.getFigureWidth = function(){
		return flowComp.getFigureWidth();
	}
	
	/**
	 * 获取流程组件中的节点图的高度
	 * @memberOf {Flow} 
	 * @return {Number} 流程组件中的节点图的高度
	 */
	this.getFigureHeight = function(){
		return flowComp.getFigureHeight();
	}
	
	/**
	 * 展示toolbar中的选择按钮
	 * @memberOf {Flow}
	 */
	this.showSelectBtn = function(){
		flowComp.showSelectBtn();
	}
	
	/**
	 * 隐藏toolbar中的选择按钮
	 * @memberOf {Flow}
	 */
	this.hideSelectBtn = function(){
		return flowComp.hideSelectBtn();
	}
	
	/**
	 * 展示toolbar中的连接按钮
	 * @memberOf {Flow}
	 */
	this.showLinkBtn = function(){
		return flowComp.showLinkBtn();
	}
	
	/**
	 * 隐藏toolbar中的连接按钮
	 * @memberOf {Flow}
	 */
	this.hideLinkBtn = function(){
		return flowComp.hideLinkBtn();
	}
	
	/**
	 * 展示toolbar中的编辑按钮
	 * @memberOf {Flow}
	 */
	this.showEditBtn = function(){
		return flowComp.showEditBtn();
	}
	
	/**
	 * 隐藏toolbar中的编辑按钮
	 * @memberOf {Flow}
	 */
	this.hideEditBtn = function(){
		return flowComp.hideEditBtn();
	}
	
	/**
	 * 展示toolbar中的删除按钮
	 * @memberOf {Flow}
	 */
	this.showRemoveBtn = function(){
		return flowComp.showRemoveBtn();
	}
	
	/**
	 * 隐藏toolbar中的删除按钮
	 * @memberOf {Flow}
	 */
	this.hideRemoveBtn = function(){
		return flowComp.hideRemoveBtn();
	}
	/**
	 * 隐藏toolbar中的删除按钮的文字
	 * @param label 删除按钮文字
	 * @memberOf {Flow}
	 */
	this.setRemoveBtnLabel = function(label){
		return flowComp.setRemoveBtnLabel(label);
	}
	/**
	 * 展示toolbar中的缩放
	 * @memberOf {Flow}
	 */
	this.showScaleSlider = function(){
		return flowComp.showScaleSlider();
	}
	
	/**
	 * 隐藏toolbar中的缩放
	 * @memberOf {Flow}
	 */
	this.hideScaleSlider = function(){
		return flowComp.hideScaleSlider();
	}
	
	/**
	 * 更新节点的属性
	 * @memberOf {Flow}
	 * @param uid 目标节点的uid
	 * @param key 属性名
	 * @param value 属性值
	 */
	this.updateNodeAttr = function(uid,key,value){
		isArrowEvent = false;
		var temp = flowComp.getNode(uid);
		this.removeNode(uid);
		temp[key]=value;
		temp.uid = uid;
		flowComp.addNode(temp);
		isArrowEvent = true;
	}
	
	/**
	 * 删除节点的属性
	 * @memberOf {Flow}
	 * @param uid 目标节点的uid
	 * @param key 属性名
	 */
	this.deleteNodeAttr = function(uid,key){
		isArrowEvent = false;
		var temp = flowComp.getNode(uid);
        this.removeNode(uid);
		temp[key]=null;
		delete temp[key];
		temp.uid = uid;
		flowComp.addNode(temp);
		isArrowEvent = true;
	}
	
	/**
	 * 更新连接的属性
	 * @memberOf {Flow}
	 * @param fromUID 连接的起始节点UID
	 * @param toUID 连接的结束节点UID
	 * @param key 属性名
	 * @param value 属性值
	 */
	this.updateLinkAttr = function(fromUID,toUID,key,value){
		isArrowEvent = false;
		var temp = flowComp.getLink(fromUID,toUID);
		flowComp.removeLink(fromUID,toUID);
		temp[key]=value;
		flowComp.addLink(fromUID,toUID,temp);
		isArrowEvent = true;
	}
	
	/**
	 * 删除连接的属性
	 * @memberOf {Flow}
	 * @param fromUID 连接的起始节点UID
	 * @param toUID 连接的结束节点UID
	 * @param key 属性名
	 */
	this.deleteLinkAttr = function(ufromUID,toUID,key){
		isArrowEvent = false;
		var temp = flowComp.getLink(fromUID,toUID);
		flowComp.removeLink(fromUID,toUID);
		temp[key]=null;
		delete temp[key];
		flowComp.addLink(fromUID,toUID,temp);
		isArrowEvent = true;
	}
	
	/**
	 * 获取闪动中的节点
	 * @memberOf {Flow}
	 * @return {Array} 节点数组
	 */
	this.getGlowingNodes = function(){
		return flowComp.getGlowingNodes();
	}
	
	/**
	 * 获取闪动中的连接线
	 * @memberOf {Flow}
	 * @return {Array} 连接线数组
	 */
	this.getGlowingLinks = function(){
		return flowComp.getGlowingLinks();
	}
	
	/**
	 * 删除连接线
	 * @memberOf {Flow}
	 */
	this.removeLink = function(fromUID,toUID){
		flowComp.removeLink(fromUID,toUID)
	}
	
	/**
	 * 删除节点
	 * @memberOf {Flow}
	 */
	this.removeNode = function(uid){
		flowComp.removeFigureNode(uid);
	};
	
	/**
	 *获取鼠标在画布上的鼠标位置
	 *@memberOf {Flow}
	 *@return {Object} 鼠标位置,格式为{x:100,y:100}
	 */
	this.getCanvasMousePoint = function(){
		return flowComp.getCanvasMousePoint();
	}
	
	/**
	 *滚动至画布中间
	 *@memberOf {Flow}
	 */
	this.center = function(){
		flowComp.center();
	}
	
	/**
	 *获取被选中的节点数组
	 *@memberOf {Flow}
	 *@return
	 */
	this.getSelectedNodes = function(){
		return flowComp.getSelectedNodes();
	}
	
	/**
	 * 显示toolbar中的清空按钮
	 * @memberOf {Flow}
	 */
	this.showClearBtn = function(){
		return flowComp.showClearBtn();
	}
	
	/**
	 * 隐藏toolbar中的清空按钮
	 * @memberOf {Flow}
	 */
	this.hideClearBtn = function(){
		return flowComp.hideClearBtn();
	}
	
	this.doLayout = function(){
		return flowComp.doLayout();
	}
	/**
	 * 清空事件的回调方法
	 */
	this.onClear = function(){
		if(config['onClear']){
			config['onClear']();
		}
	}
};