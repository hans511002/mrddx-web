<%@ page import="com.ery.base.support.log4j.LogUtils" %>
<%@ page import="com.ery.meta.common.ServerDetector" %>
<%@ page import="java.io.*" %>
<%@ page import="com.ery.base.support.utils.Convert" %>
<%@page import="com.ery.meta.module.hBaseQuery.HBTableAction"%>

<%
    OutputStream ops = null;
    InputStream is = null;
    response.reset();
    try {
        long tableId = Convert.toLong(request.getParameter("tableId"));
        String tableName = Convert.toString(request.getParameter("tableName"));
        long dataSourceId = Convert.toLong(request.getParameter("dataSourceId"));
        HBTableAction hbTableAction = new HBTableAction();
       // String path = request.getContextPath();
      	//DataSourceDao dataSourceDao=new DataSourceDao();
        //
        //File xmlFile = dataSourceAction.getFile(path,HBDateID);
        byte[] bytes = hbTableAction.downloadCreateTable(tableId,tableName,dataSourceId);
        ByteArrayInputStream isc=new ByteArrayInputStream(bytes);
        ops = new BufferedOutputStream(response.getOutputStream());
        String filename = tableName+".txt";
        response.setHeader("Content-disposition", "attachment; filename="+filename);
        response.setContentLength((int) bytes.length);
        //response.setHeader("Content-Type", "application/force-download");
       	//response.reset();
        response.setContentType("application/plain;charset=gb2312");
      	//is = new FileInputStream(xmlFile);
        int size = 1024;
        byte[] buffer = new byte[size];
        int len;
        while ((len = isc.read(buffer)) != -1) {
            ops.write(buffer, 0, len);
        }
        if (!ServerDetector.isWebLogic()) {
            out.clear();
            out = pageContext.pushBody();
        }
        ops.flush();
        ops.close();
        is.close();
    } catch (Exception e) {
        LogUtils.error(null, e);
        ops.close();
        is.close();
    }
%>
