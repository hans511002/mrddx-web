/******************************************************
 *Copyrights @ 2011，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        myinfo.js
 *Description：
 *       个人资料完善JS
 *Dependent：
 *       dhtmlx.js，dwr 有关JS，dhtmxExtend.js。。。
 *Author: wangcs
 *
 *Finished：
 *       2012-03-12
 *Modified By：
 *
 *Modified Date:
 *
 *Modified Reasons:

 ********************************************************/

dhtmlx.image_path = getDefaultImagePath();
dhtmlx.skin = getSkin();
var user= getSessionAttribute("user");
var initMyinfo = function(){
    var userLayout = new dhtmlXLayoutObject(document.body,"1C");
    userLayout.cells("a").setText(meta_menu_local_info.USERIF);
    userLayout.hideConcentrate();
    userLayout.hideSpliter();//移除分界边框。

    var userform = userLayout.cells("a").attachObject($("_userForm"));

    //绑定原用户值
    initMyInfoForm();

    //对表单添加验证
    dhtmlxValidation.addValidation($("_userForm"), [
        {target:"_userNamecn",rule:"NotEmpty,MaxLength[64]"},
        {target:"_userEmail",rule:"NotEmpty,ValidEmail"},
        {target:"_userNameen",rule:"English"},
        {target:"_userMobile",rule:"Mobile"}
    ],"true");
};

var initMyInfoForm = function(){
    $("_userId").value = user.userId;
    $("_userNamecn").value = user.userNamecn || "";
    $("_userNameen").value = user.userNameen || "";
    $("_userEmail").value = user.userEmail || "";
    $("_userMobile").value = user.userMobile || "";
    $("_zoneId").value = user.zoneId;
    $("_deptId").value = user.deptId;
    $("_stationId").value = user.stationId;
    $("_headShip").value = user.headShip || "";
//    $("_oaUserName").value = user.oaUserName || "";
//    $("_groupId").value = user.groupId;
    $("_vipFlag").value = user.vipFlag;

    ZoneAction.queryZoneInfo(user.zoneId,function(data){
        Tools.addOption("_zoneIdSel",[{value:data.ZONE_ID,text:data.ZONE_NAME}]);
    });
    DeptAction.queryDeptInfo(user.deptId,function(data){
        Tools.addOption("_deptIdSel",[{value:data.DEPT_ID,text:data.DEPT_NAME}]);
    });
    StationAction.queryStationInfo(user.stationId,function(data){
        Tools.addOption("_stationIdSel",[{value:data.STATION_ID,text:data.STATION_NAME}]);
    });
};

/**
 * 提交数据验证
 */
var validate = function(){
    //提交数据前进行数据验证。
    var validateRes=true;
    validateRes=validateRes&&dhtmlxValidation.validate("_userForm");
    return validateRes;
};

var submitValidate = function(){
    if(validate()){
        dhx.showProgress(meta_menu_local_info.USERIF_P_T,meta_menu_local_info.USERIF_P_C);
        UserAction.modifyUser(dwr.util.getFormValues("_userForm"),function(data){
            dhx.closeProgress();
            if(data.type=="error"||data.type=="invalid"){
                dhx.alert(meta_menu_local_info.USERIF_ERROR1);
            }else if(data.sid==-1){
                dhx.alert(meta_menu_local_info.USERIF_ERROR2);
            }else if(data.sid==-2){
                dhx.alert(meta_menu_local_info.USERIF_ERROR3);
            }else if(data.sid==-3){
                dhx.alert(meta_menu_local_info.USERIF_ERROR4);
            }else{
                user = getSessionAttribute("user",true);
                dhx.alert(meta_menu_local_info.USERIF_SUCCESS);
            }
        });
    }
    return false;
};

dhx.ready(initMyinfo);