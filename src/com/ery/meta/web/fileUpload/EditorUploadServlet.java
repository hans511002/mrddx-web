package com.ery.meta.web.fileUpload;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.DiskFileUpload;
import org.apache.commons.fileupload.FileItem;
import org.codehaus.jackson.map.ObjectMapper;

public class EditorUploadServlet extends HttpServlet {
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		this.doPost(req, resp);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

		try {
			DiskFileUpload fu = new DiskFileUpload();
			List<FileItem> fileItems = fu.parseRequest(req);

			for (FileItem fileItem : fileItems) {
				if (!fileItem.isFormField()) {// 是文件
					String proPath = req.getSession().getServletContext().getRealPath(File.separator);
					String uploadPath = System.getProperty("catalina.home") + File.separator + "webapps"
							+ File.separator + "upload" + File.separator + "editor";
					File dir = new File(uploadPath);
					if (!dir.exists()) {
						dir.mkdirs();
					}
					String imgName = System.currentTimeMillis() + ".jpg";
					String savePath = uploadPath + File.separator + imgName;
					fileItem.write(new File(savePath));
					// 绝对路径
					// String webPath = "http://" + req.getServerName() + ":" +
					// req.getServerPort()+"/upload/editor/" + imgName;

					// 相对路径
					String webPath = "/upload/editor/" + imgName;

					ObjectMapper objectMapper = new ObjectMapper();
					try {
						Map<String, Object> map = new HashMap<String, Object>();
						map.put("error", 0);
						map.put("url", webPath);

						String returnVal = objectMapper.writeValueAsString(map);

						resp.getWriter().print(returnVal);
					} catch (IOException e) {
						e.printStackTrace();
					}

				}
			}
		} catch (Exception e) {

		}
	}

}
