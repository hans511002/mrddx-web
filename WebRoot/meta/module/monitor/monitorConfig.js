
//初始界面
function pageInit() {
    var termReq = TermReqFactory.createTermReq(1);
    
    dhtmlxValidation.addValidation($("_ConfigParamForm"), [
        {target:"REPEATINTERVAL",rule:"Range[10,1800]"},
        {target:"WEBINTERVAL",rule:"Range[10,1800]"}
    ])
    
    MonitorAction.getMonitorConfig(function(data){
    	document.getElementById("REPEATINTERVAL").value=data.REPEATINTERVAL/1000;
    	document.getElementById("WEBINTERVAL").value=data.WEBINTERVAL/1000;
    	document.getElementById("ISAUTOREFRESH").value=data.ISAUTOREFRESH;
    	document.getElementById("ISMANUREFRESH").value=data.ISMANUREFRESH;
    	document.getElementById("HADOOPJOBURL").value=data.HADOOPJOBURL==null?"":data.HADOOPJOBURL;
    	document.getElementById("HADOOPVERSION").value=data.HADOOPVERSION==null?"":data.HADOOPVERSION;
    });
    
    var queryBtn = document.getElementById("queryBtn");
    attachObjEvent(queryBtn,"onclick",function(){
    	if(dhtmlxValidation.validate("_ConfigParamForm")){
    		var text = /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3}$/;
	    	var submitdata={};
	    	submitdata.REPEATINTERVAL = document.getElementById("REPEATINTERVAL").value;
	    	submitdata.WEBINTERVAL = document.getElementById("WEBINTERVAL").value;
	    	submitdata.ISAUTOREFRESH = document.getElementById("ISAUTOREFRESH").value;
	    	submitdata.ISMANUREFRESH = document.getElementById("ISMANUREFRESH").value;
	    	submitdata.HADOOPJOBURL = document.getElementById("HADOOPJOBURL").value;
	    	if(submitdata.HADOOPJOBURL!=""){
		    	if(!text.test(submitdata.HADOOPJOBURL.split(":")[0])){
		    		alert("请输入正确的地址，例如：133.37.135.211:50030/jobtracker.jsp");
		    		return null;
		    	}
	    	}
	    	submitdata.HADOOPVERSION = document.getElementById("HADOOPVERSION").value;
		    MonitorAction.setMonitorConfig(submitdata,function(data){
		        alert("设置成功");
		    });
	    }
    });

}

dhx.ready(pageInit);
