var formdata;

function pageInit() {
    var termReq = TermReqFactory.createTermReq(1);

    LogAnalysisAction.getLogAnalysisConfig(function(data){
    	formdata = data;
		for(var i = 0;i<data.length;i++){
            var row = document.createElement("tr");
			var name= document.createElement("th");
			name.innerHTML=data[i].NAME+":";
			row.appendChild(name);
			var showflag= document.createElement("td");
			row.appendChild(showflag);
			if(data[i].SHOWFLAG==1){
				showflag.innerHTML="<input style='text-align: center' id=SHOWFLAG"+data[i].LA_ID+" type=\"checkbox\" checked=\"checked\"/>";
			}else{
				showflag.innerHTML="<input style='text-align: center' id=SHOWFLAG"+data[i].LA_ID+" type=\"checkbox\"/>";
			}
			var minscale= document.createElement("td");
			row.appendChild(minscale);
			minscale.innerHTML="<input id=MINSCALE"+data[i].LA_ID+" type=\"text\" value=\""+data[i].MINSCALE+"\"/>";
			
			var maxscale= document.createElement("td");
			row.appendChild(maxscale);
			maxscale.innerHTML="<input id=MAXSCALE"+data[i].LA_ID+" type=\"text\" value=\""+data[i].MAXSCALE+"\"/>";
			
			var memo= document.createElement("td");
			row.appendChild(memo);
			memo.innerHTML=data[i].MEMO;
			
            $("laform").tBodies[0].appendChild(row);
		}
        document.getElementById("MONTHNUM").value=data[0].MONTHNUM;
        document.getElementById("DAYNUM").value=data[0].DAYNUM;
    });
    
    var saveBtn = document.getElementById("saveBtn");
    attachObjEvent(saveBtn,"onclick",function(){
       var reg = new RegExp("^[0-9]*$");
    	var subdata = [];
    	for(var i = 0;i<formdata.length;i++){
    		var ladata={};
    		ladata.LA_ID=formdata[i].LA_ID
    		ladata.SHOWFLAG= document.getElementById("SHOWFLAG"+formdata[i].LA_ID).checked?"1":"0";
    		ladata.MINSCALE= document.getElementById("MINSCALE"+formdata[i].LA_ID).value;
			if(ladata.SHOWFLAG=="0"&&ladata.MINSCALE==''){
				ladata.MINSCALE=0;
			}else
			if(ladata.MINSCALE==''||!reg.test(ladata.MINSCALE)){
				dhx.alert("警戒最小值必须为数字。");
				return;
			}
    		ladata.MAXSCALE= document.getElementById("MAXSCALE"+formdata[i].LA_ID).value;
			if(ladata.SHOWFLAG=="0"&&ladata.MAXSCALE==''){
				ladata.MAXSCALE=0;
			}else
			if(ladata.MAXSCALE==''||!reg.test(ladata.MAXSCALE)){
				dhx.alert("警戒最大值必须为数字。");
				return;
			}
    		ladata.MONTHNUM= document.getElementById("MONTHNUM").value;
    		ladata.DAYNUM= document.getElementById("DAYNUM").value;
    		subdata.push(ladata);
    	}
		var MONTHNUM = document.getElementById("MONTHNUM").value;
		if(MONTHNUM==''||!reg.test(MONTHNUM)){
			dhx.alert("按月统计慢查询必须为数字。");
			return;
		}
		var DAYNUM = document.getElementById("DAYNUM").value;
		if(DAYNUM==''||!reg.test(DAYNUM)){
			dhx.alert("按日统计慢查询必须为数字");
			return;
		}
		LogAnalysisAction.saveLogAnalysisConfig(subdata,function(data){
			dhx.alert("保存成功");
		});
    });

}

dhx.ready(pageInit);
