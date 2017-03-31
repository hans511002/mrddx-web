package com.ery.meta.web;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * 作用 拦截外来接口的请求

 * @date 2011-10-25
 */
public class UrlRewriteFilter implements Filter {
	
	//定义一个map来保存解析对象
	Map<String, String> xmlObject = new HashMap<String,String>();;
	/**
	 * 服务器注销时调用的方法
	 */
	public void destroy() {
		
	}
	/**
	 * 拦截器，获取拦取内容，根据需求调整url
	 */
	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {
		//获取servlet的请求和指向
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp =(HttpServletResponse)response;
        //得到session
        //得到传递参数集合
        Map<String,String[]> parameter = req.getParameterMap();
//        	//未登录，取得请求的url，并干掉项目名称
        String path = req.getContextPath();
        String uri=req.getRequestURI();
        uri = uri.substring(path.length());

        //当from表单和uri相等的情况
        if(xmlObject.containsKey(uri)){
        		//保存参数数组
        		request.setAttribute("@param", parameter);
        		//得到to表单
        		String url = xmlObject.get(uri).toString();
        		//保存请求参数和forward前往指定url
        		RequestDispatcher requestDispatcher=request.getRequestDispatcher(url);
        		requestDispatcher.forward(req, resp);
    	}else{
    		chain.doFilter(req,resp);
    	}
	}
	/**
	 * 初始化xml信息
	 */
	public void init(FilterConfig filterConfig) throws ServletException {
		this.parsersXml();
	}
	/**
	 * 得到xml解析结果
	 * @return xml的map对象
	 */
	
	private void parsersXml(){
		DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
		InputStream is = null;
		try {
			 //通过文档构建器工厂获取一个文档构建器
			 DocumentBuilder db = dbf.newDocumentBuilder();
			 is = this.getClass().getClassLoader().getResourceAsStream("url-rewrite.xml");
			 //通过文档通过文档构建器构建一个文档实例
			 Document doc = db.parse(is);
			 //获取所有名字为 "forward" 的节点
			 NodeList list = doc.getElementsByTagName("forward");
			 for (int i = 0; i < list.getLength(); i++) {
			     Node node = list.item(i);
			     String from = node.getAttributes().getNamedItem("from").getNodeValue();
			     String to = node.getAttributes().getNamedItem("to").getNodeValue();
			     xmlObject.put(from,to);
			 }
		 } catch(Exception e){
			 e.printStackTrace();
		 }finally{
			 if(is!=null){
				 try {
					is.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			 }
		 }
	}
}
