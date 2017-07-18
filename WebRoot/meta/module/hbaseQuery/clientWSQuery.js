/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        ListQueryAction.js
 *Description：
 *
 *Dependent：
 *
 *Author:	王建友
 *        
 ********************************************************/
var dataTable = null;//表格

//初始界面
function pageInit() {
    var termReq = TermReqFactory.createTermReq(1);
    var ruleId = termReq.createTermControl("ruleId","ruleId");
    ruleId.setWidth(120);
    ruleId.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    
    var termReq = TermReqFactory.createTermReq(1);
    var mdn = termReq.createTermControl("mdn","mdn");
    ruleId.setWidth(120);
    mdn.setInputEnterCall(function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
    
    var startdate = termReq.createTermControl("startDate","START_DATE");
    startdate.setWidth(120);
    startdate.setDateRule();

    startdate.render();
    startdate.myCalendar.setDateFormat("%Y-%m-%d");
    startdate.myCalendar.hideTime();
    
    var enddate = termReq.createTermControl("endDate","END_DATE");
    enddate.setWidth(120);
    enddate.setDateRule();
    enddate.render();
    enddate.myCalendar.setDateFormat("%Y-%m-%d");
    enddate.myCalendar.hideTime();
    
    var reset1Btn = document.getElementById("reset1");
    attachObjEvent(reset1Btn,"onclick",function(){
        termReq.getTermControl("START_DATE").clearValue(true);
        var now = new Date();
        if(document.getElementById("endDate").value)
            startdate.myCalendar.setSensitiveRange(null,document.getElementById("endDate").value);
        else
            startdate.myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
        enddate.myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
        termReq.getTermControl("START_DATE").inited = 1;
    });
    
    var reset2Btn = document.getElementById("reset2");
    attachObjEvent(reset2Btn,"onclick",function(){
        termReq.getTermControl("END_DATE").clearValue(true);
        var now = new Date();
        if(document.getElementById("startDate").value)
            enddate.myCalendar.setSensitiveRange(document.getElementById("startDate").value,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
        else
            enddate.myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
        startdate.myCalendar.setSensitiveRange(null,now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate());
        termReq.getTermControl("END_DATE").inited = 1;
    });
    
    dataTableInit(); 
    dataTable.setReFreshCall(queryData); 
    dhx.showProgress("请求数据中");
    termReq.init(function(termVals){
        dhx.closeProgress();
        dataTable.refreshData();
    }); //打包请求数据，初始，传入回调函数，里面开始查询数据

    var queryBtn = document.getElementById("queryBtn");
    attachObjEvent(queryBtn,"onclick",function(){
        dataTable.Page.currPageNum = 1;
        dataTable.refreshData();
    });
}


//初始数据表格
function dataTableInit(){
    var dd = document.getElementById("dataDiv");
    var pageContent = document.getElementById("pageContent");
    var queryFormDIV = document.getElementById("queryFormDIV");
    dd.style.width = pageContent.offsetWidth  + "px";
    dd.style.height = pageContent.offsetHeight-queryFormDIV.offsetHeight + "px";
    dataTable = new meta.ui.DataTable("dataDiv");//第二个参数表示是否是表格树
    dataTable.setColumns({
    	MDN :"电话号码",
        ATTIME:"时间",
        PROTOCOL:"协议类型",
        URL:"url地址",
        SENDBYTE:"上行流量(单位:KB)",
        RECVBYTE:"下行流量(单位:KB)"
    },"MDN,ATTIME,PROTOCOL,URL,SENDBYTE,RECVBYTE");
//  dataTable.setRowIdForField("MDN");// 排序设置
    dataTable.setPaging(false,15);//分页
//    dataTable.setSorting(true,{
//        MDN:"desc"
//    });
    dataTable.render();
    dataTable.grid.setInitWidthsP("15,15,10,30,15,15");
    dataTable.setGridColumnCfg(0,{align:"center"});
    dataTable.setGridColumnCfg(1,{align:"center"});
    dataTable.setGridColumnCfg(2,{align:"center"});
    dataTable.setGridColumnCfg(3,{align:"left"});
    dataTable.setGridColumnCfg(4,{align:"center"});
    dataTable.setGridColumnCfg(5,{align:"center"});
    
    dataTable.setFormatCellCall(function(rid,cid,data,colId){
        return data[cid];
    });

    return dataTable;
}


//查询数据
function queryData(dt,params){
    var termVals = TermReqFactory.getTermReq(1).getKeyValue();
//  termVals["_COLUMN_SORT"] = params.sort;
    dhx.showProgress("请求数据中");
    ClientWSAction.listQuery(termVals,function(data){
        dhx.closeProgress();
        var total = 0;
//        if(data && data[0])
//            total = data[0]["TOTAL_COUNT_"];
        for ( var i = 0; i < data.length; i++) {
        	data[i]["RECVBYTE"] = (data[i]["RECVBYTE"]/1024).toFixed(2);
        	data[i]["SENDBYTE"] = (data[i]["SENDBYTE"]/1024).toFixed(2);
		}
        dataTable.bindData(data,total); //查询出数据后，必须显示调用绑定数据的方法
    });
}


dhx.ready(pageInit);
