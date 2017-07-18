<%@ page language="java" pageEncoding="utf-8"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>My JSP 'jvm.jsp' starting page</title>

	<meta http-equiv="pragma" content="no-cache">
	<meta http-equiv="cache-control" content="no-cache">
	<meta http-equiv="expires" content="0">    
	<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
	<meta http-equiv="description" content="This is my page">
	<!--
	<link rel="stylesheet" type="text/css" href="styles.css">
	-->

  </head>
  
  <body>
  	<% 
	    out.println("java_vendor:" + System.getProperty("java.vendor")+"<br/>");   
	    out.println("java_vendor_url:"+ System.getProperty("java.vendor.url")+"<br/>");   
	    out.println("java_home:" + System.getProperty("java.home")+"<br/>");   
	    out.println("java_class_version:" + System.getProperty("java.class.version")+"<br/>");   
	    out.println("java_class_path:" + System.getProperty("java.class.path")+"<br/>");   
	    out.println("os_name:" + System.getProperty("os.name")+"<br/>");   
	    out.println("os_arch:" + System.getProperty("os.arch")+"<br/>");   
	    out.println("os_version:" + System.getProperty("os.version")+"<br/>");   
	    out.println("user_name:" + System.getProperty("user.name")+"<br/>");   
	    out.println("user_home:" + System.getProperty("user.home")+"<br/>");   
	    out.println("user_dir:" + System.getProperty("user.dir")+"<br/>");   
	    out.println("java_vm_specification_version:" + System.getProperty("java.vm.specification.version")+"<br/>");   
	    out.println("java_vm_specification_vendor:" + System.getProperty("java.vm.specification.vendor")+"<br/>");   
	    out.println("java_vm_specification_name:" + System.getProperty("java.vm.specification.name")+"<br/>");   
	    out.println("java_vm_version:" + System.getProperty("java.vm.version")+"<br/>");   
	    out.println("java_vm_vendor:" + System.getProperty("java.vm.vendor")+"<br/>");   
	    out.println("java_vm_name:" + System.getProperty("java.vm.name")+"<br/>");   
	    out.println("java_ext_dirs:" + System.getProperty("java.ext.dirs")+"<br/>");   
	    out.println("file_separator:" + System.getProperty("file.separator")+"<br/>");   
	    out.println("path_separator:" + System.getProperty("path.separator")+"<br/>");   
	    out.println("line_separator:" + System.getProperty("line.separator")+"<br/>");   
   %>
  </body>
</html>
