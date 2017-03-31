package com.ery.hadoop.hq.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ery.hadoop.hq.ws.WsQuery;
import com.ery.hadoop.hq.ws.utils.MetaWsDataUtil;
import com.ery.hadoop.hq.ws.utils.WsRequest;

public class HBaseQueryServlet extends HttpServlet {
	private static final long serialVersionUID = -3530909106070035236L;
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		req.setCharacterEncoding("UTF-8");
		resp.setContentType("text/html;charset=UTF-8");
		resp.setHeader("Content-type","text/html;charset=UTF-8");
		Map<String, Object> params = new HashMap<String, Object>();
		Enumeration<String> enumertion = req.getParameterNames();
		while(enumertion.hasMoreElements()){
			String key = enumertion.nextElement();
			params.put(key, req.getParameter(key));
		}
		
		Map<String, Object> map = new HashMap<String, Object>();
		map.put(WsRequest.PAR_SIMPLE_MAP, params);
		Object obj = new WsQuery().executeQuery(map);
		String data = MetaWsDataUtil.toJSON(obj);
		PrintWriter printWriter = resp.getWriter();
		printWriter.append(data);
		printWriter.flush();
		printWriter.close();
	}
	
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		this.doGet(req, resp);
	}
}
