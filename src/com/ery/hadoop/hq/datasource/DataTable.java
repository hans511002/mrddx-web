package com.ery.hadoop.hq.datasource;

public class DataTable extends com.ery.base.support.jdbc.DataTable {

	public Object grows[][]; // 分组列值
	public String gcols[]; // 分组列
	public String gstistics[];// 分组方法
	public String gErrorMSG;// 分组错误

	public Object[][] getGrows() {
		return grows;
	}

	public void setGrows(Object[][] grows) {
		this.grows = grows;
	}

	public String[] getGcols() {
		return gcols;
	}

	public void setGcols(String[] gcols) {
		this.gcols = gcols;
	}

	public String[] getGstistics() {
		return gstistics;
	}

	public void setGstistics(String[] gstistics) {
		this.gstistics = gstistics;
	}

	public String getgErrorMSG() {
		return gErrorMSG;
	}

	public void setgErrorMSG(String gErrorMSG) {
		this.gErrorMSG = gErrorMSG;
	}
}
