// JScript 文件
var Drag = new Object();//拖拽函数名字空间
Drag = {
    tmpElement:null,
    dragElement:null,
    downX:null,
    downY:null,
    tmp_o_x:null,
    tmp_o_y:null,
    dragActive:0,
    draging:0,
    isClone:true,
    dragZindex:0
};
Drag.readyDrag = function(isInForm,ParLevel,id,NotClone){
    this.dragActive=1;
    if(NotClone) this.isClone=false;
    if(id){
        if(typeof(id) =="string"){
            if(document.getElementById)this.dragElement=document.getElementById(id);
            else if(document.all)this.dragElement=document.all(id);
        }else{
            this.dragElement=id;
        }
    }else{
        this.dragElement=event.srcElement;
        for(i=ParLevel;i>0;i--){
            this.dragElement=this.dragElement.parentNode;
        }
    }
    if(this.dragElement.tagName.toUpperCase()!="DIV")
        return;
    if(NotClone)this.tmpElement=this.dragElement;
    else this.tmpElement=this.dragElement.cloneNode(true);
    this.tmpElement.style.filter="alpha(opacity=80)";
    this.dragZindex=this.tmpElement.style.zIndex;
    if(!NotClone)this.tmpElement.style.zIndex=this.dragElement.style.zIndex+1;

    this.tmpElement.style.position="absolute";
    if(this.dragElement.offsetParent.tagName!="BODY"){
        this.dragElement.style.left=this.dragElement.offsetLeft+this.dragElement.parentNode.style.pixelLeft;
        this.dragElement.style.top=this.dragElement.offsetTop+this.dragElement.parentNode.style.pixelTop;
    }
    this.downX=event.clientX;
    this.downY=event.clientY;
    this.tmp_o_x=this.dragElement.style.pixelLeft;
    this.tmp_o_y=this.dragElement.style.pixelTop;
    this.dragElement.parentNode.appendChild(this.tmpElement);
    /*	if(isInForm)
     {
     document.forms[0].appendChild(this.tmpElement);
     }
     else
     {
     document.body.appendChild(this.tmpElement);
     }
     */
    document.onmousemove=Drag.startDrag;
    //tmpElement.attachEvent('onmousemove',Drag.startDrag);
    //window.document.attachEvent('oncontextmenu',contextmenu); ";
    document.onmouseup=Drag.endDrag;
}
Drag.startDrag = function(){
    if(this.dragActive==1&&event.button==1&&this.dragElement!=null&&this.tmpElement!=null){
        this.tmpElement.style.visibility="visible";
        this.tmpElement.style.left=this.tmp_o_x+event.clientX-downX;
        this.tmpElement.style.top=this.tmp_o_y+event.clientY-downY;
        if(this.isClone)this.dragElement.style.backgroundColor="#CCCCCC";
        document.body.style.cursor="move";
        this.draging=1;
        document.onselectstart=function(){return false;}
    }
}
Drag.endDrag = function(){
    if(this.dragActive==1&&this.tmpElement!=null) {
        this.tmpElement.style.filter="alpha(opacity=100)";
        this.tmpElement.style.zIndex=this.dragZindex;
        document.body.style.cursor="default";
        if(this.draging==1){
            if(this.isClone)this.dragElement.removeNode(true);
            this.tmpElement.style.display='';
            this.draging=0;
        }
        document.onselectstart=function(){return true;}
    }
    document.onmousemove=function(){return true;};
    document.onmouseup=function(){return true;};
    this.dragElement=null;
    this.tmpElement=null;
//    this.refElement=null;
    this.dragActive=0;
}
Drag.setdiv = function(id){
    $(id).style.display='';
    var top=document.body.offsetHeight-event.clientY;
    var n;
    if(top>$(id).offsetHeight+30) {
        n=event.clientY;
    }else{
        n=document.body.offsetHeight-$(id).offsetHeight-30;
    }
    top=document.body.scrollTop;
    top=top + n;
    var left=document.body.offsetWidth-$(id).offsetWidth-10;
    left=left>event.clientX?event.clientX:event.clientX-$(id).offsetWidth-30+document.body.scrollLeft;
    //hideObj('EditDiv');
    if( left<10) left=10;
    if( top<10) top=10;
    $(id).style.top=top+"px";
    $(id).style.left=left+"px";
}
