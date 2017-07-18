<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王晶
 * @description 
 * @date 2012-7-24
--%>
<%@ page contentType="text/log;charset=UTF-8" language="java" isELIgnored="false" %>
<%@ page import="com.ery.meta.module.log.serverlog.ServerLogService"%>
<%@ page import="java.io.BufferedReader"%>

   <%
	response.setHeader("Content-Disposition", "attachment; filename=\"log.log\"");
	response.setContentType("application/x-download");
	String fileName = request.getParameter("fileName");
	BufferedReader reader = new ServerLogService().readLogFileInfo(fileName);
	try{
		 while(reader.readLine()!= null){
			   String temp = new String(reader.readLine().getBytes(),"UTF-8");
			   out.println(temp+"<br>");  
		 }
		 out.flush();
	}catch(Exception ex){
		
	}finally { 
         reader.close();
	}
    %>
