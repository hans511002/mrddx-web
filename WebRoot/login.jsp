<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
    <!-- 保证兼容IE9，改编IE的文档模式。相当于在IE8文档模式下运行 -->
    <meta http-equiv="X-UA-Compatible" content="IE=EmulateIE8">
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <title>登录 - 大数据平台管理系统</title>
    <%@include file="meta/public/head.jsp" %>
    <style type="text/css">
        body {
            width: 100%;
            height: 99%;
            font-family: Arial;
            margin: 0px;
            padding: 0px;
            overflow: auto;
            background-color: white;
        }

        .login-container {
            width: 100%;
            height: 100%;
            background-color: #CFE3EE;
        }

        .login-panel {
            height: 32%;
            margin: 0px;
            padding: 0px;
        }

        .login-form {
            width: 567px;
            height: 292px;
            background-image: url('<%=request.getContextPath()%>/meta/resource/images/login-panel.gif');
            margin: 0px;
            padding: 0px;
        }
    </style>
    <script type="text/javascript" src="dwr/interface/LoginAction.js"></script>
    <script type="text/javascript">
        var visitUrl = '<%=session.getAttribute(LoginConstant.LAST_VISIT_URL_KEY)%>';
        var date = new Date();
        if (!visitUrl) {
           visitUrl= "meta/module/index/index.jsp?" + date.getTime();
        }
        function onSubmit() {
            if (dwr.util.getValue("loginId") == '') {
                dhx.alert("请输入Email或者中文名！");
                return false;
            }
            if (dwr.util.getValue("password") == '') {
                dhx.alert("请输入密码！");
                return false;
            }
            if (dwr.util.getValue("validateCode") == "") {
                dhx.alert("请输入验证码！")
                return false;
            }
            if (dwr.util.getValue("loginId") != '' && dwr.util.getValue("password") != '' && dwr.util.getValue("validateCode") != "") {
                dhx.showProgress("登录", "正在提交登录数据，请您稍候...");
                var date = new Date();
                //提交动作，访问登录Action
                LoginAction.login(dwr.util.getFormValues("submitForm"), "meta", function (data) {
                    dhx.closeProgress();
                    switch (data) {
                        case "ERROR_GROUP_DISENBLE":
                        {
                            dhx.alert("用户所属系统状态失效，请联系管理员！");
                            changeCode();
                            break;
                        }
                        case "ERROR_DISABLED":
                        {
                            dhx.alert("该用户已被禁用，不能使用！");
                            changeCode();
                            break;
                        }
                        case "ERROR_LOCKING":
                        {
                            dhx.alert("该用户已被锁定，不能使用！");
                            changeCode();
                            break
                        }
                        case "ERROR_AUDITING":
                        {
                            dhx.alert("该用户正在被审核中，暂不能使用！");
                            changeCode();
                            break;
                        }
                        case "ERROR_USER_PASSWD":
                        {
                            dhx.alert("用户名或密码错误，请确认！");
                            changeCode();
                            break;
                        }
                        case "ERROR_NAME_REPEAT":
                        {
                            dhx.alert("您输入的中文名重复，请使用Email登录！");
                            changeCode();
                            break;
                        }
                        case "ERROR_VALIDATEOVERDUE":
                        {
                            dhx.alert("验证码已过期，请重新输入！");
                            changeCode();
                            break;
                        }
                        case "ERROR_VALIDATECODE":
                        {
                            dhx.alert("您输入的验证码错误，请重新输入！");
                            changeCode();
                            break;
                        }
                        case "USER_FIRST_LOGIN":
                        {
                            dhx.alert("感谢使用本系统，请先修改密码，谢谢！");
                            setTimeout(function () {
                                window.location.href = "<%=request.getContextPath() %>/meta/public/modifyPwd.jsp?isLoginFirst=true&" + date.getTime();
                            }, 2000);
                            break;
                        }
                        case "USER_FORCE_MODIFY_PASS":
                        {
                            dhx.alert("你已超过九十天未修改密码，请修改密码");
                            setTimeout(function () {
                                window.location.href = "<%=request.getContextPath() %>/meta/public/modifyPwd.jsp?isLoginFirst=true&" + date.getTime();
                            }, 2000);
                            break;
                        }
                        case "USER_TIP_MODIFY_PASS":
                        {
                            dhx.alert("你已超过八十天未修改密码");
                            setTimeout(function () {
                                window.location.href = "<%=request.getContextPath() %>/meta/module/index/index.jsp?" + date.getTime();
                            }, 2000);
                            break;
                        }
                        default:
                        {
                            window.location.href =visitUrl;
                        }
                    }
                    document.getElementById("loginId").focus();
                });
                return false;
            } else {
                return false;
            }
        }
        setTimeout(function () {
            document.getElementById("loginId").focus();
        }, 100);
        //        window.onload=document.getElementById("loginId").focus();

        //更换验证码图片
        function changeCode() {
            document.getElementById("validateCode").value = "";
            var _validateCodeImgId = document.getElementById("validateCodeImg");
            _validateCodeImgId.src = "./meta/public/verifyCode.jsp?randomCode=" + Math.random();
        }

    </script>
</head>

<body style="position: static;padding: 0px">

<div class="login-container" align="center">
    <div style="height:20%;position: relative;"></div>
    <form action="" class="login-form" onsubmit="return onSubmit();" id="submitForm">
        <div align="center" class="login-panel">
            <div style="width:100%;height: 124px;"></div>
            <div style="width: 398px;float: left;">
                <div style="width:100%;height: 10px;"></div>
                <div align="left" style="padding-left: 15px">
                    <label for="loginId">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;用户名：</label>
                    <input id="loginId" name="loginId" type="text" style="width: 155px;height: 22px;" checked="checked"
                           onblur="javascript:this.value=this.value.replace(/(^\s*)|(\s*$)/g, '');"/>
                </div>
                <div style="height: 10px"></div>
                <div align="left" style="padding-left: 15px">
                    <label for="password">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;密&nbsp;码：</label>
                    <input id="password" name="password" type="password" style="width: 155px;height: 22px;"
                           onpaste="return false"/>
                </div>
                <div style="height: 10px"></div>
                <div align="left" style="padding-left: 15px">
                    <label for="validateCode">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;验证码：</label>
                    <input id="validateCode" name="validateCode" type="text" style="width: 40px;height: 22px;"/>
                    <img title="点击改变验证码" id="validateCodeImg" src="./meta/public/verifyCode.jsp"
                         style="height: 25px;width: 50px;margin-bottom: -9px"/>
                    <a href="javascript:changeCode()">看不清，换一张</a>
                </div>
            </div>
            <div align="left" style="width: 168px;float: left;">
                <input type="image" src="<%=request.getContextPath()%>/meta/resource/images/login-btn.gif"/>
            </div>
        </div>
    </form>
    <div style="height:30%;"></div>
</div>
</body>
</html>
