package com.ery.hadoop.hq.ws.client;

import javax.xml.namespace.QName;

import org.apache.cxf.binding.soap.SoapHeader;
import org.apache.cxf.binding.soap.SoapMessage;
import org.apache.cxf.helpers.DOMUtils;
import org.apache.cxf.interceptor.Fault;
import org.apache.cxf.phase.AbstractPhaseInterceptor;
import org.apache.cxf.phase.Phase;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.ery.hadoop.hq.ws.utils.MetaWsDataUtil;
import com.ery.hadoop.hq.ws.utils.WsRequest;

/**
 * @description
 * @date 12-10-29 -
 * @modify
 * @modifyDate -
 */
public class MetaWsClientOutInterceptor extends AbstractPhaseInterceptor<SoapMessage> {

	private String key = "";

	public MetaWsClientOutInterceptor(String _key) {
		super(Phase.WRITE);
		key = _key;
	}

	public void handleMessage(SoapMessage message) throws Fault {
		QName name = new QName(WsRequest.HEADER_NAME);
		Document doc = DOMUtils.createDocument();
		Element userE = doc.createElement(WsRequest.HEADER_USERNAME);
		Element passE = doc.createElement(WsRequest.HEADER_PASSWORD);
		userE.setTextContent(MetaWsClient.getUsername(key));
		passE.setTextContent(MetaWsDataUtil.getMD5(MetaWsClient.getPassword(key)));

		Element root = doc.createElementNS("http://app.ws.meta.ery.com/", "tns:" + WsRequest.HEADER_NAME);
		root.appendChild(userE);
		root.appendChild(passE);

		SoapHeader head = new SoapHeader(name, root);
		message.getHeaders().add(head);
	}

}
