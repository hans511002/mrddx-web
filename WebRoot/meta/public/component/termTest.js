dhtmlXCalendarObject.prototype.langData["zh"] = {
    dateformat: '%Y%m%d',//2011-08
    monthesFNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    monthesSNames: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"],
    daysFNames: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    daysSNames: ["日", "一", "二", "三", "四", "五", "六"],
    weekstart: 7
}
var box =document.createElement("DIV");
box.style.position="absolute";
box.style.overflow="auto";
box.style.width="100px";
box.style.height="100px";
box.innerHTML="dsgdkg<br/>dsgdkg<br/>dsgdkg<br/>dsgdkg<br/>dsgdkg<br/>dsgdkg<br/>dsgdkg<br/>dsgdkg<br/>dsgdkg<br/>dsgdkg<br/>dsgdkg<br/>dsgdkg<br/>dsgdkg<br/>dsgdkg<br/>dsgdkg<br/>dsgdkg<br/>dsgdkg<br/>dsgdkg<br/>";
box.onscroll=function(){Debug(this.scrollTop+"__"+this.scrollLeft);};
document.body.appendChild(box);
box.style.zIndex=999999999;

dhtmlx.image_path = getDefaultImagePath();
dhtmlx.skin = getSkin();

var term1=meta.term.createTermControl("a","local_code");//下拉框
var term2=meta.term.createTermControl("b","date_no");//日期
var term3=meta.term.createTermControl("c","zone_id");//下拉树
var term4=meta.term.createTermControl("d","area_id");//下拉框联动
var term5=meta.term.createTermControl("e","term5");//异步加载树
var term6=meta.term.createTermControl("f","term6");//下拉框联动

term1.setListRule(1,"select z.zone_code,z.zone_name from meta_dim_zone z where z.dim_level=2 and z.dim_type_id=4",0,"028");
term2.setDateRule(1,"select min(z.date_code)||'-'||max(z.date_code) from meta_dim_date z \
	where z.dim_level=3 and z.dim_type_id=1 and z.date_code<to_char(sysdate,'yyyymmdd')\
	order by z.date_code desc ",0,"2012-05-12");
term3.setTreeRule(1,"select z.zone_code,z.zone_name,z.zone_par_code from meta_dim_zone z where  z.dim_type_id=4 order by 3,1",0,"0000");
term4.setTreeRule(1,"select z.zone_code,z.zone_name from meta_dim_zone z where  z.dim_type_id=4 and z.zone_par_code='{LOCAL_CODE}' ");
term5.setTreeRule(1,"select z.zone_code,z.zone_name,z.zone_par_code from meta_dim_zone z where  z.dim_type_id=4 and z.zone_par_code='0';" +
"select z.zone_code,z.zone_name,z.zone_par_code from meta_dim_zone z where  z.dim_type_id=4 and z.zone_par_code='{term5}' ");


term4.setParentTerm("local_code");
term1.setWidth(200);
term1.mulSelect=true;
term2.setWidth(200);
term3.mulSelect=true;
term3.setWidth(200);


term4.mulSelect=true;
term4.setWidth(200);
term5.setWidth(200);
term5.mulSelect=true;


//term6.setWidth(200);
meta.term.render();


meta.term.init(function(termVals){
	var msg="";
	for(var term in termVals)
	{
		if(termVals[term])
			msg+=term+":"+termVals[term]+",";
	}
	Debug("callBack参数值："+msg);
});
//term3.selTree.setCheckboxFlag(1);//down
term3.selTree.setCheckboxFlag(2);//up
//term3.selTree.setCheckboxFlag(3);//up down
//term3.selTree.setCheckboxFlag(4);//three state

term5.selTree.setCheckboxFlag(1);//down
term5.selTree.setCheckboxFlag(2);//up
term5.selTree.setCheckboxFlag(3);//up down
//term5.selTree.setCheckboxFlag(4);//three state

