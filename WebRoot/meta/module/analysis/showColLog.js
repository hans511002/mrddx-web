/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        showColLog.js
 *Description：
 *
 *Dependent：
 *
 *Author:	王鹏坤
 *        
 ********************************************************/
var dataTable = null;//表格

//初始界面
function pageInit() {
    var termReq = TermReqFactory.createTermReq(1);
    
    dataTableInit(); //初始数据表格  初始之后dataTable才会被实例化
    dataTable.setReFreshCall(queryData); //设置表格刷新的回调方法，即实际查询数据的方法
    
    dhx.showProgress("请求数据中");
    termReq.init(function(termVals){
        
        dataTable.refreshData();
        dhx.closeProgress();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据

}


//初始数据表格
function dataTableInit(){
    dataTable = new meta.ui.DataTable("dataDiv");//第二个参数表示是否是表格树
    dataTable.setColumns({
    	ID:"任务ID",
        START_TIME:"开始时间",    	
        END_TIME:"结束时间",
        FILE_SIZE:"文件大小(M)",
        STATUS:"状态",
    	INPUT_FILE_NAME :"输入文件名",
    	OUTPUT_FILE_NAME :"输出文件名",
    	INPUT_PATH:"输入路径",
    	OUTPUT_PATH:"输出路径",
    	IS_OUTPUT_RENAME:"是否输出重命名",
		OUTPUT_RENAME:"输出文件重命名",
		OUTPUT_RENAME_STATUS:"输出重命名状态",
		IS_MOVE_OUTPUT:"是否移动出处文件",
		MOVE_OUTPUT_PATH:"输出文件移动路径",
		MOVE_OUTPUT_STATUS:"输出文件移动状态",
		IS_DOINPUTFILETYPE:"是否处理输入文件",
		DELETE_INPUT_STATUS:"删除输入文件状态",
		MOVE_INPUT_PATH:"移动输入文件路径",
		MOVE_INPUT_STATUS:"移动输入文件状态",
		INPUT_RENAME:"输入文件重命名",
		INPUT_RENAME_STATUS:"重命名输入文件状态"
    },"ID,START_TIME,END_TIME,FILE_SIZE,STATUS,INPUT_FILE_NAME,OUTPUT_FILE_NAME,"+
"INPUT_PATH,OUTPUT_PATH,IS_OUTPUT_RENAME,OUTPUT_RENAME,OUTPUT_RENAME_STATUS,IS_MOVE_OUTPUT,"+
"MOVE_OUTPUT_PATH,MOVE_OUTPUT_STATUS,IS_DOINPUTFILETYPE,DELETE_INPUT_STATUS,MOVE_INPUT_PATH,"+
"MOVE_INPUT_STATUS,INPUT_RENAME,INPUT_RENAME_STATUS");
    dataTable.setPaging(true,20);//分页
	dataTable.setSorting(false);//无排序
    dataTable.render();//绘制函数，一些set方法必须在绘制函数之前，绘制函数之后内置的源生dhtmlxGrid对象被初始
    dataTable.grid.setInitWidthsP("5,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10");
    dataTable.setGridColumnCfg(0,{align:"left"});
    dataTable.setGridColumnCfg(1,{align:"center"});
    dataTable.setGridColumnCfg(2,{align:"center"});
    dataTable.setGridColumnCfg(3,{align:"center"});
    dataTable.setGridColumnCfg(4,{align:"center"});
    dataTable.setGridColumnCfg(5,{align:"center"});
    dataTable.setGridColumnCfg(6,{align:"center"});
    dataTable.setGridColumnCfg(7,{align:"center"});
    dataTable.setGridColumnCfg(8,{align:"center"});
    dataTable.setGridColumnCfg(9,{align:"center"});
    dataTable.setGridColumnCfg(10,{align:"center"});
    dataTable.setGridColumnCfg(11,{align:"center"});
    dataTable.setGridColumnCfg(12,{align:"center"});
    dataTable.setGridColumnCfg(13,{align:"center"});
    dataTable.setGridColumnCfg(14,{align:"center"});
    dataTable.setGridColumnCfg(15,{align:"center"});
    dataTable.setGridColumnCfg(16,{align:"center"});
    dataTable.setGridColumnCfg(17,{align:"center"});
    dataTable.setGridColumnCfg(18,{align:"center"});
    dataTable.setGridColumnCfg(19,{align:"center"});
    dataTable.setGridColumnCfg(20,{align:"center"});
    dataTable.setGridColumnCfg(21,{align:"center"});

    dataTable.setFormatCellCall(function(rid,cid,data,colId){
    	if(colId == "FILE_SIZE"){
    		return kbToM(data[cid]);
    	}
    	if(colId=="STATUS"){
        	if( dataTable.getUserData(rid,"STATUS")==0){
				return "初始化";
			}
			if( dataTable.getUserData(rid,"STATUS")==1){
				return "成功";
			}
			if( dataTable.getUserData(rid,"STATUS")==2){
				return "失败";
			}
			return "";
        }
        if(colId=="IS_OUTPUT_RENAME"){
        	if( dataTable.getUserData(rid,"IS_OUTPUT_RENAME")==0){
				return "不需要重命名输出文件";
			}
			if( dataTable.getUserData(rid,"IS_OUTPUT_RENAME")==1){
				return "需要重命名输出文件";
			}
			return "";
        }
        if(colId=="OUTPUT_RENAME_STATUS"){
        	if( dataTable.getUserData(rid,"OUTPUT_RENAME_STATUS")==0){
				return "成功重命名输出文件";
			}
			if( dataTable.getUserData(rid,"OUTPUT_RENAME_STATUS")==1){
				return "失败重命名输出文件";
			}
			return "";
        }
        if(colId=="IS_MOVE_OUTPUT"){
        	if( dataTable.getUserData(rid,"IS_MOVE_OUTPUT")==0){
				return "不需要移动";
			}
			if( dataTable.getUserData(rid,"IS_MOVE_OUTPUT")==1){
				return "需要移动";
			}
			return "";
        }
        if(colId=="MOVE_OUTPUT_STATUS"){
        	if( dataTable.getUserData(rid,"MOVE_OUTPUT_STATUS")==0){
				return "成功移动输出文件";
			}
			if( dataTable.getUserData(rid,"MOVE_OUTPUT_STATUS")==1){
				return "失败移动输出文件";
			}
			return "";
        }
        if(colId=="IS_DOINPUTFILETYPE"){
        	if( dataTable.getUserData(rid,"IS_DOINPUTFILETYPE")==0){
				return "不处理";
			}
			if( dataTable.getUserData(rid,"IS_DOINPUTFILETYPE")==1){
				return "删除源文件";
			}
			if( dataTable.getUserData(rid,"IS_DOINPUTFILETYPE")==2){
				return "移动源文件到目标目录";
			}
			if( dataTable.getUserData(rid,"IS_DOINPUTFILETYPE")==3){
				return "移动源文件并重命名";
			}
			if( dataTable.getUserData(rid,"IS_DOINPUTFILETYPE")==4){
				return "重命名";
			}
			return "";
        }
        if(colId=="DELETE_INPUT_STATUS"){
        	if( dataTable.getUserData(rid,"DELETE_INPUT_STATUS")==0){
				return "成功删除输入文件";
			}
			if( dataTable.getUserData(rid,"DELETE_INPUT_STATUS")==1){
				return "失败删除输入文件";
			}
			return "";
        }
        if(colId=="MOVE_INPUT_STATUS"){
        	if( dataTable.getUserData(rid,"MOVE_INPUT_STATUS")==0){
				return "成功移动输入文件";
			}
			if( dataTable.getUserData(rid,"MOVE_INPUT_STATUS")==1){
				return "失败移动输入文件";
			}
			return "";
        }
        if(colId=="INPUT_RENAME_STATUS"){
        	if( dataTable.getUserData(rid,"INPUT_RENAME_STATUS")==0){
				return "成功重命名源文件";
			}
			if( dataTable.getUserData(rid,"INPUT_RENAME_STATUS")==1){
				return "失败重命名源文件";
			}
			return "";
        }
        return data[cid];
    });

    return dataTable;
}

//查询数据
function queryData(dt,params){
    var termVals = TermReqFactory.getTermReq(1).getKeyValue();
    termVals.LOG_ID = logId;
    dhx.showProgress("请求数据中");
    AnalysisAction.queryColMsgLog(termVals,{posStart:params.page.rowStart,count:params.page.pageSize},function(data){
        dhx.closeProgress();
        var total = 0;
        if(data && data[0])
            total = data[0]["TOTAL_COUNT_"];
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}

//查看错误日志
function showFailLog(rid){
	var title = "查看日志详情";
    var logId = dataTable.getUserData(rid,"LOG_ID");;
    var logMsg = dataTable.getUserData(rid,"LOG_MSG");;

    document.getElementById("logId").innerHTML = logId;
    document.getElementById("logMsg").value = logMsg;

    if(!maintainWin){
        maintainWin = DHTMLXFactory.createWindow("1","maintainWin",0,0,610,290);
        maintainWin.stick();
        maintainWin.denyResize();
        maintainWin.denyPark();
        maintainWin.button("minmax1").hide();
        maintainWin.button("park").hide();
        maintainWin.button("stick").hide();
        maintainWin.button("sticked").hide();
        maintainWin.center();

        var logFormDIV = document.getElementById("logFormDIV");
        maintainWin.attachObject(logFormDIV);
        var calBtn = document.getElementById("calBtn");
        attachObjEvent(calBtn,"onclick",function(){maintainWin.close();});
        maintainWin.attachEvent("onClose",function(){
            maintainWin.setModal(false);
            this.hide();
            return false;
        });

    }
    maintainWin.setText(title);
    maintainWin.setModal(true);
    maintainWin.show();
    maintainWin.center();
	
}

//将字节换算成M
function kbToM(kbNum){
	return Number(kbNum/1024/1024).toFixed(2);
}

dhx.ready(pageInit);
