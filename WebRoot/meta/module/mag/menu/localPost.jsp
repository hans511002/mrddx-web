<%@ page import="org.apache.commons.fileupload.DiskFileUpload" %>
<%@ page import="java.util.List" %>
<%@ page import="org.apache.commons.fileupload.FileItem" %>
<%@ page import="java.io.File" %>
<%@ page import="com.ery.base.support.log4j.LogUtils" %>
<%@ page import="org.apache.commons.io.FileUtils" %>
<%@ page import="com.ery.meta.common.Common" %>
<%@ page import="org.apache.commons.io.output.DeferredFileOutputStream" %>
<%@ page contentType="text/html;charset=UTF-8"%>
<%
    DiskFileUpload fu = new DiskFileUpload();
    String rootPath=application.getRealPath("/");
    String imagePath=   "meta/public/local";
    out.write("<script>var fileNames=[]</script>");
    String menuId = request.getParameter("menuId")==null? "":request.getParameter("menuId").trim();
    try {
        List fileItems = fu.parseRequest(request);
        String tmpName = "";
        for(int i = 0; i < fileItems.size(); i++){
            FileItem fi = (FileItem)fileItems.get(i);//取得文件
//            if(fi.getFieldName().equals("itemCode")){
//                DeferredFileOutputStream fileN = (DeferredFileOutputStream)fi.getOutputStream();
//                tmpName = new String(fileN.getData(), "utf8");
//            }
            if(fi.getName()==null||fi.getName().equals("")){
                continue;
            }else{
                FileItem fii = (FileItem)fileItems.get(i+1);//取得文件
                DeferredFileOutputStream fileN = (DeferredFileOutputStream)fii.getOutputStream();
                tmpName = menuId + "_" + new String(fileN.getData(), "utf8");
            }
            File dir=new File(rootPath,imagePath);
            //获取文件后缀
            String fileName=fi.getName();
            if(fileName==null){
                fileName="";
            }
            String fileNameSuffix=fileName.substring(fileName.indexOf(".")>0?fileName.lastIndexOf("."):0,fileName.length());
//            Common.getMD5((System.currentTimeMillis() + fi.getName()).getBytes());
            fileName=tmpName+fileNameSuffix;
            FileUtils.forceMkdir(dir);
            fi.write(new File(dir,fileName));//保存
            out.write("<script> fileNames.push('"+imagePath+"/"+fileName+"')</script>");
        }
    } catch (Exception e) {
        LogUtils.error(null,e);
    }

%>
