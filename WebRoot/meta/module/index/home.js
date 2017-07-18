//菜单数据对象
var menuArray = null;
var openedTab = {};
var tabbar = null;
var tabCount = 0;
//菜单访问历史。
var menuHistory = [];

var _sessionInfo = {};
var layouts={};

function getSessionAttribute(attr){
	if(!_sessionInfo[attr]){
		SessionManager.getAttribute(
			attr, 
			{
				async:false, callback:function (data) {
		    		_sessionInfo[attr] = data;
				}
			}
		);
	}
	return _sessionInfo[attr];
}

/**
 *  url编码
 * @param winUrl
 */
var urlEncode = function (str) {
    var user = getSessionAttribute('user');
    if (str.toLowerCase().indexOf("http://") == -1) {
        //加入权限标识
        var strKey = Tools.base64encode(user.userId + user.userPass);
        str = Tools.trim(str) + (str.indexOf("?") == -1 ? "?" : "&") + "_strKey_=" + strKey;
    }
    return str;
}

var urlDeal = function (winUrl, userAttrList, menuId) {
    winUrl = Tools.trim(winUrl);
    if (winUrl) {
        //为其添加扩展参数menuId
        if (menuId && winUrl.toLowerCase().indexOf("http://") == -1) {
            winUrl = Tools.trim(winUrl) + (winUrl.indexOf("?") == -1 ? "?" : "&") + "menuId=" + menuId;
        }
        if (userAttrList) {
            winUrl = Tools.trim(winUrl) + (winUrl.indexOf("?") == -1 ? "?" : "&") + userAttrList;
        }
        return doUrlDeal(urlEncode(winUrl));
    }
    dhx.env.isIE && CollectGarbage();
};


function openTab(i){
	if(tabbar&&menuArray){
		var menuData = menuArray[i];
		if(menuData.TARGET=='blank'){
			openWindow(menuData.MENU_ID,menuData);
		}else if(!openedTab[menuData.MENU_ID]){
			tabbar.addTab(menuData.MENU_ID,menuData.MENU_NAME,'*');
			openedTab[menuData.MENU_ID] = menuData;
			LoginAction.queryAllSubMenu(parseInt(menuData.MENU_ID),function(subMenu){
				if(subMenu&&subMenu.length>0){
					var layout = tabbar.cells(menuData.MENU_ID).attachLayout("2U","dhx_skyblue");
					layouts[menuData.MENU_ID]=layout;
					var bCell = layout.cells('b');
					bCell.hideHeader();
					bCell.attachURL(urlDeal(menuData.MENU_URL,menuData.USER_ATTR_LIST,menuData.MENU_ID));
					
					var aCell = layout.cells('a');
					aCell.setText(menuData.MENU_NAME);
					aCell.setWidth(200);
					aCell.fixSize(true,false);
					var menuTree = aCell.attachTree();
					menuTree.setImagePath(dhtmlx.image_path + "csh_dhx_skyblue/");
					menuTree.enableIEImageFix(true);
					var jsArray = new Array();
					for(var i=0,len=subMenu.length;i<len;i++){
						var item = subMenu[i];
						if(item.IS_SHOW==0){
							
						}else if(item.PARENT_ID==menuData.MENU_ID){
							jsArray.push([item.MENU_ID,'0',item.MENU_NAME]);
						}else{
							jsArray.push([item.MENU_ID,item.PARENT_ID,item.MENU_NAME]);
						}
					}
					menuTree.loadJSArray(jsArray);
					jsArray.length=0;
					for(var i=0,len=subMenu.length;i<len;i++){
						var item = subMenu[i];
						menuTree.setUserData(item.MENU_ID,"target",item.TARGET);
						menuTree.setUserData(item.MENU_ID,"url",item.MENU_URL);
						var data = {
							menuId:item.MENU_ID,
							menuUrl:item.MENU_URL,
							target:item.TARGET,
							menuName:item.MENU_NAME,
							userAttrList:item.USER_ATTR_LIST
						};
						menuTree.setUserData(item.MENU_ID,"menuData",data);
					}
					
					menuTree.attachEvent('onClick',function(id){
						menuClick(id, menuTree.getUserData(id, "menuData"));
			            return true;
			        });
					
				}else{
					tabbar.setContentHref(menuData.menuId,rootPath+"/"+menuData.menuUrl);
				}
			});
			tabCount++;
		}
		tabbar.setTabActive(menuData.MENU_ID);
	}
}

/**
 * 点击菜单操作
 * @param menuId
 * @param menuData
 * @param isRefresh 如果此菜单已打开，是否进行刷新
 */
var menuClick = function (menuId, menuData, isRefresh) {
    if (!menuData.menuUrl&&!Tools.trim(menuData.menuUrl)) {
    	return;
    }
    
    //记录访问日志。
    if ((menuId != undefined || menuId != null) && !isNaN(menuId)) {
        MenuVisitLogAction.writeMenuLog(
            {menuId:menuId, menuName:menuData.menuName}
        );
        //缓存菜单访问历史
        menuHistory.push(menuId);
    } else {
        //判断menuId是否为null，如果为 null，是在数据中一个未注册的ID,伪造一个假菜单数据。
        //但menuData中必须有的三个属性为，menuName,menuUrl, target
        if(!menuId){
        	menuId = menuData.menuName;
        }

        menuId = encodeURI(encodeURI(menuId));
        menuData.menuId = menuId;
        //伪造菜单数据。
        subMenuData[menuId] = [];
    }
    //处理菜单动作，是新开窗口还是openTab
    if (menuData.target == "blank") { //新开一个窗口
        openWindow(menuId, menuData);
    } else {//open Tab
    	openMenu(menuData.menuName,menuData.menuUrl,menuData.target,menuId,isRefresh||menuData.isRefresh);
    }
    dhx.env.isIE && CollectGarbage();
}

function openMenu(menuName,menuUrl,target,menuId,isRefresh){
	menuId = menuId?menuId:menuName;
	var menuData = {};
    //打开一个虚拟的菜单。
    menuName && (menuData.menuName = menuName);
    menuUrl && (menuData.menuUrl = menuUrl);
    target && (menuData.target = target);
    menuId && (menuData.menuId = menuId);
    menuData.parentId = tabbar.getActiveTab();
    menuData.isRefresh = isRefresh;
    if(!menuName||!menuUrl||!target){
        alert("缺少打开菜单的必选参数，不能打开一个菜单!");
    }else if(target=='blank'){
    	openWindow(menuId,menuData)
    }else if(target=='top'){
    	if(!openedTab[menuId]){
    		tabbar.addTab(menuId,menuData.menuName,'*');
			openedTab[menuId] = menuData;
			tabbar.setContentHref(menuId,urlDeal(menuData.menuUrl,null,menuId));
			tabCount++;
    	}
    	tabbar.setTabActive(menuId);
    }else{
    	if(layouts[menuData.parentId]&&layouts[menuData.parentId].cells('b'));{
    		layouts[menuData.parentId].cells('b').attachURL(urlDeal(menuUrl,null,menuId));
    	}
    }
}

function addTabRefreshOnActive(tabId){
	var tab = tabbar.cells(tabId);
	tab.setAttribute('isRefresh',true);
}

var _sessionInfo = {};
var getSessionAttribute=function(attr,realTime){
    if(realTime||!_sessionInfo[attr]){
        SessionManager.getAttribute(attr,{async:false,callback:function(data){
            _sessionInfo[attr]=data;
        }
        })
    }
    return _sessionInfo[attr];
};

function openWindow(menuId, menuData){
    var winName = "newWindow" + menuId;
    var winUrl = urlDeal(menuData.MENU_URL, menuData.USER_ATTR_LIST, menuId);
    var config = "toolbar=yes,resizable=yes,";
    var browserState = parseInt(menuData.navState);
    if((1 & browserState) == 1){//可以最大化
        config += ",fullScreen=yes";
    } else{
        config += "height=300, width=600,";//设置默认高宽度
    }
    if((2 & browserState) == 2){//可以有滚动
        config += "scrollbars=yes,";
    } else{
        config += "scrollbars=no,";
    }
    if((4 & browserState) == 4){//可以有菜单栏
        config += "menubar=yes,";
    } else{
        config += "menubar=no,";
    }
    if((8 & browserState) == 8){//可以有状态栏
        config += "status=yes,";
    } else{
        config += "status=no,";
    }
    if((16 & browserState) == 16){//可以有链接栏
        config += "location=yes";
    } else{
        config += "location=no";
    }
    var child = window.open('about:blank', winName, config);
    child.document.location.href = winUrl;
}

function logout(){
    if(confirm("您确定要退出系统吗?")){
        //发送退出消息，清空session，并重定向页面
        LoginAction.logout(function(data){
	        window.location=getBasePath();
	    });
    }
};

function systemChange(){
	LoginAction.changeSystem($('systemSelect').value,function(){
		window.location="home.jsp";
	});
}

dhx.ready(
	function(){
		tabbar = new dhtmlXTabBar("tabbar", "top"); 
		tabbar.enableTabCloseButton(true);
        tabbar.enableAutoReSize(true);
//        tabbar.enableScroll(false);
        tabbar.setHrefMode('iframes');
        tabbar.attachEvent("onSelect", function(id,last_id){
			var tab = tabbar.cells(id);      
			if(tab.getAttribute('isRefresh')){
				if(layouts[id]&&layouts[id].cells('b')){
					layouts[id].cells('b').innerHTML;
				}else{
					tab.innerHTML;
				}
			}
            return true;
        });
        tabbar.attachEvent("onTabClose", function(id){
        	  if(tabCount==1){
        		  return false;
        	  }else{
        		  delete layouts[id];
        		  delete openedTab[id];	
        		  tabCount--;
              	  return true;
        	  }
        });
        LoginAction.queryRootMenu(systemId,function(data){
        	menuArray = data;
	        var html = '';
        	for(var i=0,length=data.length;i<length;i++){
        		var menuData = data[i];
        		var menuIconUrl = rootPath+menuData.ICON_URL;
        		menuIconUrl = menuIconUrl.replace("//","/");
        		html+="<li>";
        		html+='<a href="javascript:openTab('+i+');">';
				html+='<img style="border: currentColor; width: 32px;" align="middle" src="'+menuIconUrl+'">'+menuData.MENU_NAME;
				html+='</a>';
				html+='</li>';
        	}
        	$('navUl').innerHTML = html;
        	html = null;
        	if(data.length>0){
        		openTab(0);
        	}
        });
        MenuAction.queryMenuSystem(function(data){
	        //定义切换系统selectButton
	        if(data&&data.length>0){
	            var systemSelect = $("systemSelect");
	            for(var i=0;i<data.length;i++){
	                var option = document.createElement('option');
	                option.value = data[i].GROUP_ID;
	                option.innerHTML = data[i].GROUP_NAME;
	                systemSelect.appendChild(option);
	
	                if(data[i].groupId==systemId){
	                    option.selected = true;
	                }
	            }
	        }
	        data.length=0;
	    });
	}
);