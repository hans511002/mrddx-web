<%@ page language="java" contentType="image/jpeg" pageEncoding="utf-8"%>
<%@page import="java.awt.image.BufferedImage"%>
<%@page import="java.awt.Graphics2D"%>
<%@page import="java.awt.Color"%>
<%@page import="java.awt.Font"%>
<%@page import="javax.imageio.ImageIO"%>
<%@page import="com.ery.base.support.log4j.LogUtils"%>
<%@page import="com.ery.meta.common.ServerDetector"%>
<%@page import="com.sun.image.codec.jpeg.JPEGImageEncoder"%>
<%@page import="com.sun.image.codec.jpeg.JPEGCodec"%>
<%
	out.clear();
	//设置页面不缓存 
	response.setHeader("Pragma","No-cache"); 
	response.setHeader("Cache-Control","no-cache"); 
	response.setDateHeader("Expires", 0); 

	//设置内容类型
	response.setContentType("image/jpeg");

	//设置图片高和宽
	int width = 140;
	int height = 53;
	// 创建图片缓冲区，读取图像文件。TYPE_INT_RGB：表示一个图像，它具有合成整数像素的 8 位 RGBA 颜色分量
	BufferedImage buffImg = new BufferedImage(width, height,BufferedImage.TYPE_INT_RGB);
	
	//Graphics2D二维图片类 getGraphics() 绘制Graphics2D图像
	Graphics2D g = (Graphics2D) buffImg.getGraphics();
	// 设置随机颜色
	Color c = new Color(220,221,228);
	// 二维图像对象，设置 Graphics2D 上下文的背景色
	g.setBackground(c);
	/**
	 * 二维图像绘制对象，通过使用当前绘图表面的背景色进行填充来清除指定的矩形 x - 要清除矩形的 x 坐标。 
	 * y - 要清除矩形的 y 坐标。
	 * width - 要清除矩形的宽度。 height - 要清除矩形的高度。
	 */
	g.clearRect(0, 0, width, height);
	// 设置随机颜色
	Color fc = new Color((int) (Math.random() * 71) + 55, (int) (Math
			.random() * 71) + 55, (int) (Math.random() * 71) + 55);
	// 将此图形上下文的当前颜色设置为指定颜色--fc。
	g.setColor(fc);
	// 设置字体样式和大小
	g.setFont(new Font("Times New Roman", Font.BOLD, 50));
	// 创建StringBuffer字符串缓冲区，保存随机产生的验证码，以便用户登录后进行登陆
	StringBuffer randomCode = new StringBuffer();
	// 设置Y轴随机坐标
	int sp = (int) (Math.random() * 30) + 22;
	// 产生4个位数的随机数
	for (int i = 0; i < 4; i++) {
		// 得到随机产生的验证码字符
		char strRand = (char) ((int) (Math.random()*10) + 48);
			/*(char) (Math.random() > 0.50 ? (int) (Math.random() * 25) + 65
				: (int) (Math.random() * 25) + 97);*/
		// 将随机产生的验证码放到图像中。drawString（要呈现的文本，X坐标，Y坐标）
		g.drawString(String.valueOf(strRand), 24 * i + 12, 40);
		// 将绘制的的随机数组合在一起，放到StringBuffer中
		randomCode.append(strRand);
	}
	
	/* 在该图像中的坐标系中画一条横线进行混淆
	g.drawLine(0, sp - (int) (Math.random() * 20), 130, sp
			- (int) (Math.random() * 20));
	*/
	
	session.setAttribute("randomCode",randomCode.toString().toLowerCase());
	
	//释放图形环境
	g.dispose();
	
	// 二进制流
	try{
		JPEGImageEncoder encoder = JPEGCodec.createJPEGEncoder(response.getOutputStream()); 
		encoder.encode(buffImg);
	}catch(Exception e){
		LogUtils.error("验证码打印抛出异常!",e);
	}
	
	if(ServerDetector.isTomcat()){
		out.clear();
		out = pageContext.pushBody();
	}
%>
