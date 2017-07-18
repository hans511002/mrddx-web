/**
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 *
 * @author 王春生
 * @description
 * @date 12-3-30
 * -
 * @modify
 * @modifyDate
 * -
 */

dhtmlx.image_path = getDefaultImagePath();
dhtmlx.skin = getSkin();
var user= getSessionAttribute("user");
var initOnlineUser = function(){
    if(menuId){
        window.parent.addTabRefreshOnActive(menuId);
    }

    var userLayout = new dhtmlXLayoutObject(document.body,"1C");
    userLayout.cells("a").setText("在线用户统计");
    userLayout.cells("a").hideHeader(true);
    userLayout.hideConcentrate();
    userLayout.hideSpliter();//移除分界边框。

    //在线用户列表
    var userConverter = new dhtmxGridDataConverter({
        idColumnName:"userId",
        filterColumns:["userNamecn","userMobile","userEmail","zoneName","deptName","stationName","loginTime","lastVisitedMenu"],
//            cellDataFormat:function(rowIndex,columnIndex,columnName,cellValue,rowData){
//                if(columnName=="lastVisitedMenu"){
//                    return cellValue["menuName"];
//                }
//                return this._super.cellDataFormat(rowIndex,columnIndex,columnName,cellValue,rowData);
//            },
        isFormatColumn:false
    });
    var onlineGrid = new Grid(userLayout.cells("a").attachGrid(),{
        headNames:"姓名,手机,邮箱,地域,部门,岗位,登入时间,最后访问菜单",
        widthsP:"10,10,15,10,10,10,12,23",
        pageSize:0
    });
    onlineGrid.genApi.setColumnCfg(6,{type:"ro",sort:"str",tip:true});
    onlineGrid.genApi.setColumnCfg(7,{type:"ro",tip:true});
    onlineGrid.genApi.setColumnCfg(2,{sort:"str"});
    var actionurl = Tools.dwr({
        dwrMethod:UserAction.getOnlineUsers,
        param:getSystemId(),
        converter:userConverter
    });
    onlineGrid.loadData(actionurl);
};

dhx.ready(initOnlineUser);