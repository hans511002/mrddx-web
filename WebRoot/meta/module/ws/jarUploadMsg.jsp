<%@ page contentType="text/html;charset=UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
  <script type="text/javascript">
  </script>
  <style type="text/css">
  </style>
</head>
<body style="background: #ffffff;">
  <%
      String msg=(String)request.getAttribute("errorMsg");
   %> <div id="showMsg" style="padding-left: 15px"><%=msg%>
   </div>
   
</body>
</html>
