<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<script type="text/javascript">
//    alert("您尚未登录或者会话已经超时，系统为您跳转到登录页面！");
    window.top.location.href='<%=request.getContextPath()+"/"%>';
</script>
