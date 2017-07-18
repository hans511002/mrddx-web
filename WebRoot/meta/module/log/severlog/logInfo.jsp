<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王晶
 * @description 
 * @date 2012-7-24
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<%@ page import="com.ery.meta.module.log.serverlog.ServerLogService"%>
<%@ page import= "java.io.BufferedReader"%>
<%@ page import="java.io.FileInputStream" %>
<%@page import="com.ery.base.support.log4j.LogUtils"%>
<%
String fileName = request.getParameter("fileName");
int flag = Integer.valueOf(request.getParameter("flag").toString());
response.setCharacterEncoding("utf-8");
if(flag==1){
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <style type="text/css">
       
    </style>
    
</head>
<body style="background: #ffffff;"> 
<%}else if(flag==2){
	    response.setHeader("Content-Disposition", "attachment; filename=\""+fileName+"\"");
	    response.setContentType("application/x-download");
  }
   BufferedReader reader = new ServerLogService().readLogFileInfo(fileName);
	try{
		 if(flag==1){
			 out.println("<div style='width:100%;height:100%;'>"); 
		 }
		 
		 int count=0;
		 
		 while(reader.readLine()!= null){
			   String temp = reader.readLine();
			   if(flag==1){
				   out.print(new String(temp.getBytes(),"UTF-8"));
				   out.println("<br>");
			   }else{
				   out.println(new String(temp.getBytes(),"UTF-8"));
			   }
			   count++;
			   
			   if(count%100==0){
				   out.flush();
			   }
		 }
		 if(flag==1){
			 out.println("</div>");
		 }
		 out.flush();
	}catch(Throwable t){
		LogUtils.error("",t);
	}finally { 
        reader.close();
          
	}
    %>
<%
if(flag==1){
%>
</body>
</html>
<%} %>