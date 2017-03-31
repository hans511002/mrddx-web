package com.ery.meta.module.log.serverlog;

import java.io.BufferedReader;
import java.io.IOException;

public class ServerLogAction {
    private ServerLogService serverLogSer = new ServerLogService(); ;
    
	public String  readLogFileInfo(String fileName) throws Exception, IOException{
		BufferedReader reader =  serverLogSer.readLogFileInfo(fileName);
		if(reader==null){
			return fileName+"文件未找到!";
		}
    	 try { 
	           String tempString = null; 
               int line = 1; 
	           // 一次读入一行，直到读入null为文件结束 
	           while ((tempString = reader.readLine()) != null) { 
	               line++; 
	            } 
	           reader.close(); 
	       } catch (IOException e) { 
	         e.printStackTrace(); 
	       } finally { 
	           if (reader != null) { 
	               try { 
	                   reader.close(); 
	               } catch (IOException e1) { 
	              } 
	          } 
       }
		return null;
		
    }
}
