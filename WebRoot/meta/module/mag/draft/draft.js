/******************************************************
 *Copyrights @ 2012，Tianyuan DIC Information Co., Ltd.
 *All rights reserved.
 *
 *Filename：
 *        draft.js
 *Description：
 *      通用草稿js
 *Dependent：
 *
 *Author:王晶 
**********************************************************/
//通用草稿类
var variables ={
	selectWin : null ,   //弹出窗口
	backFun : null,      //回调函数
    draftDataTable : null,  //数据表格
}
var CommDraft = { 
	
	pageInit:function(){
	    //生成弹出窗体后生成表格
	    if (!variables.selectWin){
	    	variables.selectWin = DHTMLXFactory.createWindow("1","showWin", 0, 0, 720, 380);
	        variables.selectWin.stick();
	        variables.selectWin.denyResize();
	        variables.selectWin.denyPark();
	        variables.selectWin.button("minmax1").hide();
	        variables.selectWin.button("park").hide(); 
	        variables.selectWin.button("stick").hide();
	        variables.selectWin.button("sticked").hide();
	        variables.selectWin.center();
	        variables.selectWin.setText("选择草稿");
	        variables.selectWin.keepInViewport(true);
	        variables.selectWin.attachObject($("_winDiv"));
	    }
	     variables.selectWin.attachEvent("onClose",function(){ 
	            variables.selectWin.setModal(false);
	            this.hide();
	            return false;
	    });
	},
	
	//初始化表格
   dataTableInit:function(){
		if(!_dimTableDatas.dimDataTable){
			var dataTable = new meta.ui.DataTable("_selectContent",false);
		    dataTable.setColumns({
		        DRAFT_TITLE:"草稿标题",
		        DRAFT_DESC:"草稿描述",
		        CREATE_TIME:"创建时间",
		        USER_NAMECN:"创建人",
		        LAST_MODIFY_TIME:"最后修改时间",
		        opt:"操作"
		    },"DRAFT_TITLE,DRAFT_DESC,CREATE_TIME,USER_NAMECN,LAST_MODIFY_TIME");
    		dataTable.setPaging(false);//分页
		    dataTable.setSorting(false);
		    dataTable.render();
		    dataTable.grid.setInitWidthsP("20,30,15,10,15,10");
		    dataTable.grid.setColAlign("left,left,left,left,left,center");
		    dataTable.setFormatCellCall(function(rid,cid,data,colId){   //设置
		    	if(colId="opt"){
		    		return"<a href onclick=''>操作</a>"
		    	}
		    	return data[cid];
		    })
		}
   },
   
   //选择之后的函数,需要传入回调函数,这里只返回保存的数据的json 
	
}