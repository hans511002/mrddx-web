<%@ page import="org.apache.commons.fileupload.DiskFileUpload" %>
<%@ page import="java.util.List" %>
<%@ page import="org.apache.commons.fileupload.FileItem" %>
<%@ page import="java.io.File" %>
<%@ page import="com.ery.base.support.log4j.LogUtils" %>
<%@ page import="org.apache.commons.io.FileUtils" %>
<%@ page contentType="text/html;charset=UTF-8"%>
<%--作者:张伟--%>
<%--时间:2011-12-09--%>
<%--描述:--%>
<%
    DiskFileUpload fu = new DiskFileUpload();
    String rootPath=application.getRealPath("/");
    String imagePath=   "meta/public/upload/menuIcon";
    try {
        List fileItems = fu.parseRequest(request);
        FileItem fi = (FileItem)fileItems.get(0);//这里只是取得第一个文件
        File dir=new File(rootPath,imagePath);
        //获取文件后缀
        String fileName=fi.getName();
        if(fileName==null){
            fileName="";
        }
        String fileNameSuffix=fileName.substring(fileName.indexOf(".")>0?fileName.lastIndexOf("."):0,fileName.length());
        fileName=System.currentTimeMillis()+fileNameSuffix;
        FileUtils.forceMkdir(dir);
        fi.write(new File(dir,fileName));//保存
        out.write("<script>var fileName='"+imagePath+"/"+fileName+"'</script>");
    } catch (Exception e) {
        LogUtils.error(null,e);
    }

%>
