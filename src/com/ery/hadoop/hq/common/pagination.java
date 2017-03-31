package com.ery.hadoop.hq.common;

public class pagination {

    public static String PageDispart(int Counts, int PageSize, int Currpage, int PageCount, String url) {
	StringBuffer str = new StringBuffer();
	str.append("<table width=\"100%\" border=\"0\" cellspacing=\"1\" cellpadding=\"0\"> <tr>  <td width=\"92%\" align=\"right\"  class=\"a1\"> ");
	if (Currpage > PageCount)
	    Currpage = 1;
	int PPage = Currpage - 1;
	int NPage = Currpage + 1;
	if (PPage < 1)
	    PPage = 1;
	if (NPage > PageCount)
	    NPage = PageCount;
	str.append("<span class=Tbule>�ܹ���" + Counts + "��¼,ÿҳ" + PageSize + "��,��ǰ��" + Currpage + "/" + PageCount
		+ " ҳ</span>  <a class=bule href='#'>�� ҳ</a> &nbsp;&nbsp; <a class=bule href='#'>��һҳ</a> &nbsp;&nbsp; <a href='" + url
		+ "&page=" + NPage + "' class=bule>��һҳ</a>&nbsp;&nbsp;<a href='" + url + "&page=" + PageCount + "'  class=bule>β ҳ</a>");
	str.append("</td>");
	str.append(" <td width=\"8%\" nowrap  class=\"a1\"> &nbsp;ת��&nbsp; <select name=\"page\" onChange=\"javascript:gotoPage()\">");
	for (int i = 1; i < PageCount + 1; i++) {
	    if (i == Currpage) {
		str.append("<option value='" + i + "' selected>��" + i + "ҳ</option>");
	    } else {
		str.append("<option value='" + i + "'>��" + i + "ҳ</option>");
	    }
	}
	str.append("</select></td></tr></table> ");
	return str.toString();
    }
}
