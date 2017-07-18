<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<%@include file="../public/head.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<%
    boolean isLoginFirst = request.getParameter("isLoginFirst")==null?false:true;

%>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>修改密码</title>
    <script type="text/javascript" src="<%=rootPath%>/dwr/interface/UserAction.js"></script>
    <script type="text/javascript">
        var user=null;
        SessionManager.getAttribute("user",{async:false,callback:function(data){
            user=data;
        }});

        var dwrCaller =new biDwrCaller();
        /**
        * 远程校验转换器，保证用户新密码与原密码不相同的功能
        * 此转换器在服务器返回true和false的情况下使用。
        * @param invalidMessage 远程验证失败的提示信息。
        */
        var moteConverter=function(invalidMessage){
            dhx.extend(this,new baseConverter(),true);
            this.convert=function(data){
                data=this.onBeforeConverted(data)||data;
                if(data==false||data=="false"){
                    return true;
                }else{
                    return !invalidMessage?false:invalidMessage;
                }
            }
        }
        //远程确认原密码输入是否正确
        dwrCaller.addAutoAction("passwordConfirm","UserAction.passwordConfirm",user.userId);
        dwrCaller.isShowProcess("passwordConfirm",false);
        dwrCaller.addDataConverter("passwordConfirm",new remoteConverter("您输入的密码与原密码不符，请您再次输入！"));
        //远程确认密码是否与原密码相同
        dwrCaller.addAutoAction("newpassConfirm","UserAction.passwordConfirm",user.userId);
        dwrCaller.isShowProcess("newpassConfirm",false);
        dwrCaller.addDataConverter("newpassConfirm",new moteConverter("您输入的新密码与旧密码相同，请您重新输入！"));
        //修改密码Action
        dwrCaller.addAutoAction("updatePassword","UserAction.updatePassword",user.userId);

        var newPassCheck=function(value){
//            if(!/^(?![0-9a-z]+$)(?![0-9A-Z]+$)(?![0-9\W]+$)(?![a-z\W]+$)(?![a-zA-Z]+$)(?![A-Z\W]+$)[a-zA-Z0-9\W_]+$/.test(value)){
            if(!/([0-9]+[a-zA-Z]+)|([a-zA-Z]+[0-9]+)/.test(value)){

                return "您的密码必须包含数字和字母"
            }else{
                return true;
            }
        }
        dhx.ready(
                function(){
                    dhtmlxValidation.addValidation($("oldpwd"),"NotEmpty,Remote["+dwrCaller.passwordConfirm+"]");
                    dhtmlxValidation.addValidation($("passwd"),"NotEmpty,MinLength[8],MaxLength[20],Remote["+dwrCaller.newpassConfirm+"],ValidByCallBack[newPassCheck]") ;
                    dhtmlxValidation.addValidation($("againPass"),"NotEmpty,MinLength[8],MaxLength[20],EqualTo[passwd]") ;
                }
        );
        var changePass=function(){
            if(dhtmlxValidation.validate($("oldpwd"))
                       &&dhtmlxValidation.validate($("passwd"))
                    &&dhtmlxValidation.validate($("againPass")))
                dwrCaller.executeAction("updatePassword",$("passwd").value,function(data){
                    if(data.type=="error"||data.type=="invalid"){
                        dhx.alert("对不起，修改密码出错，请重试！");
                    }else{
                        dhx.alert("密码修改成功!");
                        $("oldpwd").value = "";
                        $("passwd").value = "";
                        $("againPass").value = "";
                        if(<%=isLoginFirst%>){
                            setTimeout(function(){
                                window.location.href="<%=request.getContextPath() %>/meta/module/index/index.jsp";
                            },2000);
                        }else{
                            setTimeout(function(){
                                try{
                                    window.parent.closeTab("修改密码");
                                }catch(e){}
                            },2000);
                        }
                    }
                })
        }

        Tools.addEvent(document,"keypress",function(evt){
                    if (evt.keyCode == 13){
                        changePass();
                    }
                }
        )
    </script>
    <style type="text/css">
        body {
            background-color: #ffffff;
            color: #333333;
            font-size: 12px;
            font-family: "宋体",arial,Times, serif;
            line-height: 24px;
            word-break: break-all;
            margin: 0;
            padding: 0;
            height: 100%;
        }
        td{font-size: 12px;
            font-family: "宋体",arial,Times, serif;
        }
        .xiugaimima-bg{
            background:url(../resource/images/xiugaimima-bg_1.gif) no-repeat top left;
            width:608px;
            height:490px;
            margin: 0 auto;
        }

    </style>

</head>
<body>
<table width="100%" border="0" cellspacing="0" cellpadding="0"
       align="center" class="xiugaimima-bg">
    <tr>
        <td align="center">
            <table width="100" border="0" align="center" cellpadding="0"
                   cellspacing="0">
                <tr>
                    <td background="../resource/images/xiugaimima-top-bg.gif">
                        <img src="../resource/images/xiugaimima-top.gif" width="476" height="25" />
                    </td>
                </tr>
                <tr>
                    <td background="../resource/images/xiugaimima-top-bg.gif">
                        <table width="60%" border="0" align="center" cellpadding="0"
                               cellspacing="5">
                            <tr>
                                <td align="right">
                                    旧密码：<span style="color:red" add="true">*</span>
                                </td>
                                <td align="left">
                                    <input style="width:150px" name="oldpwd" type="password" id="oldpwd" />
                                </td>
                            </tr>
                            <tr>
                                <td align="right">
                                    新密码：<span style="color:red" add="true">*</span>
                                </td>
                                <td align="left">
                                    <input  style="width:150px" name="passwd" type="password" id="passwd"  />
                                </td>
                            </tr>
                            <tr>
                                <td align="right">
                                    确认新密码：<span style="color:red" add="true">*</span>
                                </td>
                                <td align="left">
                                    <input  style="width:150px" name="againPass" id="againPass" type="password"/>
                                </td>
                            </tr>
                            <tr>
                                <td height="60" colspan="2" align="center">
                                    <a href="javascript:void(0)" style="color: #444;background: url('../resource/images/button_a_bg.gif') no-repeat top right;font-size: 12px;text-decoration: none;display: inline-block;zoom: 1;height: 24px;padding-right: 18px;cursor: pointer;outline: none;line-height: normal;" type="submit" onclick="changePass()" id="changePass">
                                           <span style="display: inline-block;background: url('../resource/images/button_span_bg.gif') no-repeat top left;padding: 4px 0px 4px 18px;line-height: 16px;height: 16px;">
                                           <span style="display: inline-block;height: 16px;line-height: 16px;
                                           padding: 0px;color: #444;font-size: 12px;cursor: pointer;">修改</span>
                                       </span>
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td>
                        <img src="../resource/images/xiugaimima-bom.gif" width="476" height="27" />
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
