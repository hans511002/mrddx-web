<%@ page contentType="text/javascript;charset=UTF-8" language="java" isELIgnored="false" %>
<%@ page import="com.ery.meta.sys.i18n.I18nManager"%>
<%@ page import="com.ery.base.support.utils.StringUtils"%>
<%@ page import="com.ery.meta.sys.i18n.item.ItemPO"%>
<%@ page import="com.ery.meta.sys.i18n.resource.ResourcePO"%>
<%@ page import="com.ery.base.support.utils.ArrayUtils"%>
<%@ page import="org.apache.poi.util.StringUtil"%>
    var temp_i18n={};
<%
    String menu = request.getParameter("menuId");
	out.println("temp_i18n={");
    if(StringUtils.isNotEmpty(menu) && !"null".equals(menu)){
        ItemPO[] items = I18nManager.getItemByMenuId(Integer.parseInt(menu));
        ResourcePO[] resources = I18nManager.getResourceByMenuId(Integer.parseInt(menu));
      	out.println("items:[");
          if(ArrayUtils.isNotEmpty(items)){
              int length = items.length;
              for(int i=0;i<length;i++){
                  ItemPO item = items[i];
                  out.print("{menuname:'"+StringUtils.trim(item.getMenuName())+"',");
                  out.print("valtext:'"+StringUtils.trim(item.getValText())+"',");
                  out.print("itemcode:'"+StringUtils.trim(item.getI18nItemCode())+"'}");
                  if(i!=length-1){
                      out.println(",");
                  }
              }
          }
          out.println("]");
          out.println(",resources:[");
          if(ArrayUtils.isNotEmpty(resources)){
              int length = resources.length;
              for(int i=0;i<length;i++){
                  ResourcePO resource = resources[i];
                  out.print("{menuname:'"+StringUtils.trim(resource.getMenuName())+"',");
                  out.print("resourcepath:'"+StringUtils.trim(resource.getResourcePath())+"',");
                  out.print("resourcecode:'"+StringUtils.trim(resource.getResouceCode())+"',");
                  out.print("resourcename:'"+StringUtils.trim(resource.getResourceName())+"'}");
                  if(i!=length-1){
                      out.println(",");
                  }
              }
          }
          out.println("]");
    }
    out.println("};");
%>
function toLocal(data){
	if(temp_i18n.items){
		for(var i=0,len=temp_i18n.items.length;i<len;i++){
			var item = temp_i18n.items[i];
			data[item.itemcode]=item.valtext;
		}
	}
	
	if(temp_i18n.resources){
		for(var i=0,len=temp_i18n.resources.length;i<len;i++){
			var resource = temp_i18n.resources[i];
			data[resource.resourcecode]=resource.resourcepath;
		}
	}
};		