package com.ery.meta.web.fileUpload;

import org.apache.commons.fileupload.FileItem;
import javax.servlet.http.HttpServletRequest;
import java.util.List;


public interface IFileUpload{
    /**
     * 文件上传需要实现的方法
     * @param request
     * @param fileItem
     * @return 返回一个文件上传的重定向URL
     */
    public String upload(HttpServletRequest request,List<FileItem> fileItems);

}
