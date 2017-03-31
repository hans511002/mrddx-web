package com.ery.meta.util.downloadWord;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.base.support.web.init.SystemVariableInit;

import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;

public class DocumentHandler {
	private Configuration configuration = null;

	public DocumentHandler() {
		configuration = new Configuration();
		configuration.setDefaultEncoding("UTF-8");
	}

	public void createDoc(String path, Map<String, Object> dataMap) throws IOException {
		// 设置模本装置方法和路径,FreeMarker支持多种模板装载方法。可以重servlet，classpath，数据库装载，
		// 这里我们的模板是放在com.havenliu.document.template包下面
		if (dataMap == null) {
			dataMap = new HashMap<String, Object>();
		}
		configuration.setClassForTemplateLoading(this.getClass(), "/com/ery/meta/util/downloadWord/template");
		Template t = null;
		try {
			// test.ftl为要装载的模板
			t = configuration.getTemplate("wordTemplate.ftl");
		} catch (IOException e) {
			e.printStackTrace();
		}
		// 输出文档路径及名称
		// File outFile = new File("D:/temp/outFile.doc");
		// if (!outFile.exists()) {
		// outFile.createNewFile();
		// }
		File outFile = new File(SystemVariableInit.WEB_ROOT_PATH, path);
		Writer out = null;
		try {
			out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(outFile), "UTF-8"));
		} catch (FileNotFoundException e1) {
			e1.printStackTrace();
		}
		// getData(dataMap);
		try {
			t.process(dataMap, out);
		} catch (TemplateException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	/**
	 * 注意dataMap里存放的数据Key值要与模板中的参数相对应
	 * 
	 * @param dataMap
	 */
	@SuppressWarnings("unused")
	private void getData(Map<String, Object> dataMap) {
		dataMap.put("au", "");
		dataMap.put("author", "");
		dataMap.put("remark", "这是测试备注信息");
		List<LogRule> _table1 = new ArrayList<LogRule>();

		LogRule t1 = new LogRule();

		// t1.setDate("2010-10-1");
		// t1.setText("制定10月开发计划内容。");
		_table1.add(t1);
		//
		// Table1 t2=new Table1();
		// t2.setDate("2010-10-2");
		// t2.setText("开会讨论开发计划");
		// _table1.add(t2);

		dataMap.put("table1", _table1);

		// List<TableRuleList> _table2=new ArrayList<TableRuleList>();
		// for(int i=0;i<5;i++)
		// {
		// TableRuleList _t2=new TableRuleList();
		// // _t2.setDetail("测试开发计划"+i);
		// // _t2.setPerson("张三——"+i);
		// // _t2.setBegindate("2010-10-1");
		// // _t2.setFinishdate("2010-10-31");
		// // _t2.setRemark("备注信息");
		// _table2.add(_t2);
		// }
		// dataMap.put("table2", _table2);

	}

}
