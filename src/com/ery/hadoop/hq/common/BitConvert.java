package com.ery.hadoop.hq.common;

/**

 */

// int��char��double��byte�໥ת���ĳ���
public class BitConvert {
    // //�����ֽ������ת��
    public static byte[] intToByte(int number) {
	int temp = number;
	byte[] b = new byte[4];
	for (int i = 3; i >= 0; i--) {
	    b[i] = new Integer(temp & 0xff).byteValue();// �����λ���������λ
	    temp = temp >> 8;// ������8λ
	}
	return b;
    }

    // �ֽ����鵽�����ת��
    public static int byteToInt(byte[] b) {
	int s = 0;
	for (int i = 0; i < 3; i++) {
	    if (b[i] >= 0)
		s = s + b[i];
	    else
		s = s + 256 + b[i];
	    s = s * 256;
	}
	if (b[3] >= 0) // ���һ��֮���Բ��ˣ�����Ϊ���ܻ����
	    s = s + b[3];
	else
	    s = s + 256 + b[3];
	return s;
    }

    // �ַ��ֽ�ת��
    public static byte[] charToByte(char ch) {
	int temp = (int) ch;
	byte[] b = new byte[2];
	for (int i = b.length - 1; i > -1; i--) {
	    b[i] = new Integer(temp & 0xff).byteValue();// �����λ���������λ
	    temp = temp >> 8;// ������8λ
	}
	return b;
    }

    // �ֽڵ��ַ�ת��
    public static char byteToChar(byte[] b) {
	int s = 0;
	if (b[0] > 0)
	    s += b[0];
	else
	    s += 256 + b[0];
	s *= 256;
	if (b[1] > 0)
	    s += b[1];
	else
	    s += 256 + b[1];
	char ch = (char) s;
	return ch;
    }

    public static byte[] longTobyte(long l) {
	byte[] b = new byte[8];
	Long temp = l;
	for (int i = b.length - 1; i > -1; i--) {
	    b[i] = new Long(temp & 0xff).byteValue();// �����λ���������λ
	    temp = temp >> 8;// ������8λ
	}
	return b;
    }

    public static long byteToLong(byte[] b) {
	long s = 0;
	for (int i = 0; i < 7; i++) {
	    if (b[i] >= 0)
		s = s + b[i];
	    else
		s = s + 256 + b[i];
	    s = s * 256;
	}
	if (b[7] >= 0) // ���һ��֮���Բ��ˣ�����Ϊ���ܻ����
	    s = s + b[7];
	else
	    s = s + 256 + b[7];
	return s;
    }

    // ���㵽�ֽ�ת��
    public static byte[] doubleToByte(double d) {
	long l = Double.doubleToLongBits(d);
	return longTobyte(l);
    }

    // �ֽڵ�����ת��
    public static double byteToDouble(byte[] b) {
	long l = byteToLong(b);
	return Double.longBitsToDouble(l);
    }
}
