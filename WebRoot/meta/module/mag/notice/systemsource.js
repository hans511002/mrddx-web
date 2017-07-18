/**
 * 查询数据
 */
function queryData() {
	dhx.showProgress("请求数据中...");
	SystemSourceAction.queryPermGen(function(data) {
		dhx.closeProgress();
		// 服务器参数
		addRow2(data["serverconfig"],"serverconfig");
		// 持久代
		addRow2(data["perm"],"perm");
		// 操作系统
		addRow2(data["system"],"system");
	});

	function addRow2(data, id) {
		var myTab = document.getElementById(id);
		var html = "";
		html += "<tr><td class=\"nav_td_trl\">名称</td>";
		html += "<td class=\"nav_td_trl\">值</td></tr>";
		for ( var key in data) {
			html += "<tr style='font-size:12px'>";
			html += "<td  class=\"content_td\">" + key + "</td>";
			html += "<td  class=\"content_td2\">" + data[key] + "</td>";
			html += "</tr>";
		}
		myTab.innerHTML = html;
	}
}

dhx.ready(queryData);