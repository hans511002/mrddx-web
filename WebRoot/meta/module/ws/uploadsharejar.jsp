<%--
 * Copyrights @ 2011,Tianyuan DIC Information Co.,Ltd. All rights reserved.<br>
 * @author 王晶
 * @description 
 * @date 2012-7-23
--%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
<%@include file="../../public/header.jsp" %>
<script type="text/javascript" src="<%=rootPath%>/dwr/interface/MetaShareJarAction.js"></script>
    <style type="text/css">
        html{
            width:100%;
            height:100%;
        }
        *{ margin:0; padding:0; font-size:12px;}
     .tb{ border:1px solid #d0e4fd; border-bottom:none; margin:0 auto; width:300px;}
	.rb_td{ border-bottom:1px solid #d0e4fd;border-right:1px solid #d0e4fd; background:#e7f5fe; text-align:right; padding-right:0; height:25px; width:25% ;line-height:25px;}
	.b_td{ border-bottom:1px solid #d0e4fd;text-align:left; padding-left:5px; height:25px; line-height:25px;}
    </style>
<html> 
<body style='width:100%;height:100%;background: #ffffff;'>
 <div id ="jarInfo" style=" width:582px;height:300px;overflow-y:auto;">
   <form enctype="multipart/form-data" action='<%=rootPath %>/upload?fileUploadCalss=com.ery.meta.ws.mag.MetaShareJarAction&jarId=<%=request.getParameter("jarId")%>' id="_uploadForm" method="post">
    <table id='jarInfoTable' style="width:100%;" class='tb' border="0" cellpadding="0" cellspacing="0">
      <tr >
         <td class="rb_td">请选择文件：</td>
         <td class="b_td"><div>
            <input style="width:200px;height:20px; border: 1px solid #88afe8;margin-top:10px;" class="dhxlist_txt_textarea"  name="fileName" id="_fileName" type="file"/>
            <span id ='msgSpan' style="color: red;display:none">提示:如果不修改jar包不要上传文件</span>
         </div></td>
       </tr>
       <tr>
         <td class="rb_td">文件名：</td>
         <td class="b_td"><div>
          <input type="text" style="width:200px;height:15px;" id="jarFileName" name="jarFileName"/>
         </div></td>
       </tr>
       <tr id="_cuser">
         <td class="rb_td">创建人：</td>
         <td class="b_td"><div id="creater"> 
         </div></td>
       </tr>
       <tr id="_cuset">
         <td class="rb_td">创建时间：</td>
         <td class="b_td"><div id="creTime">
         </div></td>
       </tr>
       <tr>
         <td class="rb_td">备注：</td>
         <td class="b_td"><div>
           <textarea id="mark" name="mark" rows="3" cols="20" style="width:200px;"></textarea>
         </div></td>
       </tr>
    </table>
      <div id="btn" style="width: 100%; margin-top:10px;margin-left:180px;">
        <input type="submit" name="sub" value="确定" class="btn_2"/>
        <input type="button" name="reset" value="重置" class="btn_2" onclick='resetFun();return false'/>
      </div>
     </form>
 </div>
</body>
 <script type="text/javascript">
  var addOrUpdate = <%=request.getParameter("addOrUpdate")%>;
  var jarId = <%=request.getParameter("jarId")%>;
  var fileName ="";
  var creater = "";
  var creTime = "";
  var mark ="";
  if(addOrUpdate==1){
	  $("_cuser").style.display="none";
	  $("_cuset").style.display="none";
	  $("msgSpan").style.display="none";
  }
  if(addOrUpdate==2){
	  MetaShareJarAction.queryJarInfoById(jarId,function(data){
		  $("jarFileName").value=data[0].JAR_FILE_NAME;
		  fileName = data[0].JAR_FILE_NAME;
		  if($("mark").value=data[0].REMARK!=null){
		   $("mark").value=data[0].REMARK;
		   mark = data[0].REMARK;
		 }else{
			 $("mark").value="";
		 }
		  $("creater").innerHTML=data[0].USER_NAMECN;
		  creater = data[0].USER_NAMECN;
	      $("creTime").innerHTML=data[0].UPLOAD_DATE;
	      creTime = data[0].UPLOAD_DATE;
	  })
  }
  function resetFun(){
	if(addOrUpdate==1){
		$("_fileName").value="";
		$("jarFileName").value="";
		$("mark").value="";
	}
	if(addOrUpdate==2){
	    $("_fileName").value="";
	    $("jarFileName").value=fileName;
	   $("creater").innerHTML=creater;
	   $("creTime").innerHTML=creTime;
	   if(mark!=null){
	    $("mark").value=mark;
	   }else{
		 $("mark").value="";
	   }
	}
}
</script>
</html>