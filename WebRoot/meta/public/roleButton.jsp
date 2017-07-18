<%@ page import="java.util.Collection" %>
<%@ page import="java.util.Set" %>
<%--
此JSP用于生成权限管理的JS，根据一个MENUID管理当前菜单的按钮权限，对当前已经配置排除的按钮进行隐藏
--%>
<%!
    /**
     * 生成一个动态生成CSS的函数。改函数用于隐藏按钮。
     * @param execluts
     */
    private String  buildCssFun(Collection<String> excludes){
        StringBuffer cssFun=new StringBuffer();
        cssFun.append("var buildHideCss=function(){");
        if(excludes.size()!=0){
            String cssStr="";
            cssFun.append("if(document.all){");
            cssFun.append("var sheet = document.createStyleSheet(); ");
            for(String exclude:excludes){
                cssStr+="."+exclude+"{display:none;}";
                cssFun.append("sheet.addRule(\"."+exclude+"\",'display:none');");
            }
            cssFun.append("}else{var style = document.createElement('style');" +
                          " style.type = 'text/css';" +
                          " style.innerHTML=\""+cssStr+"\";" +
                          " document.getElementsByTagName('HEAD').item(0).appendChild(style);}") ;
        }
        cssFun.append("};");
        //立马执行
        cssFun.append("buildHideCss();");
        return cssFun.toString();
    }

    /**
     * 生成一个隐藏指定名称或者ID的按钮。
     * @param execluts
     * @return
     */
    private String buildHideIdOrNameFun(Collection<String> execluts){
        StringBuffer fun=new StringBuffer("var roleFilter=function(){");
        if(execluts!=null&&execluts.size()>0){
            for(String exclude:execluts){
                fun.append(" document.getElementById(\""+exclude+"\")&&(document.getElementById(\"" + exclude +
                           "\").style.display=\"none\");" +
                           "        var buttons=document.getElementsByName(\""+exclude+"\");" +
                           "        if(buttons&&buttons.length>0){" +
                           "            for(var i=0;i<buttons.length;i++){" +
                           "                buttons[i].style.display=\"none\";}}");
            }
            fun.append("};");
        }
        else{
            fun.append("};");
        }
        //window onLoad执行此函数
        fun.append(" if(window.addEventListener){" +
                   "        window.addEventListener('load',roleFilter , false);" +
                   "    } else if(window.attachEvent){" +
                   "        window.attachEvent(\"onload\" ,roleFilter );" + "    } else{" +
                   "        window.onload=roleFilter;}");
        return fun.toString();
    }
%>
<%
    Set<String> excludes=(Set<String>)request.getAttribute("excludes");
    //写入隐藏CSS函数
    out.write(buildCssFun(excludes));
    //写入隐藏指定名称和按钮的函数
    out.write(buildHideIdOrNameFun(excludes));
%>
