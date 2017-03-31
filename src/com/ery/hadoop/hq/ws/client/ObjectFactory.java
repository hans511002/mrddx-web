package com.ery.hadoop.hq.ws.client;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlElementDecl;
import javax.xml.bind.annotation.XmlRegistry;
import javax.xml.namespace.QName;

/**
 * This object contains factory methods for each Java content interface and Java element interface generated in the
 * com.ery.hadoop.hq.ws.testclient package.
 * <p>
 * An ObjectFactory allows you to programatically construct new instances of the Java representation for XML content. The Java
 * representation of XML content can consist of schema derived interfaces and classes representing the binding of schema type
 * definitions, element declarations and model groups. Factory methods for each of these are provided in this class.
 * 
 */
@XmlRegistry
public class ObjectFactory {

	private final static QName _DoGet_QNAME = new QName("http://app.ws.hq.hadoop.ery.com/", "doGet");
	private final static QName _GetAvailableWS_QNAME = new QName("http://app.ws.hq.hadoop.ery.com/", "getAvailableWS");
	private final static QName _DoGetResponse_QNAME = new QName("http://app.ws.hq.hadoop.ery.com/", "doGetResponse");
	private final static QName _GetAvailableWSResponse_QNAME = new QName("http://app.ws.hq.hadoop.ery.com/",
			"getAvailableWSResponse");

	/**
	 * Create a new ObjectFactory that can be used to create new instances of schema derived classes for package:
	 * com.ery.hadoop.hq.ws.testclient
	 * 
	 */
	public ObjectFactory() {
	}

	/**
	 * Create an instance of {@link GetAvailableWS }
	 * 
	 */
	public GetAvailableWS createGetAvailableWS() {
		return new GetAvailableWS();
	}

	/**
	 * Create an instance of {@link DoGet }
	 * 
	 */
	public DoGet createDoGet() {
		return new DoGet();
	}

	/**
	 * Create an instance of {@link GetAvailableWSResponse }
	 * 
	 */
	public GetAvailableWSResponse createGetAvailableWSResponse() {
		return new GetAvailableWSResponse();
	}

	/**
	 * Create an instance of {@link DoGetResponse }
	 * 
	 */
	public DoGetResponse createDoGetResponse() {
		return new DoGetResponse();
	}

	/**
	 * Create an instance of {@link JAXBElement }{@code <}{@link DoGet }{@code >}
	 * 
	 */
	@XmlElementDecl(namespace = "http://app.ws.hq.hadoop.ery.com/", name = "doGet")
	public JAXBElement<DoGet> createDoGet(DoGet value) {
		return new JAXBElement<DoGet>(_DoGet_QNAME, DoGet.class, null, value);
	}

	/**
	 * Create an instance of {@link JAXBElement }{@code <}{@link GetAvailableWS }{@code >}
	 * 
	 */
	@XmlElementDecl(namespace = "http://app.ws.hq.hadoop.ery.com/", name = "getAvailableWS")
	public JAXBElement<GetAvailableWS> createGetAvailableWS(GetAvailableWS value) {
		return new JAXBElement<GetAvailableWS>(_GetAvailableWS_QNAME, GetAvailableWS.class, null, value);
	}

	/**
	 * Create an instance of {@link JAXBElement }{@code <}{@link DoGetResponse }{@code >}
	 * 
	 */
	@XmlElementDecl(namespace = "http://app.ws.hq.hadoop.ery.com/", name = "doGetResponse")
	public JAXBElement<DoGetResponse> createDoGetResponse(DoGetResponse value) {
		return new JAXBElement<DoGetResponse>(_DoGetResponse_QNAME, DoGetResponse.class, null, value);
	}

	/**
	 * Create an instance of {@link JAXBElement }{@code <}{@link GetAvailableWSResponse }{@code >}
	 * 
	 */
	@XmlElementDecl(namespace = "http://app.ws.hq.hadoop.ery.com/", name = "getAvailableWSResponse")
	public JAXBElement<GetAvailableWSResponse> createGetAvailableWSResponse(GetAvailableWSResponse value) {
		return new JAXBElement<GetAvailableWSResponse>(_GetAvailableWSResponse_QNAME, GetAvailableWSResponse.class,
				null, value);
	}

}
