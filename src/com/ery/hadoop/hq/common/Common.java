package com.ery.hadoop.hq.common;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Date;

/**

 */
public class Common {
    public static String FormatHTMLString(String s) {
	String result = "";
	if (s == null || s.trim().equals("") || s.trim().toLowerCase().equals("null")) {
	    result = "";
	} else {
	    result = s.replaceAll("\r\n", "<br>");
	    result = result.replaceAll("\r", "<br>");
	    result = result.replaceAll("\n", "<br>");
	    result = result.replaceAll(" ", "&nbsp;");
	    result = result.replaceAll("<br><br>", "<br>");
	}
	return result;
    }

    public static String jsFormat(String s) {
	String result = s;
	result = result.replaceAll("\r\n", "\\\\r\\\\n");
	result = result.replaceAll("\r", "\\\\r");
	result = result.replaceAll("\n", "\\\\n");
	result = result.replaceAll("\"", "\\\\\"");
	return result;
    }

    public static String jsFormat(Object o) {
	if (o == null)
	    return "";
	return jsFormat(o.toString());
    }

    public static String HTMLEncode(String s) {
	String result = "";
	if (s == null || s.trim().equals("")) {
	    result = "&nbsp;";
	} else {
	    result = result.replaceAll("&", "&amp;");
	    result = s.replaceAll("\"", "&quot;");
	    result = result.replaceAll("'", "&#39;");
	    result = result.replaceAll("\\\\", "&#47;");
	    result = result.replaceAll("<", "&lt;");
	    result = result.replaceAll(">", "&gt;");
	}
	return result;
    }

    public static String UrlEncode(String s) {
	String result = "";
	if (s == null || s.trim().equals("")) {
	    result = "";
	} else {
	    result = URLEncoder.encode(s);
	}
	return result;
    }

    public static String UrlDecode(String s) {
	String result = "";
	if (s == null || s.trim().equals("")) {
	    result = "";
	} else {
	    result = URLDecoder.decode(s);
	}
	return result;
    }

    public static String getTopStr(String str, int top) {
	if (str != null && !str.equals("")) {
	    int l = str.length();
	    String temp = "";
	    if (l > top) {
		temp = str.substring(0, top - 1) + "��";
	    } else {
		temp = str.substring(0, l);
	    }
	    return temp;
	} else {
	    return "";
	}
    }

    public static int GetByteLength(String str) {
	StringBuffer sb = new StringBuffer();
	byte[] bt = str.getBytes();
	return bt.length;
    }

    public static int GetShowLength(String str) {
	double l = 0;
	for (int i = 0; i < str.length(); i++) {
	    int asciiValue = (int) str.charAt(i);
	    if (asciiValue < 0 || asciiValue > 255) {
		l = l + 2;
	    } else {
		l = l + 1.3;
	    }
	}
	return (int) l;
    }

    public static String getShowStr(Object str, int length) {
	return getShowStr(str.toString(), length);
    }

    public static String getShowStr(String str, int length) {
	if (str != null && !str.equals("")) {
	    if (str.length() < length / 2)
		return str;
	    String temp = "";
	    double l = 0;
	    int i = 0;
	    for (i = 0; i < str.length(); i++) {
		int asciiValue = (int) str.charAt(i);
		if (asciiValue < 0 || asciiValue > 255) {
		    l = l + 2;
		} else {
		    l = l + 1.3;
		}
		if (l <= length)
		    temp += str.charAt(i);
		else
		    break;
	    }
	    if (i < str.length())
		temp += "��";
	    return temp;
	} else {
	    return "";
	}
    }

    public static String formatNumStr(String str) {
	if (str == null || str.equals(""))
	    return "";
	String temp = str;
	int index = temp.indexOf(".");
	if (index == -1)
	    index = temp.length();
	if (index > 3) {
	    int len = index % 3 == 0 ? index / 3 : index / 3 + 1;
	    int i = 1;
	    while (i < len) {
		temp = temp.substring(0, index - i * 3) + "," + temp.substring(index - i * 3);
		i++;
	    }
	}
	str = temp;
	return str;
    }

    // ��������
    public static String parseChinese(String in) {

	String s = null;
	byte temp[];
	if (in == null) {
	    System.out.println("Warn:Chinese null founded!");
	    return new String("");
	}
	try {
	    temp = in.getBytes("iso-8859-1");
	    s = new String(temp, "GBK");
	} catch (UnsupportedEncodingException e) {
	    System.out.println("���ֱ���ת�����?" + e.toString());
	}
	return s;
    }

    public static String parseChinese(String in, String inType, String outType) {

	String s = null;
	byte temp[];
	if (in == null) {
	    return new String("");
	}
	try {
	    temp = in.getBytes(inType);
	    s = new String(temp, outType);
	} catch (UnsupportedEncodingException e) {
	    System.out.println("���ֱ���ת�����?" + e.toString());
	}
	return s;
    }

    // ��������
    public static String parseISO(String in, String inType, String outType) {

	String s = null;
	byte temp[];
	if (in == null) {
	    System.out.println("Warn:Chinese null founded!");
	    return new String("");
	}
	try {
	    temp = in.getBytes(inType);
	    s = new String(temp, outType);
	} catch (UnsupportedEncodingException e) {
	    System.out.println("���ֱ���ת�����?" + e.toString());
	}
	return s;

    }

    public static String parseISO(String in) {
	String s = null;
	byte temp[];
	if (in == null) {
	    System.out.println("Warn:Chinese null founded!");
	    return new String("");
	}
	try {
	    temp = in.getBytes("GBK");
	    s = new String(temp, "iso-8859-1");

	} catch (UnsupportedEncodingException e) {
	    System.out.println("���ֱ���ת�����?" + e.toString());

	}
	return s;

    }

    // ������
    public static String CheckNull(String s) {
	return (s == null || s.toLowerCase().equals("null")) ? "" : s;
    }

    public static String CheckNull(Object s) {
	return (s == null) ? "" : CheckNull(s.toString());
    }

    // ��̬����ת��
    public static String IsYesNo(String flag) {
	String temp = new String("");
	if (flag != "" && flag != null) {
	    if (flag.trim().equals("1")) {
		temp = "��";
	    } else if (flag.trim().equals("0")) {
		temp = "��";
	    } else {
		temp = "";
	    }
	}
	return temp;
    }

    // �����㷨 ��
    public static String encryptPassword(String password) {
	if (password == null) {
	    return new String("");
	}
	byte[] pass = password.getBytes();
	for (int i = 0; i < pass.length; i++) {
	    pass[i] = (byte) ((int) pass[i] ^ 13);
	}
	String newpassword = new String(pass);
	return newpassword;
    }

    // ���ļ����еĺ���תΪUTF8����Ĵ�,�Ա�����ʱ����ȷ��ʾ�����ļ���.
    public static String toUtf8String(String s) {
	StringBuffer sb = new StringBuffer();
	for (int i = 0; i < s.length(); i++) {
	    char c = s.charAt(i);
	    if (c >= 0 && c <= 255) {
		sb.append(c);
	    } else {
		byte[] b;
		try {
		    b = Character.toString(c).getBytes("utf-8");
		} catch (Exception ex) {
		    System.out.println(ex);
		    b = new byte[0];
		}
		for (int j = 0; j < b.length; j++) {
		    int k = b[j];
		    if (k < 0)
			k += 256;
		    sb.append("%" + Integer.toHexString(k).toUpperCase());
		}
	    }
	}
	return sb.toString();
    }

    // ������ַ�ת��Ϊȫ���ַ��൱�ڽ�Ӣ��ת��Ϊ���ġ�
    public static String AscToHz(String ascString) {
	String result = ascString;
	StringBuffer strBuffer = new StringBuffer();
	int asciiValue;
	for (int i = 0; i < result.length(); i++) {
	    asciiValue = (int) result.charAt(i);
	    if (asciiValue < 125)
		strBuffer.append((char) (asciiValue + 65248));
	    else
		strBuffer.append((char) (asciiValue));
	}
	return new String(strBuffer);
    }

    // ��zhs16 gbk�����ַ�ת��Ϊus7 ascii�ı�����ַ�
    public static String GBK2ASC(String str) {
	StringBuffer sb = new StringBuffer();
	byte[] bt = str.getBytes();
	for (int i = 0; i < bt.length; i++) {
	    if (bt[i] < 0) {
		// �Ǻ���ȥ��λ1
		// sb.append((char)(bt[i] && 0x7f));
		sb.append((char) (bt[i] & 0x7f));
	    } else {
		// ��Ӣ���ַ� ��0����¼
		sb.append((char) 0);
		sb.append((char) bt[i]);
	    }
	}
	return sb.toString();
    }

    // ��us7ascii�����ַ�ת��Ϊzhs16gbk�ı�����ַ�
    /*
     * �ڿͻ����ַ�����ΪUS7ASCIIʱ�����ַ�ΪZHS16GBK����ݿ��в��롰��������
     * ��Ҫ�����ַ�ת��������������ZHS16GBK����Ϊ182��10110110����171��10101011��
     * ��177��10110001����177��10110001��������US7ASCIIΪ7bit���룬
     * Oracle�����������ֵ����ĸ��ַ����Ը��ֽڵ����λ��
     * �Ӷ������ݿ�ı���ͱ����54��00110110����43��00101011����49��00110001����
     * 49��00110001����Ҳ���ǡ�6+11����ԭʼ��Ϣ���ı��ˡ�
     * ��ʱ�����ͻ����ַ�����ΪZHS16GBK�ٽ���SELECT��
     * ��ݿ��е���Ϣ����Ҫ�ı䴫���ͻ��ˣ���һ���������ڴ������Ϣû�иı�����ʾ����������
     * ��ڶ����������ڲ������ʱ��Ϣ�ı䣬���Բ�����ʾԭ����Ϣ�ˡ�
     * ע�⣬�����Ӣ���ַ��У�һ���ַ�ASCII��С��128��˵����Ӣ���ַ�
     * ����Ҫ�����ַ���λ�͵�λ�����һ����
     */
    public static String ASC2GBK(String str) {
	byte[] bt = str.getBytes();
	int i, l = 0, length = bt.length, j = 0;
	for (i = 0; i < length; i++) {
	    if (bt[i] == 0) {
		l++;
	    }
	}
	byte[] bt2 = new byte[length - l];
	for (i = 0; i < length; i++) {
	    if (bt[i] == 0) {
		i++;
		bt2[j] = bt[i];
	    } else {
		bt2[j] = (byte) (bt[i] | 0x80);
	    }
	    j++;
	}
	String tt = new String(bt2);
	return tt;
    }

    public static String padLeft(String src, String chars, int length) {
	String result = "";
	if (src.length() < length) {
	    for (int i = 0; i < length - src.length(); i++) {
		result += chars;
	    }
	}
	result += src;
	return result;
    }

    public static String padRight(String src, char c, int length) {
	String result = src;
	if (src.length() < length) {
	    for (int i = 0; i < length - src.length(); i++) {
		result += c;
	    }
	}
	return result;
    }

    public static String padRight(String src, String chars, int length) {
	String result = src;
	int srcLen = GetByteLength(src);
	if (srcLen < length) {
	    int I = (length - srcLen) / GetByteLength(chars);
	    for (int i = 0; i < I; i++) {
		result += chars;
	    }
	}
	return result;
    }

    public static String removeRight(String src, String chars) {
	String result = src;
	while (result.substring(result.length() - chars.length()).equals(chars)) {
	    result = result.substring(result.length() - chars.length());
	}
	return result;
    }

    public static String removeLeft(String src, String chars) {
	String result = src;
	while (result.substring(0, chars.length()).equals(chars)) {
	    result = result.substring(chars.length());
	}
	return result;
    }

    public static Object[] copy(Object[] src, Object[] dest) {
	for (int i = 0; i < src.length; i++) {
	    dest[i] = src[i];
	}
	return dest;
    }

    public static Object[] copy(Object[] src, Object[] dest, int start) {
	for (int i = start; i < src.length; i++) {
	    dest[i - start] = src[i];
	}
	return dest;
    }

    public static Object[] copy(Object[] src, Object[] dest, int start, int length) {
	if (src.length < length + start)
	    length = src.length - start;
	for (int i = start; i < length + start; i++) {
	    dest[i - start] = src[i];
	}
	return dest;
    }

    public static Object[] copyPart(Object[] src, Object[] dest, int srcStart, int desStart) {
	for (int i = srcStart; i < src.length; i++) {
	    dest[desStart + i - srcStart] = src[i];
	}
	return dest;
    }

    public static Object[] copyPart(Object[] src, Object[] dest, int srcStart, int length, int desStart) {
	if (src.length < length + srcStart)
	    length = src.length - srcStart;
	for (int i = srcStart; i < length + srcStart; i++) {
	    dest[desStart + i - srcStart] = src[i];
	}
	return dest;
    }

    public static int[] copy(int[] src, int[] dest) {
	for (int i = 0; i < src.length; i++) {
	    dest[i] = src[i];
	}
	return dest;
    }

    public static int[] copy(int[] src, int[] dest, int start) {
	for (int i = start; i < src.length; i++) {
	    dest[i - start] = src[i];
	}
	return dest;
    }

    public static int[] copy(int[] src, int[] dest, int start, int length) {
	if (src.length < length + start)
	    length = src.length - start;
	for (int i = start; i < length + start; i++) {
	    dest[i - start] = src[i];
	}
	return dest;
    }

    public static int[] copyPart(int[] src, int[] dest, int srcStart, int desStart) {
	for (int i = srcStart; i < src.length; i++) {
	    dest[desStart + i - srcStart] = src[i];
	}
	return dest;
    }

    public static int[] copyPart(int[] src, int[] dest, int srcStart, int length, int desStart) {
	if (src.length < length + srcStart)
	    length = src.length - srcStart;
	for (int i = srcStart; i < length + srcStart; i++) {
	    dest[desStart + i - srcStart] = src[i];
	}
	return dest;
    }

    /**
     * ��hashֵ����
     * 
     * @param data
     * @return
     */
    public static long hashsp(String data) {
	byte[] bt = data.getBytes();
	long h = 0;
	for (int i = 0; i < bt.length; i++) {
	    h = (31 * h + (256 + bt[i]) % 256) % 4294967296L;
	}
	return h;
    }

    /**
     * 2.1 PHP�г��ֵ��ַ�Hash���� 0%
     * 
     * @param data
     * @return
     */
    public static long hashpjw(String data) {
	byte[] bt = data.getBytes();
	long h = 0, g = 0;
	for (int i = 0; i < bt.length; i++) {
	    h = ((h << 4) + (256 + bt[i]) % 256) % 4294967296L;
	    if ((g = (h & 0xF0000000)) != 0) {
		h = h ^ (g >> 24);
		h = h ^ g;
	    }
	}
	return h;
    }

    /**
     * 2.3 MySql�г��ֵ��ַ�Hash���� 1%
     * 
     * @param data
     * @return
     */
    public static long calc_hashnr(String data) {
	byte[] bt = data.getBytes();
	long h = 0;
	for (int i = 0; i < bt.length; i++) {
	    h *= 16777619;
	    h = h % 4294967296L;
	    h ^= (256 + bt[i]) % 256;
	}
	return h;
    }

    public static InputStream String2InputStream(String str) {
	ByteArrayInputStream stream = new ByteArrayInputStream(str.getBytes());
	return stream;
    }

    public static String inputStream2String(InputStream is) {
	BufferedReader in = new BufferedReader(new InputStreamReader(is));
	StringBuffer buffer = new StringBuffer();
	String line = "";
	try {
	    while ((line = in.readLine()) != null) {
		buffer.append(line);
	    }
	} catch (IOException e) {
	    e.printStackTrace();
	    return null;
	}
	return buffer.toString();
    }

    public static Date toDate(String date, String dateFormat) {
	try {
	    SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);
	    Date dateTime = null;
	    dateTime = sdf.parse(date);
	    return dateTime;
	} catch (Exception e) {
	    e.printStackTrace();
	    return null;
	}
    }

}
