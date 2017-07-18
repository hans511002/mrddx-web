/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        refDimUser.js
 *Description：
 *       角色管理模块的对地域机构授权功能
 *Dependent：
 *       role.js，dhtmlx.js，dwr 有关JS，dhtmxExtend.js。。。
 *Author: 刘斌
 *
 *Finished：
 *       2011-10-13-14-37
 *Modified By：
 *
 *Modified Date:
 *
 *Modified Reasons:

 ********************************************************/

var refDimUsers=function(rowId){
    /**
     * User表Data转换器
     */
    var userConvertConfig = {
        idColumnName:"userId",
        filterColumns:["userNamecn","userEmail","zoneName","deptName","stationName"],
        /**
         * 覆盖父类方法：数据转换
         * @param rowIndex
         * @param rowData
         */
        userData:function(rowIndex,rowData){
            var userData ={};
            if(rowData["createDate"] != null){
                userData["createDate"]=rowData["createDate"];
            } else {
                userData["createDate"]="";
            }
            if(rowData["oaUserName"] != null){
                userData["oaUserName"]=rowData["oaUserName"];
            } else {
                userData["oaUserName"]="";
            }
            return userData;
        }

    }
    var userDataConverter=new dhtmxGridDataConverter(userConvertConfig);

    var rowData = mygrid.getRowData(rowId);
    var loadUserParam=new biDwrMethodParam();
    var dhxWindow=new dhtmlXWindows();
    dhxWindow.createWindow("refDimUserWindow",0,0,700,480);
    var refDimUserWindow=dhxWindow.window("refDimUserWindow");
    refDimUserWindow.setModal(true);
    refDimUserWindow.stick();
    refDimUserWindow.setDimension(700,410);
    refDimUserWindow.center();
    refDimUserWindow.denyResize();
    refDimUserWindow.denyPark();
    refDimUserWindow.setText("对地域机构授权");
    refDimUserWindow.keepInViewport(true);
    //关闭一些不用的按钮。
    refDimUserWindow.button("minmax1").hide();
    refDimUserWindow.button("park").hide();
    refDimUserWindow.button("stick").hide();
    refDimUserWindow.button("sticked").hide();
    refDimUserWindow.show();

    var refDimUserLayout = new dhtmlXLayoutObject(refDimUserWindow,"2E");
    refDimUserLayout.cells("a").setHeight(60);
    refDimUserLayout.cells("a").hideHeader(true);
    refDimUserLayout.cells("a").fixSize(false, true);
    refDimUserLayout.cells("b").setText("用户列表");
    refDimUserLayout.hideSpliter();//移除分界边框。
    refDimUserLayout.hideConcentrate();//隐藏缩放按钮
    //加载查询表单
    var status=0;
    var queryform = refDimUserLayout.cells("a").attachForm([
        {type:"settings",position: "label-left", labelWidth: 40, inputWidth: 100},

        {type:"input",label:"地域：",name:"zone"} ,
        {type:"button",name:"doRef",value:"对选中范围用户授权", offsetLeft:50},
        {type:"newcolumn"},
        {type:"input",label:"部门：",name:"dept"},
        {type:"button",name:"cancelRef",value:"对选中范围用户取消", offsetLeft:10},
        {type:"newcolumn"},
        {type:"input",label:"岗位：",name:"station"},
         {type:"newcolumn"},
        {type:"button",name:"query",value:"查询", offsetLeft:10},
        {type:"hidden",name:"roleId",value:rowId},
        {type:"hidden",name:"dimUserState",value:1},
        {type:"hidden",name:"status"}
    ]);
    //定义loadUser Action的参数来源于表单queryform数据。
    loadUserParam.setParamConfig([{
        index:0,type:"fun",value:function(){
    	    var data = queryform.getFormData();
    	    if(data.zoneId == null || data.zoneId == ""){
    	    	data.zoneId = user.zoneId
    	    }
            return data;
        }
    }]);
    
    dwrCaller.addAutoAction("loadDimUser", "UserAction.queryUser", loadUserParam,
        function(data){
//            alert(data);
        }
    );
    dwrCaller.addDataConverter("loadDimUser",userDataConverter);
    var dimUserGrid=refDimUserLayout.cells("b").attachGrid();
    //查询表单事件处理
    queryform.attachEvent("onButtonClick", function(id){
        if(id=="query"){//查看选中用户
            //进行数据查询。
            dimUserGrid.clearAll();
            dimUserGrid.load(dwrCaller.loadDimUser,"json");
        }
        if(id=="doRef"){//对选中范围用户授权
            var formData=queryform.getFormData();
            if(!formData.deptId&&!formData.stationId&&!formData.zoneId){
                dhx.alert("请至少选择一个地域、部门或者岗位！")
                return;
            }
            dhx.confirm("确认对您选择的地域机构用户进行授权?", function(data){
                if(data){
                    var initData={status:1};
                    status=1;
                    queryform.setFormData(initData);
                    dwrCaller.executeAction("refUserBatch",queryform.getFormData());
                }
            })

        }
        if(id=="cancelRef"){//对选中范围用户取消授权
            var formData=queryform.getFormData();
            if(!formData.deptId&&!formData.stationId&&!formData.zoneId){
                dhx.alert("请至少选择一个地域、部门或者岗位！")
                return;
            }
            dhx.confirm("确认对您选择的地域机构用户进行取消授权?", function(data){
                if(data){
                    var initData={status:2};
                    status=2;
                    queryform.setFormData(initData);
                    dwrCaller.executeAction("refUserBatch",queryform.getFormData());
                }
            });
        }

    });

//    //加载部门树
//    loadDeptTree(null,queryform);
//    //加载地域树
//    loadZoneTree(null,queryform);
//    //加载岗位树
//    loadStationTree(null,queryform);
	
    //加载部门树
    loadDeptTreeChkbox(null,queryform);
    //加载地域树
   //alert(user.zoneId);
    loadZoneTreeChkBox(user.zoneId,queryform);
    //加载岗位树
    loadStationTreeChkBox(null,queryform);
    
    dimUserGrid.setHeader("姓名,邮箱,地域,部门,岗位");
    dimUserGrid.setInitWidths("*,*,*,*,*");
    dimUserGrid.setColAlign("left,center,center,center,center");
    dimUserGrid.setHeaderAlign("left,center,center,center,center");
    dimUserGrid.setColTypes("ro,ro,ro,ro,ro");
    dimUserGrid.setColSorting("na,na,na,na,na");
    dimUserGrid.enableCtrlC();
    dimUserGrid.enableMultiselect(true);
    dimUserGrid.setColumnIds("userNamecn,userEmail,zoneName,deptName,stationName");
    dimUserGrid.init();
    dimUserGrid.showRowNumber();
    dimUserGrid.defaultPaging(10);
    dimUserGrid.load(dwrCaller.loadDimUser,"json");

    dwrCaller.addAutoAction("refUserBatch", "RoleAction.refUserBatch",
            function(data){
                if(status==1){
                    if(data>0){
                        dhx.alert("总共"+data+"个用户被授权");
                    }if(data==0){
                        dhx.alert("您选中的所有用户已经完成授权");
                    }
                }
                if(status==2){
                    if(data>0){
                        dhx.alert("总共"+data+"个用户被取消授权");
                    }if(data==0){
                        dhx.alert("您选中的所有用户已经被取消授权");
                    }
                }
                if(data<0){
                    dhx.alert("设置出错");
                }
            }
        )

};