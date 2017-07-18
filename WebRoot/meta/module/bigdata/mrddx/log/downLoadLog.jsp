<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
<%@ page import="com.ery.base.support.utils.Convert" %>
<%@ page import="com.ery.meta.module.bigdata.mrddx.log.JobLogAction" %>
<%@ page import="com.ery.base.support.sys.SystemVariable" %>
<%@ page import= "java.io.BufferedReader"%>
<%@ page import="java.io.FileInputStream" %>
<%@ page import="com.ery.base.support.log4j.LogUtils"%>
  <% 
		String logId = Convert.toString(request.getParameter("logId"));
		String date  = Convert.toString(request.getParameter("date"));
		String jobName = Convert.toString(request.getParameter("jobName"));
		String fileName = "mrddx_"+date+"_"+logId+".log";
		  
	  	 
	  	JobLogAction jobLogAction = new JobLogAction();
	  	response.setCharacterEncoding("UTF-8");
		response.setHeader("Content-Disposition", "attachment; filename=" + java.net.URLEncoder.encode(fileName, "UTF-8")); 
		response.setContentType("application/x-download");
		
		BufferedReader reader = jobLogAction.readLogFile(fileName);

		try{
	        StringBuffer sb= new StringBuffer("");
	        BufferedReader br = new BufferedReader(reader);
	        String str = null; 
	        while((str = br.readLine()) != null) {
	              sb.append(str);
	              out.println(str);
	              //System.out.println(str);
	        } 
	        br.close();
	        out.flush();
		}catch(Throwable t){
			LogUtils.error("",t);
		}finally { 
	        reader.close();
		}
   %>

