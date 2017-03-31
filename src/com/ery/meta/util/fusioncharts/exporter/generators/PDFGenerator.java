// Decompiled by Jad v1.5.7g. Copyright 2000 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/SiliconValley/Bridge/8617/jad.html
// Decompiler options: packimports(3) fieldsfirst ansi 
// Source File Name:   PDFGenerator.java

package com.ery.meta.util.fusioncharts.exporter.generators;


import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.StringTokenizer;
import java.util.logging.Logger;
import java.util.zip.Deflater;

import com.ery.meta.util.fusioncharts.exporter.beans.ChartMetadata;
import com.ery.meta.util.fusioncharts.exporter.beans.ExportBean;

public class PDFGenerator
{

    private Logger logger;
    int pageIndex;
    @SuppressWarnings({ "rawtypes" })
    ArrayList pagesData;
    @SuppressWarnings({ "rawtypes" })
    static Class class$0; /* synthetic field */

    @SuppressWarnings({ "rawtypes" })
    public PDFGenerator(String data, ChartMetadata metadata)
    {
        logger = Logger.getLogger(com.ery.meta.util.fusioncharts.exporter.generators.PDFGenerator.class.getName());
        pageIndex = 0;
        pagesData = new ArrayList();
        setBitmapData(data, metadata);
    }

    @SuppressWarnings({  "unchecked" })
    public void setBitmapData(String imageData_FCFormat, ChartMetadata metadata)
    {
        ExportBean exportBean = new ExportBean();
        exportBean.setStream(imageData_FCFormat);
        exportBean.setMetadata(metadata);
        pagesData.add(pageIndex, exportBean);
        pageIndex++;
    }

    private byte[] addImageToPDF(int id, boolean isCompressed)
    {
        byte imagePDFBytes[] = (byte[])null;
        ByteArrayOutputStream imagePDFBAOS = new ByteArrayOutputStream();
        try
        {
            int imgObjNo = 6 + id * 3;
            byte bitmapImage[] = getBitmapData24(id);
            byte imgBinary[] = isCompressed ? compress(bitmapImage) : bitmapImage;
            int length = imgBinary.length;
            ChartMetadata metadata = ((ExportBean)pagesData.get(id)).getMetadata();
            String imgObj = imgObjNo + " 0 obj\n<<\n/Subtype /Image /ColorSpace /DeviceRGB /BitsPerComponent 8 /HDPI 72 /VDPI 72 " + (isCompressed ? "/Filter /FlateDecode " : "") + "/Width " + metadata.getWidth() + " /Height " + metadata.getHeight() + " /Length " + length + " >>\nstream\n";
            String imgObj2 = "endstream\nendobj\n";
            imagePDFBAOS.write(imgObj.getBytes());
            imagePDFBAOS.write(imgBinary);
            imagePDFBAOS.write(imgObj2.getBytes());
            imagePDFBytes = imagePDFBAOS.toByteArray();
            imagePDFBAOS.close();
        }
        catch(IOException e)
        {
            logger.severe("Exception while parsing image data for PDF: " + e.toString());
        }
        return imagePDFBytes;
    }

    private byte[] getBitmapData24(int id)
    {
        byte imageData[] = (byte[])null;
        ByteArrayOutputStream imageData24OS = new ByteArrayOutputStream();
        ExportBean exportBean = (ExportBean)pagesData.get(id);
        StringTokenizer rows = new StringTokenizer(exportBean.getStream(), ";");
        logger.info("Parsing image data");
        StringTokenizer pixels = null;
        String pixelData[] = (String[])null;
        String color = null;
        int repeat = 0;
        String bgColor = exportBean.getMetadata().getBgColor();
        if(bgColor == null || bgColor.equals(""))
        {
            exportBean.getMetadata().setBgColor("FFFFFF");
            bgColor = "FFFFFF";
        }
        while(rows.hasMoreElements()) 
            for(pixels = new StringTokenizer((String)rows.nextElement(), ","); pixels.hasMoreElements();)
            {
                pixelData = ((String)pixels.nextElement()).split("_");
                color = pixelData[0];
                repeat = Integer.parseInt(pixelData[1]);
                if(color == null || color.equals(""))
                    color = bgColor;
                if(color.length() < 6)
                    color = "000000".substring(0, 6 - color.length()) + color;
                byte rgbBytes[] = hexToBytes(color);
                byte repeatedBytes[] = repeatBytes(rgbBytes, repeat);
                try
                {
                    imageData24OS.write(repeatedBytes);
                    imageData24OS.flush();
                }
                catch(IOException e)
                {
                    logger.severe("Exception while writing image data for PDF: " + e.toString());
                }
            }

        imageData = imageData24OS.toByteArray();
        try
        {
            imageData24OS.close();
        }
        catch(IOException e)
        {
            logger.severe("Exception while closing stream for PDF: " + e.toString());
        }
        logger.info("Image data parsed successfully");
        return imageData;
    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    public byte[] getPDFObjects(boolean isCompressed)
    {
        logger.info("Creating PDF specific objects.");
        ByteArrayOutputStream PDFBytesOS = new ByteArrayOutputStream();
        byte pdfBytes[] = (byte[])null;
        String strTmpObj = "";
        ArrayList xRefList = new ArrayList();
        xRefList.add(0, "xref\n0 ");
        xRefList.add(1, "0000000000 65535 f \n");
        strTmpObj = "%PDF-1.3\n%{FC}\n";
        try
        {
            PDFBytesOS.write(strTmpObj.getBytes());
            strTmpObj = "1 0 obj<<\n/Author (FusionCharts)\n/Title (FusionCharts)\n/Creator (FusionCharts)\n>>\nendobj\n";
            xRefList.add(calculateXPos(PDFBytesOS.size()));
            PDFBytesOS.write(strTmpObj.getBytes());
            strTmpObj = "2 0 obj\n<< /Type /Catalog /Pages 3 0 R >>\nendobj\n";
            xRefList.add(calculateXPos(PDFBytesOS.size()));
            PDFBytesOS.write(strTmpObj.getBytes());
            strTmpObj = "3 0 obj\n<<  /Type /Pages /Kids [";
            for(int i = 0; i < pageIndex; i++)
                strTmpObj = strTmpObj + ((i + 1) * 3 + 1) + " 0 R\n";

            strTmpObj = strTmpObj + "] /Count " + pageIndex + " >>\nendobj\n";
            xRefList.add(calculateXPos(PDFBytesOS.size()));
            PDFBytesOS.write(strTmpObj.getBytes());
            ChartMetadata metadata = null;
            logger.info("Gathering data for  each page");
            for(int itr = 0; itr < pageIndex; itr++)
            {
                metadata = ((ExportBean)pagesData.get(itr)).getMetadata();
                int iWidth = metadata.getWidth();
                int iHeight = metadata.getHeight();
                strTmpObj = ((itr + 2) * 3 - 2) + " 0 obj\n<<\n/Type /Page /Parent 3 0 R \n/MediaBox [ 0 0 " + iWidth + " " + iHeight + " ]\n/Resources <<\n/ProcSet [ /PDF ]\n/XObject <</R" + (itr + 1) + " " + (itr + 2) * 3 + " 0 R>>\n>>\n/Contents [ " + ((itr + 2) * 3 - 1) + " 0 R ]\n>>\nendobj\n";
                xRefList.add(calculateXPos(PDFBytesOS.size()));
                PDFBytesOS.write(strTmpObj.getBytes());
                xRefList.add(calculateXPos(PDFBytesOS.size()));
                PDFBytesOS.write(getXObjResource(itr).getBytes());
                byte imgPDFBytes[] = addImageToPDF(itr, isCompressed);
                xRefList.add(calculateXPos(PDFBytesOS.size()));
                PDFBytesOS.write(imgPDFBytes);
            }

            String xRef0 = (String)xRefList.get(0) + (xRefList.size() - 1) + "\n";
            xRefList.set(0, xRef0);
            String trailer = getTrailer(PDFBytesOS.size(), xRefList.size() - 1);
            PDFBytesOS.write(arrayToString(xRefList, "").getBytes());
            PDFBytesOS.write(trailer.getBytes());
            String EOF = "%%EOF\n";
            PDFBytesOS.write(EOF.getBytes());
            pdfBytes = PDFBytesOS.toByteArray();
            logger.info("PDF data created successfully");
        }
        catch(IOException e)
        {
            logger.severe("Exception while writing PDF data: " + e.toString());
        }
        return pdfBytes;
    }

    @SuppressWarnings({ "rawtypes" })
    private String arrayToString(ArrayList a, String separator)
    {
        StringBuffer result = new StringBuffer();
        if(a.size() > 0)
        {
            result.append((String)a.get(0));
            for(int i = 1; i < a.size(); i++)
            {
                result.append(separator);
                result.append((String)a.get(i));
            }

        }
        return result.toString();
    }

    private String getXObjResource(int itr)
    {
        ChartMetadata metadata = ((ExportBean)pagesData.get(itr)).getMetadata();
        return ((itr + 2) * 3 - 1) + " 0 obj\n<< /Length " + (24 + ("" + metadata.getWidth() + metadata.getHeight()).length()) + " >>\nstream\nq\n" + metadata.getWidth() + " 0 0 " + metadata.getHeight() + " 0 0 cm\n/R" + (itr + 1) + " Do\nQ\nendstream\nendobj\n";
    }

    private String calculateXPos(int posn)
    {
        String paddedStr = "0000000000".substring(0, 10 - String.valueOf(posn).length()) + posn;
        return paddedStr + " 00000 n \n";
    }

    private String getTrailer(int xrefpos, int numxref)
    {
        return "trailer\n<<\n/Size " + numxref + "\n/Root 2 0 R\n/Info 1 0 R\n>>\nstartxref\n" + xrefpos + "\n";
    }

    private byte[] compress(byte data[])
    {
        logger.info("Compressing the image data");
        byte compressedData[] = (byte[])null;
        Deflater compressor = new Deflater();
        compressor.setLevel(9);
        compressor.setInput(data);
        compressor.finish();
        ByteArrayOutputStream bos = new ByteArrayOutputStream(data.length);
        byte buf[] = new byte[1024];
        int count;
        for(; !compressor.finished(); bos.write(buf, 0, count))
            count = compressor.deflate(buf);

        try
        {
            bos.close();
        }
        catch(IOException ioexception) { }
        compressedData = bos.toByteArray();
        logger.info("Image data compressed");
        return compressedData;
    }

    private byte[] hexToBytes(String hex)
    {
        return hexToBytes(hex.toCharArray());
    }

    private byte[] hexToBytes(char hex[])
    {
        int length = 3;
        byte raw[] = new byte[length];
        for(int i = 0; i < length; i++)
        {
            int high = Character.digit(hex[i * 2], 16);
            int low = Character.digit(hex[i * 2 + 1], 16);
            int value = high << 4 | low;
            raw[i] = (byte)((value & 0xff) > 127 ? value - 256 : value);
        }

        return raw;
    }

    private byte[] repeatBytes(byte bytes[], int repeat)
    {
        byte repeatedBytes[] = new byte[bytes.length * repeat];
        int counter = 0;
        for(int i = 0; i < repeat; i++)
        {
            for(int j = 0; j < bytes.length; j++)
                repeatedBytes[counter++] = bytes[j];

        }

        return repeatedBytes;
    }
}
