package com.ery.meta.sys.code;

import com.ery.base.support.jdbc.Column;

public class CodePO {

	@Column("CODE_ID")
	private int codeID;
	@Column("CODE_TYPE_ID")
	private int codeTypeID;
	@Column("CODE_NAME")
	private String codeName;
	@Column("CODE_VALUE")
	private String codeValue;
	@Column("ORDER_ID")
	private int orderID;
	@Column("TYPE_CODE")
	private String typeCode;

	public String getTypeCode() {
		return typeCode;
	}

	public void setTypeCode(String typeCode) {
		this.typeCode = typeCode.toUpperCase();
	}

	public int getCodeID() {
		return codeID;
	}

	public void setCodeID(int codeID) {
		this.codeID = codeID;
	}

	public int getCodeTypeID() {
		return codeTypeID;
	}

	public void setCodeTypeID(int codeTypeID) {
		this.codeTypeID = codeTypeID;
	}

	public String getCodeName() {
		return codeName;
	}

	public void setCodeName(String codeName) {
		this.codeName = codeName;
	}

	public String getCodeValue() {
		return codeValue;
	}

	public void setCodeValue(String codeValue) {
		this.codeValue = codeValue;
	}

	public int getOrderID() {
		return orderID;
	}

	public void setOrderID(int orderID) {
		this.orderID = orderID;
	}
}
